import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router";
import {
    clearPendingReset,
    clearResetSuccessMessage,
    forgotPassword,
    googleLogin,
    loginUser,
    setPendingReset,
    setPendingVerification,
} from "../../services/slices/authSlice";
import BrandWordmark from "../../components/brand/BrandWordmark";
import InteractiveHeroBackdrop from "../../components/brand/InteractiveHeroBackdrop";
import GoogleAuthButton from "../../components/auth/GoogleAuthButton";
import OtpVerificationCard from "../../components/auth/OtpVerificationCard";

const loginSchema = z.object({
    emailId: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

const forgotSchema = z.object({
    emailId: z.string().email("Enter a valid email address"),
});

function ForgotPasswordCard({ onBack }) {
    const dispatch = useDispatch();
    const { loading, pendingResetEmail, resetSuccessMessage } = useSelector((state) => state.auth);
    const [backendError, setBackendError] = useState("");
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ resolver: zodResolver(forgotSchema) });

    const onSubmit = async (data) => {
        setBackendError("");
        try {
            const response = await dispatch(forgotPassword(data)).unwrap();
            dispatch(setPendingReset(response));
        } catch (err) {
            setBackendError(err?.message || "Unable to start password reset right now.");
        }
    };

    if (pendingResetEmail) {
        return (
            <OtpVerificationCard
                emailId={pendingResetEmail}
                mode="reset"
                onBack={() => {
                    dispatch(clearPendingReset());
                    onBack?.();
                }}
                onResetComplete={() => {
                    dispatch(clearPendingReset());
                    onBack?.();
                }}
            />
        );
    }

    return (
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_35px_120px_-65px_rgba(15,23,42,0.25)] sm:p-8 lg:p-9">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-600">Forgot password</p>
            <h2 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">Reset your password</h2>
            <p className="mt-2 text-sm leading-7 text-slate-500">
                Enter your account email and we’ll send you a reset code.
            </p>

            {backendError ? (
                <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                    {backendError}
                </div>
            ) : null}

            {resetSuccessMessage ? (
                <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                    {resetSuccessMessage}
                </div>
            ) : null}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Email</label>
                    <input
                        type="email"
                        placeholder="you@example.com"
                        className={`w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 bg-white outline-none transition placeholder:text-slate-400 ${
                            errors.emailId ? "border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100" : "border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        }`}
                        {...register("emailId")}
                    />
                    {errors.emailId ? <p className="mt-1 text-xs font-semibold text-rose-600">{errors.emailId.message}</p> : null}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3.5 text-sm font-black text-white transition hover:from-indigo-500 hover:to-purple-500 hover:shadow-lg hover:shadow-indigo-200/50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? "Sending code..." : "Send reset code"}
                </button>
            </form>

            <button
                type="button"
                onClick={onBack}
                className="mt-5 rounded-2xl px-4 py-2 text-sm font-bold text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
            >
                Back to login
            </button>
        </div>
    );
}

function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [backendError, setBackendError] = useState("");
    const [forgotMode, setForgotMode] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, loading, user, resetSuccessMessage } = useSelector((state) => state.auth);
    const {
        register,
        handleSubmit,
        clearErrors,
        formState: { errors },
    } = useForm({ resolver: zodResolver(loginSchema) });

    const onSubmit = async (data) => {
        setBackendError("");
        clearErrors();
        try {
            await dispatch(loginUser(data)).unwrap();
        } catch (err) {
            if (err?.error === "verification_required") {
                dispatch(setPendingVerification({
                    emailId: err?.emailId || data.emailId,
                    resendAvailableAt: err?.resendAvailableAt,
                }));
                navigate("/signup", { state: { mode: "verify", emailId: err?.emailId || data.emailId } });
                return;
            }

            setBackendError(err?.message || "Unable to log in right now.");
        }
    };

    const handleGoogleCredential = async (credential) => {
        setBackendError("");
        try {
            await dispatch(googleLogin(credential)).unwrap();
        } catch (err) {
            setBackendError(err?.message || "Unable to continue with Google right now.");
        }
    };

    useEffect(() => {
        if (isAuthenticated && user?.verified !== false) navigate("/");
    }, [isAuthenticated, navigate, user]);

    useEffect(() => {
        if (resetSuccessMessage) {
            setForgotMode(true);
        }
    }, [resetSuccessMessage]);

    const inputClass = (hasError) =>
        `w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 bg-white outline-none transition placeholder:text-slate-400 ${
            hasError ? "border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100" : "border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        }`;

    const authCard = useMemo(() => {
        if (forgotMode) {
            return (
                <ForgotPasswordCard
                    onBack={() => {
                        setForgotMode(false);
                        dispatch(clearPendingReset());
                        dispatch(clearResetSuccessMessage());
                    }}
                />
            );
        }

        return (
            <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_35px_120px_-65px_rgba(15,23,42,0.25)] sm:p-8 lg:p-9">
                <NavLink to="/" className="inline-flex items-center gap-3 lg:hidden">
                    <img src="/coderax_logo.png" alt="CodeRax Logo" className="h-10 w-10 rounded-2xl object-cover" />
                    <BrandWordmark darkMode={false} compact />
                </NavLink>

                <div className="mt-6 lg:mt-0">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-600">Log in</p>
                    <h2 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">Welcome back</h2>
                    <p className="mt-2 text-sm leading-7 text-slate-500">
                        Your dashboard, progress, and current target are ready.
                    </p>
                </div>

                {backendError ? (
                    <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                        {backendError}
                    </div>
                ) : null}

                {resetSuccessMessage ? (
                    <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                        {resetSuccessMessage}
                    </div>
                ) : null}

                <div className="mt-5">
                    <GoogleAuthButton onCredential={handleGoogleCredential} disabled={loading} />
                </div>

                <div className="my-5 flex items-center gap-3">
                    <div className="h-px flex-1 bg-slate-200" />
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">or</p>
                    <div className="h-px flex-1 bg-slate-200" />
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Email</label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            className={inputClass(errors.emailId)}
                            {...register("emailId")}
                        />
                        {errors.emailId ? <p className="mt-1 text-xs font-semibold text-rose-600">{errors.emailId.message}</p> : null}
                    </div>
                    <div>
                        <div className="mb-2 flex items-center justify-between gap-3">
                            <label className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Password</label>
                            <button
                                type="button"
                                onClick={() => {
                                    setBackendError("");
                                    dispatch(clearResetSuccessMessage());
                                    setForgotMode(true);
                                }}
                                className="text-xs font-bold text-indigo-600 transition hover:text-indigo-500"
                            >
                                Forgot password?
                            </button>
                        </div>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                className={`${inputClass(errors.password)} pr-14`}
                                {...register("password")}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((current) => !current)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                        {errors.password ? <p className="mt-1 text-xs font-semibold text-rose-600">{errors.password.message}</p> : null}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3.5 text-sm font-black text-white transition hover:from-indigo-500 hover:to-purple-500 hover:shadow-lg hover:shadow-indigo-200/50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Logging in..." : "Log In"}
                    </button>
                </form>

                <div className="mt-6 flex flex-col items-center gap-2 text-center text-sm text-slate-500">
                    <p>
                        New to CodeRax?{" "}
                        <NavLink to="/signup" className="font-bold text-indigo-600 hover:text-indigo-500">
                            Create your account
                        </NavLink>
                    </p>
                    <NavLink to="/problems" className="font-bold text-slate-700 hover:text-slate-900">
                        Browse problems first
                    </NavLink>
                </div>
            </div>
        );
    }, [backendError, dispatch, errors.emailId, errors.password, forgotMode, handleSubmit, loading, register, resetSuccessMessage, showPassword]);

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,_#f8f9fc_0%,_#ffffff_42%,_#eef2ff_100%)]">
            <div className="mx-auto grid min-h-screen max-w-[1440px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8">
                <InteractiveHeroBackdrop darkMode className="hidden rounded-[38px] border border-white/10 shadow-[0_40px_140px_-60px_rgba(99,102,241,0.4)] lg:block">
                    <section className="relative flex h-full flex-col justify-between p-8 text-white xl:p-12">
                        <div>
                            <NavLink to="/" className="inline-flex items-center gap-3">
                                <img src="/coderax_logo.png" alt="CodeRax Logo" className="h-10 w-10 rounded-2xl object-cover" />
                                <BrandWordmark darkMode compact />
                            </NavLink>
                            <p className="mt-10 text-xs font-bold uppercase tracking-[0.28em] text-indigo-300">
                                {forgotMode ? "Account recovery" : "Back to the arena"}
                            </p>
                            <h1 className="mt-4 max-w-xl text-4xl font-black leading-[0.95] lg:text-5xl">
                                {forgotMode
                                    ? "Recover access without breaking your progress."
                                    : "Return to your streak with a workspace built for coders."}
                            </h1>
                            <p className="mt-5 max-w-lg text-base leading-8 text-slate-300">
                                {forgotMode
                                    ? "Use a quick verification code to reset your password and get back to solving."
                                    : "Continue the problem you left open, hit the daily challenge, or jump straight into your next ranked battle."}
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            {[
                                { title: "Continue solving", body: "Pick up exactly where you stopped." },
                                { title: "Track rhythm", body: "See streaks and progress instantly." },
                                { title: "Compete hard", body: "Carry momentum into the arena." },
                            ].map((item) => (
                                <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                    <p className="text-sm font-black">{item.title}</p>
                                    <p className="mt-2 text-sm leading-6 text-slate-400">{item.body}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </InteractiveHeroBackdrop>

                <section className="flex items-center justify-center">
                    {authCard}
                </section>
            </div>
        </div>
    );
}

export default Login;
