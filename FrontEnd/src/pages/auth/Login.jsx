import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router';
import { loginUser } from '../../services/slices/authSlice';
import { useState, useEffect } from 'react';

const loginSchema = z.object({
    emailId: z.string().email("Please enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters")
});

function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [backendError, setBackendError] = useState(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, loading } = useSelector((state) => state.auth);
    const {
        register,
        handleSubmit,
        clearErrors,
        formState: { errors },
    } = useForm({ resolver: zodResolver(loginSchema) });

    const onSubmit = async (data) => {
        setBackendError(null);
        clearErrors();

        try {
            await dispatch(loginUser(data)).unwrap();
        } catch (err) {
            setBackendError(
                err?.message ||
                err?.error ||
                'Invalid email or password.'
            );
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    return (
        <div className="min-h-screen min-h-[100dvh] w-full flex flex-col lg:flex-row">

            {/* ═══ LEFT: Dark showcase panel (hidden on mobile, full height on desktop) ═══ */}
            <div className="hidden lg:flex lg:w-[48%] xl:w-[45%] bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 relative overflow-hidden p-10 xl:p-14 flex-col justify-between">

                {/* Glow effects */}
                <div className="absolute top-[-15%] left-[-15%] w-[500px] h-[500px] bg-indigo-500/15 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-15%] right-[-10%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px]" />
                <div className="absolute top-[50%] left-[40%] w-48 h-48 bg-blue-400/10 rounded-full blur-[60px]" />

                {/* Dot grid */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

                {/* Logo */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 border border-white/15 backdrop-blur rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                    </div>
                    <span className="text-lg font-bold text-white/90">LeetCode</span>
                </div>

                {/* Hero */}
                <div className="relative z-10 flex-1 flex flex-col justify-center py-8">
                    <h1 className="text-4xl xl:text-[2.75rem] font-extrabold text-white leading-[1.15] tracking-tight mb-5">
                        Welcome back.<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-purple-400">
                            Let's keep going.
                        </span>
                    </h1>
                    <p className="text-slate-400 text-base leading-relaxed max-w-sm mb-10">
                        Your progress is waiting. Jump back in and continue solving problems at your own pace.
                    </p>

                    {/* Features */}
                    <div className="space-y-5">
                        {[
                            { icon: 'M13 10V3L4 14h7v7l9-11h-7z', title: 'AI Powered Chat', desc: 'Get personalized hints and instant code breakdowns.' },
                            { icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z', title: 'Simple Easy UI', desc: 'A clean, distraction-free editor to focus on logic.' },
                            { icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', title: 'Proper Stats Lookup', desc: 'Track progress, accuracy, and performance in real-time.' },
                        ].map((f, i) => (
                            <div key={i} className="flex items-start gap-4 group">
                                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/[0.07] border border-white/10 flex items-center justify-center group-hover:bg-indigo-500/20 group-hover:border-indigo-400/30 transition-colors duration-300">
                                    <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-white">{f.title}</h3>
                                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className="relative z-10 flex items-center gap-8 pt-6 border-t border-white/[0.06]">
                    {[
                        { val: '3000+', label: 'Problems' },
                        { val: '2M+', label: 'Users' },
                        { val: '500+', label: 'Companies' },
                    ].map((s, i) => (
                        <div key={i}>
                            <div className="text-xl font-extrabold text-white">{s.val}</div>
                            <div className="text-[11px] text-slate-500 uppercase tracking-wider mt-0.5">{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ═══ RIGHT: Form panel (full screen on mobile, right half on desktop) ═══ */}
            <div className="flex-1 flex flex-col min-h-screen min-h-[100dvh] bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 relative">

                {/* Ambient blobs */}
                <div className="absolute top-[-20%] right-[-15%] w-[50vw] h-[50vw] lg:w-[30vw] lg:h-[30vw] bg-indigo-400/8 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] lg:w-[20vw] lg:h-[20vw] bg-purple-400/6 rounded-full blur-[60px] pointer-events-none" />

                {/* Top Bar */}
                <div className="flex items-center justify-between px-6 sm:px-8 pt-6 pb-2 relative z-10">
                    <div className="flex items-center gap-2.5">
                        <div className="lg:hidden w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-600/25">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                        </div>
                        <span className="lg:hidden text-lg font-bold text-slate-900">LeetCode</span>
                    </div>
                    <NavLink to="/signup" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                        Sign up
                    </NavLink>
                </div>

                {/* Form centered */}
                <div className="flex-1 flex items-center justify-center px-6 sm:px-8 py-6 relative z-10">
                    <div className="w-full max-w-[400px]">

                        <div className="mb-7">
                            <span className="text-indigo-600 font-semibold text-xs tracking-widest uppercase block mb-1.5">Welcome back</span>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Log in to your account</h1>
                            <p className="text-slate-500 mt-1.5 text-sm">Pick up right where you left off.</p>
                            {backendError && (
                                <div className="mt-3 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
                                    {backendError}
                                </div>
                            )}
                        </div>

                        <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {/* Email */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Email</label>
                                <input
                                    type="email"
                                    placeholder="jane@example.com"
                                    className={`w-full px-4 py-3 rounded-xl border text-slate-900 placeholder-slate-400 bg-white
                                        transition-all duration-200 outline-none shadow-sm text-sm
                                        ${errors.emailId
                                            ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                                            : 'border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                                        }`}
                                    {...register('emailId')}
                                />
                                {errors.emailId && <p className="text-xs text-red-500 mt-1 font-medium">{errors.emailId.message}</p>}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        className={`w-full pl-4 pr-12 py-3 rounded-xl border text-slate-900 placeholder-slate-400 bg-white
                                            transition-all duration-200 outline-none shadow-sm text-sm
                                            ${errors.password
                                                ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                                                : 'border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                                            }`}
                                        {...register('password')}
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition-colors">
                                        {showPassword ? (
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                        )}
                                    </button>
                                </div>
                                {errors.password && <p className="text-xs text-red-500 mt-1 font-medium">{errors.password.message}</p>}
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 mt-2 bg-slate-900 hover:bg-slate-800 active:bg-slate-950
                                    text-white text-sm font-bold rounded-xl shadow-lg shadow-slate-900/15
                                    hover:-translate-y-0.5 transition-all duration-200
                                    disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0
                                    flex items-center justify-center gap-2 group"
                            >
                                {loading ? (
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                ) : (
                                    <>
                                        Log In
                                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </form>

                        <p className="text-center text-sm text-slate-500 mt-6">
                            Don't have an account?{' '}
                            <NavLink to="/signup" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">Sign up</NavLink>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
