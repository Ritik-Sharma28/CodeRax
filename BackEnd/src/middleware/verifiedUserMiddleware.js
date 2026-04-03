import { isUserVerified } from "../utils/authPayload.js";

export const verifiedUserMiddleware = async (req, res, next) => {
    try {
        if (!req.result) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (req.result.role === "admin" || isUserVerified(req.result)) {
            return next();
        }

        return res.status(403).json({
            error: "verification_required",
            message: "Verify your email to unlock AI features.",
            emailId: req.result.emailId,
        });
    } catch (error) {
        console.error("verifiedUserMiddleware error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
