import User from "../models/user.js";
import { resetLimitsIfNewDay } from "../utils/rateLimits.js";

export const rateLimitMiddleware = (feature) => async (req, res, next) => {
    try {
        const user = await User.findById(req.result._id);
        if (!user) return res.status(401).json({ message: "Invalid user." });
        
        // Skip limits for admins
        if (user.role === 'admin') {
            return next();
        }

        await resetLimitsIfNewDay(user);

        if (feature === 'mockInterview') {
            if (user.mockInterviewUseLeft <= 0) {
                return res.status(403).json({ error: 'limit_reached', message: "Your todays limit reached for mock AI interview" });
            }
            // we do NOT decrement here to prevent decrementing on token errors or unverified requests.
            // We'll let the controller do the decrement when successful.
        } else if (feature === 'aiChat') {
            if (user.aiChatMsgsLeft <= 0) {
                return res.status(200).json({ reply: "Your todays limit reached for messaging in AI chat" });
            }
        } else if (feature === 'revisionChat') {
            if (user.revisionMsgsLeft <= 0) {
                return res.status(200).json({ reply: "Your todays limit reached for messaging in Revision chat" });
            }
        }
        
        next();
    } catch (err) {
        console.error("Rate limit middleware error:", err);
        return res.status(500).json({ error: "Internal Server Error checking rate limits." });
    }
};
