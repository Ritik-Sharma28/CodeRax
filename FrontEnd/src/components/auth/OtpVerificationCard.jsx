import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    clearPendingReset,
    clearPendingVerification,
    resendOtp,
    resendResetOtp,
    verifyOtp,
    verifyResetOtp,
} from "../../services/slices/authSlice";

export default function OtpVerificationCard({
    emailId,
    mode = "signup",
    onBack,
    onVerified,
    onResetComplete,
}) {
    const dispatch = useDispatch();
    const { loading, verificationMeta, resetMeta } = useSelector((state) => state.auth);
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState("");
    const [timeLeft, setTimeLeft] = useState(0);

    const meta = mode === "reset" ? resetMeta : verificationMeta;
    const resendAvailableAt = meta?.resendAvailableAt || null;

    useEffect(() => {
        const updateTimer = () => {
            if (!resendAvailableAt) {
                setTimeLeft(0);
                return;
            }
            setTimeLeft(Math.max(0, Math.ceil((new Date(resendAvailableAt).getTime() - Date.now()) / 1000)));
        };

        updateTimer();
        const timer = window.setInterval(updateTimer, 1000);
        return () => window.clearInterval(timer);
    }, [resendAvailableAt]);

    const helperText = useMemo(() => {
        if (timeLeft <= 0) return "Enter the 6-digit code we sent to your email.";
        return `You can request a new code in ${timeLeft}s.`;
    }, [timeLeft]);

    const handleVerify = async (event) => {
        event.preventDefault();
        setLocalError("");

        try {
            if (mode === "reset") {
                if (password !== confirmPassword) {
                    setLocalError("Passwords do not match.");
                    return;
                }

                await dispatch(verifyResetOtp({ emailId, otp, password })).unwrap();
                dispatch(clearPendingReset());
                onResetComplete?.();
                return;
            }

            await dispatch(verifyOtp({ emailId, otp })).unwrap();
            dispatch(clearPendingVerification());
            onVerified?.();
        } catch (error) {
            setLocalError(error?.message || "Unable to verify the code.");
        }
    };

    const handleResend = async () => {
        setLocalError("");
        try {
            if (mode === "reset") {
                await dispatch(resendResetOtp({ emailId })).unwrap();
            } else {
                await dispatch(resendOtp({ emailId })).unwrap();
            }
        } catch (error) {
            setLocalError(error?.message || "Unable to resend the code.");
        }
    };

    const isReset = mode === "reset";

    return (
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_35px_120px_-65px_rgba(15,23,42,0.25)] sm:p-8 lg:p-9">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-600">
                {isReset ? "Reset password" : "Email verification"}
            </p>
            <h2 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">
                {isReset ? "Verify reset code" : "Verify to continue"}
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-500">
                We sent a 6-digit verification code to <span className="font-bold text-slate-800">{emailId}</span>.
            </p>

            {localError ? (
                <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                    {localError}
                </div>
            ) : null}

            <form onSubmit={handleVerify} className="mt-6 space-y-4">
                <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Verification code</label>
                    <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={otp}
                        onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="000000"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-lg font-black tracking-[0.45em] text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                    <p className="mt-2 text-xs text-slate-400">{helperText}</p>
                </div>

                {isReset ? (
                    <>
                        <div>
                            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">New password</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder="Create a strong password"
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Confirm password</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                placeholder="Confirm your password"
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((current) => !current)}
                                className="mt-2 text-xs font-bold text-slate-500 transition hover:text-slate-700"
                            >
                                {showPassword ? "Hide passwords" : "Show passwords"}
                            </button>
                        </div>
                    </>
                ) : null}

                <button
                    type="submit"
                    disabled={loading || otp.length !== 6 || (isReset && (!password || !confirmPassword))}
                    className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3.5 text-sm font-black text-white transition hover:from-indigo-500 hover:to-purple-500 hover:shadow-lg hover:shadow-indigo-200/50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? (isReset ? "Resetting..." : "Verifying...") : (isReset ? "Reset password" : "Verify & continue")}
                </button>
            </form>

            <div className="mt-5 flex flex-col gap-3 text-sm">
                <button
                    type="button"
                    onClick={handleResend}
                    disabled={loading || timeLeft > 0}
                    className="rounded-2xl border border-slate-200 px-4 py-3 font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? "Please wait..." : "Resend OTP"}
                </button>
                <button
                    type="button"
                    onClick={onBack}
                    className="rounded-2xl px-4 py-2 font-bold text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
                >
                    {isReset ? "Back to login" : "Change email"}
                </button>
            </div>
        </div>
    );
}
