import express from "express"
import { register, login, logout, deleteProfile , adminRegister , check, googleLogin, resendOtp, verifyOtp, forgotPassword, verifyResetOtp, resendResetOtp } from "../controllers/authControl.js"
import { userMiddleware } from "../middleware/userMiddleware.js"
import { authRateLimitMiddleware } from "../middleware/authRateLimitMiddleware.js";
export const authRouter = express.Router();

authRouter.post("/register", authRateLimitMiddleware("register"), register);
authRouter.post("/login", login);
authRouter.post("/google", googleLogin);
authRouter.post("/forgot-password", authRateLimitMiddleware("forgot-password"), forgotPassword);
authRouter.post("/verify-otp", authRateLimitMiddleware("verify", { includeEmail: true }), verifyOtp);
authRouter.post("/resend-otp", authRateLimitMiddleware("resend"), resendOtp);
authRouter.post("/verify-reset-otp", authRateLimitMiddleware("verify-reset", { includeEmail: true }), verifyResetOtp);
authRouter.post("/resend-reset-otp", authRateLimitMiddleware("resend-reset"), resendResetOtp);
authRouter.post("/logout", userMiddleware, logout);
authRouter.post("/delete", userMiddleware, deleteProfile);
authRouter.post("/adminRegister", userMiddleware, adminRegister);
authRouter.get('/check',userMiddleware, check)

