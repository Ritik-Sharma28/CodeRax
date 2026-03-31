import { validate } from "../utils/validate.js";
import User from "../models/user.js";
import { Submission } from "../models/submission.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { redisClient } from "../config/redis.js"
import { resetLimitsIfNewDay } from "../utils/rateLimits.js";

const isProduction = process.env.NODE_ENV === "production";

const buildAuthCookieOptions = (maxAge) => ({
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
    maxAge
});

export const register = async (req, res) => {
    try {

        validate(req.body)
        const { firstName, emailId, password } = req.body;

        req.body.password = await bcrypt.hash(password, 10)
        req.body.role = "user"


        const user = await User.create(req.body)

        const token = jwt.sign({ emailId, _id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: 60 * 60 * 24 })
        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id,
            role: user.role,
            profilePicture: user.profilePicture,
            rating: user.rating,
            rank: user.rank,
            mockInterviewUseLeft: user.mockInterviewUseLeft,
            aiChatMsgsLeft: user.aiChatMsgsLeft,
            revisionMsgsLeft: user.revisionMsgsLeft,
        }
        res.cookie("token", token, buildAuthCookieOptions(60 * 60 * 1000))

        res.status(201).json({
            user: reply,
            message: "Loggin Successfully"
        })
    } catch (err) {
        res.status(400).json({
            message: err?.message || "Registration failed",
        });
    }
}

export const login = async (req, res) => {
    try {
        const { emailId, password } = req.body;

        const user = await User.findOne({ emailId })
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        try { await resetLimitsIfNewDay(user); } catch (e) { console.error("resetLimitsIfNewDay failed during login:", e); }

        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id,
            role: user.role,
            profilePicture: user.profilePicture,
            rating: user.rating,
            rank: user.rank,
            mockInterviewUseLeft: user.mockInterviewUseLeft,
            aiChatMsgsLeft: user.aiChatMsgsLeft,
            revisionMsgsLeft: user.revisionMsgsLeft,
        }

        const token = jwt.sign({ _id: user._id, emailId: emailId, role: user.role }, process.env.JWT_SECRET, { expiresIn: 60 * 60 });
        res.cookie('token', token, buildAuthCookieOptions(60 * 60 * 1000));
        res.status(201).json({
            user: reply,
            message: "Loggin Successfully"
        })
    } catch (err) {
        console.error("Login error:", err);
        res.status(400).json({ message: "Something went wrong. Please try again." });
    }
}

export const logout = async (req, res) => {
    try {
        const token = req.cookies.token
        const payload = token ? jwt.decode(token) : null

        if (token && payload?.exp && redisClient.isReady) {
            await redisClient.expireAt(`token:${token}`, payload.exp);
            await redisClient.set(`token:${token}`, "blocked")
        }

        res.cookie("token", "", {
            ...buildAuthCookieOptions(0),
            expires: new Date(0)
        });
        res.status(200).send("Logout successful")
    } catch (err) {
        res.status(503).send("Error: " + err);
    }
}

export const deleteProfile = async (req, res) => {

    try {

        const userId = req.result._id;


        await User.findByIdAndDelete(userId);

        // Submission se bhi delete karo...

        await Submission.deleteMany({ userId });

        res.status(200).send("Deleted Successfully");

    }
    catch (err) {

        res.status(500).send("Internal Server Error");
    }
}

export const adminRegister = async (req, res) => {
    try {
        if (req.result.role !== "admin")
            throw new Error("Invalid Credentials")
        console.log(req.body)
        validate(req.body)
        const { firstName, emailId, password } = req.body;

        req.body.password = await bcrypt.hash(password, 10)

        const user = await User.create(req.body)

        const token = jwt.sign({ emailId, _id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: 60 * 60 * 24 })
        res.cookie("token", token, buildAuthCookieOptions(60 * 60 * 1000))

        res.status(201).send("user register successfully")
    } catch (error) {
        res.status(400).send("Error: " + error);
    }
}

export const check = async (req, res) => {
    try {
        await resetLimitsIfNewDay(req.result);

        const reply = {
            firstName: req.result.firstName,
            emailId: req.result.emailId,
            _id: req.result._id,
            role: req.result.role,
            profilePicture: req.result.profilePicture,
            rating: req.result.rating,
            rank: req.result.rank,
            mockInterviewUseLeft: req.result.mockInterviewUseLeft,
            aiChatMsgsLeft: req.result.aiChatMsgsLeft,
            revisionMsgsLeft: req.result.revisionMsgsLeft,
        }

        res.status(200).json({
            user: reply,
            message: "Valid User"
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to verify auth" });
    }
}
