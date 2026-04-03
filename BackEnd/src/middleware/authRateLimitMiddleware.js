import { rateLimitAction } from "../utils/otpAuth.js";

const ipWindowSeconds = Number(process.env.AUTH_RATE_LIMIT_WINDOW_SECONDS || 300);
const perIpLimit = Number(process.env.AUTH_RATE_LIMIT_PER_IP || 3);
const perEmailLimit = Number(process.env.AUTH_RATE_LIMIT_PER_EMAIL || 3);

const normalizeIp = (req) =>
    String(req.headers["x-forwarded-for"] || req.ip || "unknown")
        .split(",")[0]
        .trim();

export const authRateLimitMiddleware = (scope, { includeEmail = true } = {}) => async (req, res, next) => {
    try {
        const emailId = req.body?.emailId ? String(req.body.emailId).trim().toLowerCase() : "";
        const ip = normalizeIp(req);

        const ipResult = await rateLimitAction({
            scope: `${scope}:ip`,
            value: ip,
            limit: perIpLimit,
            windowSeconds: ipWindowSeconds,
        });

        if (!ipResult.allowed) {
            return res.status(429).json({
                error: "rate_limited",
                message: "Too many attempts. Please wait before trying again.",
                retryAfterSeconds: ipResult.retryAfterSeconds,
            });
        }

        if (includeEmail && emailId) {
            const emailResult = await rateLimitAction({
                scope: `${scope}:email`,
                value: emailId,
                limit: perEmailLimit,
                windowSeconds: ipWindowSeconds,
            });

            if (!emailResult.allowed) {
                return res.status(429).json({
                    error: "rate_limited",
                    message: "Too many attempts. Please wait before trying again.",
                    retryAfterSeconds: emailResult.retryAfterSeconds,
                });
            }
        }

        next();
    } catch (error) {
        console.error("authRateLimitMiddleware error:", error);
        return res.status(500).json({
            error: "rate_limit_failed",
            message: "Unable to process this request right now.",
        });
    }
};
