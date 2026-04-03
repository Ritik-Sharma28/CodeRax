import bcrypt from "bcrypt";
import { redisClient } from "../config/redis.js";

const OTP_TTL_SECONDS = Number(process.env.OTP_TTL_SECONDS || 600);
const OTP_RESEND_COOLDOWN_SECONDS = Number(process.env.OTP_RESEND_COOLDOWN_SECONDS || 60);
const OTP_MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS || 5);
const OTP_LENGTH = 6;

const pendingKey = (scope, emailId) => `auth:${scope}:${String(emailId || "").trim().toLowerCase()}`;
const rateKey = (scope, value) => `auth:rate:${scope}:${value}`;

export const normalizeEmail = (emailId = "") => String(emailId).trim().toLowerCase();

export const buildOtpCode = () =>
    Array.from({ length: OTP_LENGTH }, () => Math.floor(Math.random() * 10)).join("");

export const hashOtp = async (otp) => bcrypt.hash(otp, 10);

export const compareOtp = async (otp, hash) => {
    if (!otp || !hash) return false;
    return bcrypt.compare(otp, hash);
};

const readPendingSession = async (scope, emailId) => {
    if (!redisClient.isReady) return null;

    const raw = await redisClient.get(pendingKey(scope, emailId));
    if (!raw) return null;

    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
};

const writePendingSession = async (scope, emailId, payload, unavailableMessage) => {
    if (!redisClient.isReady) {
        throw new Error(unavailableMessage);
    }

    await redisClient.setEx(
        pendingKey(scope, emailId),
        OTP_TTL_SECONDS,
        JSON.stringify(payload)
    );
};

const clearPendingSession = async (scope, emailId) => {
    if (!redisClient.isReady) return;
    await redisClient.del(pendingKey(scope, emailId));
};

export const getPendingSignup = async (emailId) => readPendingSession("pending-signup", emailId);

export const setPendingSignup = async (emailId, payload) =>
    writePendingSession("pending-signup", emailId, payload, "OTP verification is temporarily unavailable. Please try again shortly.");

export const deletePendingSignup = async (emailId) => clearPendingSession("pending-signup", emailId);

export const getPendingReset = async (emailId) => readPendingSession("pending-reset", emailId);

export const setPendingReset = async (emailId, payload) =>
    writePendingSession("pending-reset", emailId, payload, "Password reset is temporarily unavailable. Please try again shortly.");

export const deletePendingReset = async (emailId) => clearPendingSession("pending-reset", emailId);

export const getOtpMeta = () => ({
    ttlSeconds: OTP_TTL_SECONDS,
    resendCooldownSeconds: OTP_RESEND_COOLDOWN_SECONDS,
    maxAttempts: OTP_MAX_ATTEMPTS,
});

const buildPendingOtpPayload = async (inputPayload) => {
    const otp = buildOtpCode();
    const now = Date.now();

    return {
        otp,
        payload: {
            ...inputPayload,
            emailId: normalizeEmail(inputPayload.emailId),
            attemptCount: 0,
            createdAt: now,
            expiresAt: now + OTP_TTL_SECONDS * 1000,
            resendAvailableAt: now + OTP_RESEND_COOLDOWN_SECONDS * 1000,
            otpHash: await hashOtp(otp),
        },
    };
};

export const createPendingSignupPayload = async ({
    firstName,
    lastName = "",
    emailId,
    passwordHash,
    existingUserId = "",
}) =>
    buildPendingOtpPayload({
        firstName,
        lastName,
        emailId,
        passwordHash,
        existingUserId,
    });

export const createPendingResetPayload = async ({ emailId, userId }) =>
    buildPendingOtpPayload({
        emailId,
        userId,
    });

export const rotatePendingSignupOtp = async (pendingSignup) => {
    const otp = buildOtpCode();
    const now = Date.now();

    return {
        otp,
        payload: {
            ...pendingSignup,
            attemptCount: 0,
            expiresAt: now + OTP_TTL_SECONDS * 1000,
            resendAvailableAt: now + OTP_RESEND_COOLDOWN_SECONDS * 1000,
            otpHash: await hashOtp(otp),
        },
    };
};

export const rotatePendingResetOtp = async (pendingReset) => {
    const otp = buildOtpCode();
    const now = Date.now();

    return {
        otp,
        payload: {
            ...pendingReset,
            attemptCount: 0,
            expiresAt: now + OTP_TTL_SECONDS * 1000,
            resendAvailableAt: now + OTP_RESEND_COOLDOWN_SECONDS * 1000,
            otpHash: await hashOtp(otp),
        },
    };
};

export const consumeOtpAttempt = async (emailId, pendingSignup, isValid) => {
    const nextPayload = {
        ...pendingSignup,
        attemptCount: isValid ? pendingSignup.attemptCount : Number(pendingSignup.attemptCount || 0) + 1,
    };

    if (!isValid && nextPayload.attemptCount >= OTP_MAX_ATTEMPTS) {
        await deletePendingSignup(emailId);
        return { locked: true, payload: null };
    }

    await setPendingSignup(emailId, nextPayload);
    return { locked: false, payload: nextPayload };
};

export const consumeResetOtpAttempt = async (emailId, pendingReset, isValid) => {
    const nextPayload = {
        ...pendingReset,
        attemptCount: isValid ? pendingReset.attemptCount : Number(pendingReset.attemptCount || 0) + 1,
    };

    if (!isValid && nextPayload.attemptCount >= OTP_MAX_ATTEMPTS) {
        await deletePendingReset(emailId);
        return { locked: true, payload: null };
    }

    await setPendingReset(emailId, nextPayload);
    return { locked: false, payload: nextPayload };
};

export const rateLimitAction = async ({ scope, value, limit, windowSeconds }) => {
    if (!redisClient.isReady || !value) {
        return { allowed: true, retryAfterSeconds: 0 };
    }

    const key = rateKey(scope, value);
    const current = await redisClient.incr(key);

    if (current === 1) {
        await redisClient.expire(key, windowSeconds);
    }

    if (current > limit) {
        const retryAfterSeconds = await redisClient.ttl(key);
        return {
            allowed: false,
            retryAfterSeconds: retryAfterSeconds > 0 ? retryAfterSeconds : windowSeconds,
        };
    }

    return { allowed: true, retryAfterSeconds: 0 };
};
