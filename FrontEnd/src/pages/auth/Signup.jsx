import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useLocation, useNavigate } from "react-router";
import { clearPendingVerification, googleLogin, registerUser, setPendingVerification } from "../../services/slices/authSlice";
import BrandWordmark from "../../components/brand/BrandWordmark";
import InteractiveHeroBackdrop from "../../components/brand/InteractiveHeroBackdrop";
import GoogleAuthButton from "../../components/auth/GoogleAuthButton";
import OtpVerificationCard from "../../components/auth/OtpVerificationCard";

const signupSchema = z.object({
    firstName: z.string().min(3, "Minimum 3 characters required"),
    emailId: z.string().email("Enter a valid email address"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Add one uppercase letter")
        .regex(/[a-z]/, "Add one lowercase letter")
        .regex(/[0-9]/, "Add one number")
        .regex(/[^A-Za-z0-9]/, "Add one special character"),
});

function Signup() {
    const [showPassword, setShowPassword] = useState(false);
    const [backendError, setBackendError] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { loading, isAuthenticated, user, pendingVerificationEmail } = useSelector((state) => state.auth);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({ resolver: zodResolver(signupSchema) });

    const locationEmail = location.state?.emailId || null;
    const showVerificationStep = Boolean(location.state?.mode === "verify" || pendingVerificationEmail || locationEmail);
    const verificationEmail = pendingVerificationEmail || locationEmail;

    const onSubmit = async (data) => {
        setBackendError("");
        try {
            const response = await dispatch(registerUser(data)).unwrap();
            dispatch(setPendingVerification(response));
            reset({ firstName: data.firstName, emailId: data.emailId, password: "" });
        } catch (err) {
            setBackendError(err?.message || "Unable to create your account right now.");
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

    const inputClass = (hasError) =>
        `w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 bg-white outline-none transition placeholder:text-slate-400 ${
            hasError ? "border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100" : "border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        }`;

    const signupHighlights = useMemo(() => ([
        { title: "Problem arena", body: "A proper workspace for focused solving." },
        { title: "Revision AI", body: "Turn weak topics into repeatable wins." },
        { title: "DSA visualizer", body: "Watch core ideas move step by step." },
        { title: "Arena mode", body: "Bring ranked urgency into practice." },
    ]), []);

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,_#f8f9fc_0%,_#ffffff_42%,_#eef2ff_100%)]">
            <div className="mx-auto grid min-h-screen max-w-[1440px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[0.96fr_1.04fr] lg:px-8">
                <section className="flex items-center justify-center">
                    {showVerificationStep && verificationEmail ? (
                        <OtpVerificationCard
                            emailId={verificationEmail}
                            onVerified={() => navigate("/")}
                            onBack={() => {
                                dispatch(clearPendingVerification());
                                navigate("/signup", { replace: true });
                            }}
                        />
                    ) : (
                        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_35px_120px_-65px_rgba(15,23,42,0.25)] sm:p-8 lg:p-9">
                            <NavLink to="/" className="inline-flex items-center gap-3">
                                <img src="/coderax_logo.png" alt="CodeRax Logo" className="h-10 w-10 rounded-2xl object-cover" />
                                <BrandWordmark darkMode={false} compact />
                            </NavLink>

                            <div className="mt-7">
                                <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-600">Create account</p>
                                <h2 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">Start your CodeRax run</h2>
                                <p className="mt-2 text-sm leading-7 text-slate-500">
                                    Join once, then move between practice, revision, visualization, battles, and interview prep from one workspace.
                                </p>
                            </div>

                            {backendError ? (
                                <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                                    {backendError}
                                </div>
                            ) : null}

                            <div className="mt-5">
                                <GoogleAuthButton onCredential={handleGoogleCredential} disabled={loading} />
                            </div>

                            <div className="my-5 flex items-center gap-3">
                                <div className="h-px flex-1 bg-slate-200" />
                                <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">or continue with email</p>
                                <div className="h-px flex-1 bg-slate-200" />
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div>
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Name</label>
                                    <input
                                        type="text"
                                        placeholder="Your name"
                                        className={inputClass(errors.firstName)}
                                        {...register("firstName")}
                                    />
                                    {errors.firstName ? <p className="mt-1 text-xs font-semibold text-rose-600">{errors.firstName.message}</p> : null}
                                </div>
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
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Create a strong password"
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
                                    {errors.password ? (
                                        <p className="mt-1 text-xs font-semibold text-rose-600">{errors.password.message}</p>
                                    ) : (
                                        <p className="mt-1 text-xs text-slate-400">Use 8+ characters with uppercase, lowercase, number, and special character.</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3.5 text-sm font-black text-white transition hover:from-indigo-500 hover:to-purple-500 hover:shadow-lg hover:shadow-indigo-200/50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loading ? "Sending OTP..." : "Create Account"}
                                </button>
                            </form>

                            <p className="mt-6 text-sm text-slate-500">
                                Already have an account?{" "}
                                <NavLink to="/login" className="font-bold text-indigo-600 hover:text-indigo-500">
                                    Log in
                                </NavLink>
                            </p>
                        </div>
                    )}
                </section>

                <InteractiveHeroBackdrop darkMode className="hidden rounded-[38px] border border-white/10 shadow-[0_40px_140px_-60px_rgba(99,102,241,0.45)] lg:block">
                    <section className="relative flex h-full flex-col justify-between p-8 text-white xl:p-12">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.28em] text-indigo-300">
                                {showVerificationStep ? "One last step" : "What unlocks after signup"}
                            </p>
                            <h1 className="mt-4 max-w-xl text-4xl font-black leading-[0.95] lg:text-5xl">
                                {showVerificationStep
                                    ? "Verify once, then use the full CodeRax workspace with confidence."
                                    : "A sharper way to practice than jumping between disconnected tools."}
                            </h1>
                            <p className="mt-5 max-w-lg text-base leading-8 text-slate-300">
                                {showVerificationStep
                                    ? "Email verification keeps AI access protected while leaving the rest of your practice flow smooth."
                                    : "CodeRax keeps your streaks, recent solves, daily challenge, and feature shortcuts in one home base built for repeat use."}
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            {signupHighlights.map((item) => (
                                <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                    <p className="text-sm font-black">{item.title}</p>
                                    <p className="mt-2 text-sm leading-6 text-slate-400">{item.body}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </InteractiveHeroBackdrop>
            </div>
        </div>
    );
}

export default Signup;
