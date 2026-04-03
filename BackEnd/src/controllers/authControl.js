import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/user.js";
import { Submission } from "../models/submission.js";
import { redisClient } from "../config/redis.js";
import { validate } from "../utils/validate.js";
import { validateStrongPassword } from "../utils/validate.js";
import { resetLimitsIfNewDay } from "../utils/rateLimits.js";
import { buildAuthReply, getAuthProvider, isUserVerified } from "../utils/authPayload.js";
import {
    compareOtp,
    consumeResetOtpAttempt,
    consumeOtpAttempt,
    createPendingResetPayload,
    createPendingSignupPayload,
    deletePendingReset,
    deletePendingSignup,
    getOtpMeta,
    getPendingReset,
    getPendingSignup,
    normalizeEmail,
    rotatePendingResetOtp,
    rotatePendingSignupOtp,
    setPendingReset,
    setPendingSignup,
} from "../utils/otpAuth.js";
import { sendOtpEmail } from "../utils/authMailer.js";

const isProduction = process.env.NODE_ENV === "production";
const googleClient = process.env.GOOGLE_CLIENT_ID
    ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
    : null;

const buildAuthCookieOptions = (maxAge) => ({
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
    maxAge,
});

const signToken = (user, expiresIn = 60 * 60) =>
    jwt.sign(
        { _id: user._id, emailId: user.emailId, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn }
    );

const normalizeUserAccount = async (user) => {
    const next = {};

    if (user.role === "admin" && user.verified !== true) {
        next.verified = true;
    }

    if (!user.authProvider) {
        next.authProvider = getAuthProvider(user);
    }

    if (Object.keys(next).length > 0) {
        Object.assign(user, next);
        await user.save();
    }

    return user;
};

const finalizeLogin = async (res, user, expiresIn = 60 * 60) => {
    const token = signToken(user, expiresIn);
    res.cookie("token", token, buildAuthCookieOptions(60 * 60 * 1000));

    return res.status(200).json({
        user: buildAuthReply(user),
        message: "Logged in successfully",
    });
};

const buildOptionalLastName = (lastName) => {
    const normalized = String(lastName || "").trim();
    return normalized ? { lastName: normalized } : {};
};

const createPendingSignupFromExistingUser = async (user, { sendEmail = true } = {}) => {
    const { otp, payload } = await createPendingSignupPayload({
        firstName: user.firstName,
        lastName: user.lastName || "",
        emailId: user.emailId,
        passwordHash: user.password,
        existingUserId: String(user._id),
    });

    await setPendingSignup(user.emailId, payload);
    if (sendEmail) {
        await sendOtpEmail({ emailId: user.emailId, firstName: user.firstName, otp });
    }
    return payload;
};

const buildForgotPasswordReply = () => ({
    resetRequested: true,
    message: "If the account exists, a password reset code has been sent.",
});

const createPendingResetForUser = async (user, { sendEmail = true } = {}) => {
    const { otp, payload } = await createPendingResetPayload({
        emailId: user.emailId,
        userId: String(user._id),
    });

    await setPendingReset(user.emailId, payload);

    if (sendEmail) {
        await sendOtpEmail({ emailId: user.emailId, firstName: user.firstName, otp });
    }

    return payload;
};

export const register = async (req, res) => {
    try {
        validate(req.body);

        const firstName = String(req.body.firstName || "").trim();
        const lastName = String(req.body.lastName || "").trim();
        const emailId = normalizeEmail(req.body.emailId);
        const existingUser = await User.findOne({ emailId });

        if (existingUser) {
            await normalizeUserAccount(existingUser);

            if (existingUser.googleId && !existingUser.password) {
                return res.status(409).json({
                    error: "account_exists_google",
                    message: "This email is already registered with Google sign-in.",
                });
            }

            return res.status(409).json({
                error: "account_exists",
                message: "An account already exists for this email. Please log in instead.",
            });
        }

        const passwordHash = await bcrypt.hash(req.body.password, 10);
        const { otp, payload } = await createPendingSignupPayload({
            firstName,
            lastName,
            emailId,
            passwordHash,
        });

        await setPendingSignup(emailId, payload);
        await sendOtpEmail({ emailId, firstName, otp });

        return res.status(200).json({
            verificationRequired: true,
            emailId,
            resendAvailableAt: payload.resendAvailableAt,
            expiresAt: payload.expiresAt,
            message: "Verification code sent to your email.",
        });
    } catch (err) {
        console.error("Register error:", err);
        return res.status(400).json({
            message: err?.message || "Registration failed",
        });
    }
};

export const verifyOtp = async (req, res) => {
    try {
        const emailId = normalizeEmail(req.body?.emailId);
        const otp = String(req.body?.otp || "").trim();

        if (!emailId || !otp) {
            return res.status(400).json({
                error: "invalid_request",
                message: "Email and OTP are required.",
            });
        }

        const pendingSignup = await getPendingSignup(emailId);
        if (!pendingSignup) {
            return res.status(400).json({
                error: "otp_missing",
                message: "Verification session expired. Please sign up again.",
            });
        }

        if (Date.now() > Number(pendingSignup.expiresAt || 0)) {
            await deletePendingSignup(emailId);
            return res.status(400).json({
                error: "otp_expired",
                message: "Verification code expired. Please request a new one.",
            });
        }

        const isValid = await compareOtp(otp, pendingSignup.otpHash);
        const attemptResult = await consumeOtpAttempt(emailId, pendingSignup, isValid);

        if (!isValid) {
            if (attemptResult.locked) {
                return res.status(429).json({
                    error: "otp_locked",
                    message: "Too many invalid attempts. Please start again.",
                });
            }

            return res.status(400).json({
                error: "otp_invalid",
                message: "Invalid verification code.",
                attemptsLeft: Math.max(0, getOtpMeta().maxAttempts - (attemptResult.payload?.attemptCount || 0)),
            });
        }

        let user = null;

        if (pendingSignup.existingUserId) {
            user = await User.findById(pendingSignup.existingUserId);
            if (!user) {
                await deletePendingSignup(emailId);
                return res.status(404).json({
                    error: "account_missing",
                    message: "Unable to finish verification. Please contact support.",
                });
            }

            user.verified = true;
            if (!user.authProvider) user.authProvider = "local";
            await user.save();
        } else {
            user = await User.create({
                firstName: pendingSignup.firstName,
                ...buildOptionalLastName(pendingSignup.lastName),
                emailId,
                password: pendingSignup.passwordHash,
                role: "user",
                verified: true,
                authProvider: "local",
            });
        }

        await deletePendingSignup(emailId);
        await normalizeUserAccount(user);
        return finalizeLogin(res, user);
    } catch (err) {
        console.error("verifyOtp error:", err);
        return res.status(500).json({
            error: "otp_verify_failed",
            message: "Unable to verify the code right now.",
        });
    }
};

export const resendOtp = async (req, res) => {
    try {
        const emailId = normalizeEmail(req.body?.emailId);
        if (!emailId) {
            return res.status(400).json({
                error: "invalid_request",
                message: "Email is required.",
            });
        }

        let pendingSignup = await getPendingSignup(emailId);

        if (!pendingSignup) {
            const existingUser = await User.findOne({ emailId });
            if (existingUser && existingUser.role !== "admin" && existingUser.verified === false && existingUser.password) {
                pendingSignup = await createPendingSignupFromExistingUser(existingUser);
                return res.status(200).json({
                    verificationRequired: true,
                    emailId,
                    resendAvailableAt: pendingSignup.resendAvailableAt,
                    expiresAt: pendingSignup.expiresAt,
                    message: "A new verification code has been sent.",
                });
            } else {
                return res.status(400).json({
                    error: "otp_missing",
                    message: "Verification session expired. Please sign up again.",
                });
            }
        }

        if (Date.now() < Number(pendingSignup.resendAvailableAt || 0)) {
            return res.status(429).json({
                error: "otp_cooldown",
                message: "Please wait before requesting another code.",
                resendAvailableAt: pendingSignup.resendAvailableAt,
            });
        }

        const rotated = await rotatePendingSignupOtp(pendingSignup);
        await setPendingSignup(emailId, rotated.payload);
        await sendOtpEmail({ emailId, firstName: rotated.payload.firstName, otp: rotated.otp });

        return res.status(200).json({
            verificationRequired: true,
            emailId,
            resendAvailableAt: rotated.payload.resendAvailableAt,
            expiresAt: rotated.payload.expiresAt,
            message: "A new verification code has been sent.",
        });
    } catch (err) {
        console.error("resendOtp error:", err);
        return res.status(500).json({
            error: "otp_resend_failed",
            message: "Unable to resend the code right now.",
        });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const emailId = normalizeEmail(req.body?.emailId);

        if (!emailId) {
            return res.status(400).json({
                error: "invalid_request",
                message: "Email is required.",
            });
        }

        const user = await User.findOne({ emailId });

        if (!user) {
            return res.status(200).json(buildForgotPasswordReply());
        }

        await normalizeUserAccount(user);

        if (!user.password) {
            return res.status(400).json({
                error: "google_signin_required",
                message: "This account uses Google sign-in. Please continue with Google.",
            });
        }

        const pendingReset = await createPendingResetForUser(user);

        return res.status(200).json({
            ...buildForgotPasswordReply(),
            emailId,
            resendAvailableAt: pendingReset.resendAvailableAt,
            expiresAt: pendingReset.expiresAt,
        });
    } catch (err) {
        console.error("forgotPassword error:", err);
        return res.status(500).json({
            error: "forgot_password_failed",
            message: "Unable to start password reset right now.",
        });
    }
};

export const verifyResetOtp = async (req, res) => {
    try {
        const emailId = normalizeEmail(req.body?.emailId);
        const otp = String(req.body?.otp || "").trim();
        const password = String(req.body?.password || "");

        if (!emailId || !otp || !password) {
            return res.status(400).json({
                error: "invalid_request",
                message: "Email, OTP, and new password are required.",
            });
        }

        validateStrongPassword(password);

        const pendingReset = await getPendingReset(emailId);
        if (!pendingReset) {
            return res.status(400).json({
                error: "otp_missing",
                message: "Password reset session expired. Please start again.",
            });
        }

        if (Date.now() > Number(pendingReset.expiresAt || 0)) {
            await deletePendingReset(emailId);
            return res.status(400).json({
                error: "otp_expired",
                message: "Reset code expired. Please request a new one.",
            });
        }

        const isValid = await compareOtp(otp, pendingReset.otpHash);
        const attemptResult = await consumeResetOtpAttempt(emailId, pendingReset, isValid);

        if (!isValid) {
            if (attemptResult.locked) {
                return res.status(429).json({
                    error: "otp_locked",
                    message: "Too many invalid attempts. Please start again.",
                });
            }

            return res.status(400).json({
                error: "otp_invalid",
                message: "Invalid reset code.",
                attemptsLeft: Math.max(0, getOtpMeta().maxAttempts - (attemptResult.payload?.attemptCount || 0)),
            });
        }

        const user = await User.findById(pendingReset.userId);
        if (!user) {
            await deletePendingReset(emailId);
            return res.status(404).json({
                error: "account_missing",
                message: "Unable to reset password for this account.",
            });
        }

        if (!user.password) {
            await deletePendingReset(emailId);
            return res.status(400).json({
                error: "google_signin_required",
                message: "This account uses Google sign-in. Please continue with Google.",
            });
        }

        user.password = await bcrypt.hash(password, 10);
        await user.save();
        await deletePendingReset(emailId);

        return res.status(200).json({
            passwordReset: true,
            message: "Password reset successful. Please log in with your new password.",
        });
    } catch (err) {
        console.error("verifyResetOtp error:", err);
        return res.status(500).json({
            error: "reset_verify_failed",
            message: "Unable to reset password right now.",
        });
    }
};

export const resendResetOtp = async (req, res) => {
    try {
        const emailId = normalizeEmail(req.body?.emailId);

        if (!emailId) {
            return res.status(400).json({
                error: "invalid_request",
                message: "Email is required.",
            });
        }

        let pendingReset = await getPendingReset(emailId);

        if (!pendingReset) {
            const user = await User.findOne({ emailId });
            if (!user) {
                return res.status(200).json(buildForgotPasswordReply());
            }

            await normalizeUserAccount(user);

            if (!user.password) {
                return res.status(400).json({
                    error: "google_signin_required",
                    message: "This account uses Google sign-in. Please continue with Google.",
                });
            }

            pendingReset = await createPendingResetForUser(user);

            return res.status(200).json({
                ...buildForgotPasswordReply(),
                emailId,
                resendAvailableAt: pendingReset.resendAvailableAt,
                expiresAt: pendingReset.expiresAt,
            });
        }

        if (Date.now() < Number(pendingReset.resendAvailableAt || 0)) {
            return res.status(429).json({
                error: "otp_cooldown",
                message: "Please wait before requesting another code.",
                resendAvailableAt: pendingReset.resendAvailableAt,
            });
        }

        const rotated = await rotatePendingResetOtp(pendingReset);
        await setPendingReset(emailId, rotated.payload);

        const user = await User.findById(rotated.payload.userId);
        await sendOtpEmail({ emailId, firstName: user?.firstName, otp: rotated.otp });

        return res.status(200).json({
            ...buildForgotPasswordReply(),
            emailId,
            resendAvailableAt: rotated.payload.resendAvailableAt,
            expiresAt: rotated.payload.expiresAt,
        });
    } catch (err) {
        console.error("resendResetOtp error:", err);
        return res.status(500).json({
            error: "reset_resend_failed",
            message: "Unable to resend the reset code right now.",
        });
    }
};

export const googleLogin = async (req, res) => {
    try {
        const credential = String(req.body?.credential || "").trim();
        if (!credential) {
            return res.status(400).json({
                error: "invalid_request",
                message: "Google credential is required.",
            });
        }

        if (!googleClient) {
            return res.status(500).json({
                error: "google_not_configured",
                message: "Google sign-in is not configured.",
            });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const emailId = normalizeEmail(payload?.email);
        const googleId = String(payload?.sub || "");

        if (!emailId || !googleId || payload?.email_verified === false) {
            return res.status(400).json({
                error: "google_invalid",
                message: "Unable to verify your Google account.",
            });
        }

        let user = await User.findOne({ emailId });

        if (!user) {
            user = await User.create({
                firstName: String(payload?.given_name || payload?.name || "Coder").trim(),
                ...buildOptionalLastName(payload?.family_name),
                emailId,
                role: "user",
                googleId,
                authProvider: "google",
                verified: true,
                profilePicture: String(payload?.picture || ""),
            });
        } else {
            await normalizeUserAccount(user);

            user.googleId = googleId;
            if (!user.profilePicture && payload?.picture) {
                user.profilePicture = String(payload.picture);
            }
            if (!user.firstName && payload?.given_name) {
                user.firstName = String(payload.given_name).trim();
            }
            user.verified = true;
            user.authProvider = user.password ? "hybrid" : "google";
            await user.save();
        }

        await deletePendingSignup(emailId);
        try { await resetLimitsIfNewDay(user); } catch (e) { console.error("resetLimitsIfNewDay failed during Google login:", e); }
        return finalizeLogin(res, user);
    } catch (err) {
        console.error("googleLogin error:", err);
        return res.status(400).json({
            error: "google_login_failed",
            message: "Unable to continue with Google right now.",
        });
    }
};

export const login = async (req, res) => {
    try {
        const emailId = normalizeEmail(req.body?.emailId);
        const password = String(req.body?.password || "");

        const user = await User.findOne({ emailId });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        await normalizeUserAccount(user);

        if (!user.password) {
            return res.status(400).json({
                error: "google_signin_required",
                message: "This account uses Google sign-in. Please continue with Google.",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        if (user.role !== "admin" && user.verified === false) {
            let pendingSignup = await getPendingSignup(user.emailId);

            if (!pendingSignup) {
                pendingSignup = await createPendingSignupFromExistingUser(user);
            } else if (Date.now() >= Number(pendingSignup.resendAvailableAt || 0)) {
                const rotated = await rotatePendingSignupOtp(pendingSignup);
                await setPendingSignup(user.emailId, rotated.payload);
                await sendOtpEmail({ emailId: user.emailId, firstName: user.firstName, otp: rotated.otp });
                pendingSignup = rotated.payload;
            }

            return res.status(403).json({
                error: "verification_required",
                message: "Verify your email to unlock AI features.",
                emailId: user.emailId,
                resendAvailableAt: pendingSignup.resendAvailableAt,
            });
        }

        try { await resetLimitsIfNewDay(user); } catch (e) { console.error("resetLimitsIfNewDay failed during login:", e); }
        return finalizeLogin(res, user);
    } catch (err) {
        console.error("Login error:", err);
        return res.status(400).json({ message: "Something went wrong. Please try again." });
    }
};

export const logout = async (req, res) => {
    try {
        const token = req.cookies.token;
        const payload = token ? jwt.decode(token) : null;

        if (token && payload?.exp && redisClient.isReady) {
            await redisClient.expireAt(`token:${token}`, payload.exp);
            await redisClient.set(`token:${token}`, "blocked");
        }

        res.cookie("token", "", {
            ...buildAuthCookieOptions(0),
            expires: new Date(0),
        });
        res.status(200).send("Logout successful");
    } catch (err) {
        res.status(503).send("Error: " + err);
    }
};

export const deleteProfile = async (req, res) => {
    try {
        const userId = req.result._id;

        await User.findByIdAndDelete(userId);
        await Submission.deleteMany({ userId });

        res.status(200).send("Deleted Successfully");
    } catch (err) {
        res.status(500).send("Internal Server Error");
    }
};

export const adminRegister = async (req, res) => {
    try {
        if (req.result.role !== "admin") throw new Error("Invalid Credentials");

        validate(req.body);
        const emailId = normalizeEmail(req.body.emailId);
        const password = await bcrypt.hash(req.body.password, 10);

        const user = await User.create({
            ...req.body,
            emailId,
            password,
            verified: true,
            authProvider: "local",
        });

        const token = signToken(user, 60 * 60 * 24);
        res.cookie("token", token, buildAuthCookieOptions(60 * 60 * 1000));

        res.status(201).send("user register successfully");
    } catch (error) {
        res.status(400).send("Error: " + error);
    }
};

export const check = async (req, res) => {
    try {
        await normalizeUserAccount(req.result);
        await resetLimitsIfNewDay(req.result);

        res.status(200).json({
            user: buildAuthReply(req.result),
            message: "Valid User",
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to verify auth" });
    }
};
