import { useMemo, useState } from "react";
import { NavLink } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../services/slices/authSlice";
import BrandWordmark from "./brand/BrandWordmark";

const guestLinks = [
    { to: "/problems", label: "Problems", activeDark: "bg-indigo-500/20 text-indigo-300", activeLight: "bg-indigo-50 text-indigo-700" },
    { to: "/revision-mentor", label: "Revision AI", activeDark: "bg-emerald-500/20 text-emerald-300", activeLight: "bg-emerald-50 text-emerald-700" },
    { to: "/mock-interview", label: "Mock Interview", activeDark: "bg-cyan-500/20 text-cyan-300", activeLight: "bg-cyan-50 text-cyan-700" },
    { to: "/dsa-visualizer", label: "Visualizer", activeDark: "bg-amber-500/20 text-amber-300", activeLight: "bg-amber-50 text-amber-700" },
    { to: "/battle-lobby", label: "Arena", activeDark: "bg-fuchsia-500/20 text-fuchsia-300", activeLight: "bg-fuchsia-50 text-fuchsia-700" },
];

const authedLinks = [
    { to: "/", label: "Home", activeDark: "bg-slate-100/10 text-white", activeLight: "bg-slate-900 text-white" },
    ...guestLinks,
];

function Navbar({ darkMode, setDarkMode }) {
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const links = useMemo(() => (isAuthenticated ? authedLinks : guestLinks), [isAuthenticated]);

    const buildNavClass = (link) => ({ isActive }) =>
        `rounded-xl px-3 py-2 text-sm font-semibold transition ${
            isActive
                ? darkMode
                    ? link.activeDark
                    : link.activeLight
                : darkMode
                ? "text-slate-400 hover:bg-slate-800 hover:text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`;

    const handleLogout = () => {
        dispatch(logoutUser());
        setProfileOpen(false);
        setMenuOpen(false);
    };

    return (
        <header className={`sticky top-0 z-50 border-b backdrop-blur-xl ${darkMode ? "border-slate-800 bg-slate-950/85" : "border-slate-200 bg-white/85"}`}>
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-[74px] lg:px-8">
                <NavLink to="/" className="flex items-center gap-3">
                    <img src="/coderax_logo.png" alt="CodeRax Logo" className="h-10 w-10 rounded-2xl object-cover shadow-lg shadow-cyan-500/20" />
                    <div>
                        <BrandWordmark darkMode={darkMode} compact />
                        <p className={`hidden text-[10px] font-bold uppercase tracking-[0.18em] sm:block ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                            DSA · AI · Arena
                        </p>
                    </div>
                </NavLink>

                <nav className="hidden items-center gap-1 lg:flex">
                    {links.map((link) => (
                        <NavLink key={link.to} to={link.to} className={buildNavClass(link)}>
                            {link.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className={`rounded-xl p-2 transition ${darkMode ? "bg-slate-800 text-amber-300 hover:bg-slate-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                    >
                        {darkMode ? (
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m12.364 6.364l-.707-.707M7.343 7.343l-.707-.707m12.728 0l-.707.707M7.343 16.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        ) : (
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                        )}
                    </button>

                    {!isAuthenticated ? (
                        <div className="hidden items-center gap-2 sm:flex">
                            <NavLink
                                to="/login"
                                className={`rounded-xl px-4 py-2 text-sm font-bold transition ${darkMode ? "text-slate-200 hover:bg-slate-800" : "text-slate-700 hover:bg-slate-100"}`}
                            >
                                Log In
                            </NavLink>
                            <NavLink to="/signup" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800">
                                Sign Up
                            </NavLink>
                        </div>
                    ) : (
                        <div className="relative hidden sm:block">
                            <button
                                onClick={() => setProfileOpen((value) => !value)}
                                className={`flex items-center gap-3 rounded-2xl px-3 py-2 transition ${darkMode ? "hover:bg-slate-800" : "hover:bg-slate-100"}`}
                            >
                                <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 to-cyan-600 text-sm font-black text-white">
                                    {user?.profilePicture ? (
                                        <img src={user.profilePicture} alt={user?.firstName || "Profile"} className="h-full w-full object-cover" />
                                    ) : (
                                        <span>{user?.firstName?.charAt(0)?.toUpperCase() || "U"}</span>
                                    )}
                                </div>
                                <div className="text-left">
                                    <p className={`text-sm font-bold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>{user?.firstName || "Coder"}</p>
                                    <p className={`text-[11px] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>{user?.rank || "Member"}</p>
                                </div>
                            </button>
                            {profileOpen ? (
                                <div className={`absolute right-0 mt-2 w-60 rounded-[24px] border p-2 shadow-xl ${darkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}>
                                    <NavLink to="/profile" onClick={() => setProfileOpen(false)} className={buildNavClass({ activeDark: "bg-slate-800 text-white", activeLight: "bg-slate-100 text-slate-900" })}>
                                        Profile
                                    </NavLink>
                                    {user?.role === "admin" ? (
                                        <NavLink to="/admin" onClick={() => setProfileOpen(false)} className={buildNavClass({ activeDark: "bg-slate-800 text-white", activeLight: "bg-slate-100 text-slate-900" })}>
                                            Admin
                                        </NavLink>
                                    ) : null}
                                    <button
                                        onClick={handleLogout}
                                        className={`mt-2 w-full rounded-xl px-3 py-2 text-left text-sm font-bold transition ${darkMode ? "text-rose-300 hover:bg-rose-500/10" : "text-rose-600 hover:bg-rose-50"}`}
                                    >
                                        Log out
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    )}

                    <button
                        onClick={() => setMenuOpen((value) => !value)}
                        className={`rounded-xl p-2 transition lg:hidden ${darkMode ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-700"}`}
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>

            {menuOpen ? (
                <div className={`border-t px-4 py-4 lg:hidden ${darkMode ? "border-slate-800 bg-slate-950" : "border-slate-200 bg-white"}`}>
                    <div className="flex flex-col gap-2">
                        {links.map((link) => (
                            <NavLink key={link.to} to={link.to} className={buildNavClass(link)} onClick={() => setMenuOpen(false)}>
                                {link.label}
                            </NavLink>
                        ))}
                        {isAuthenticated ? (
                            <>
                                <NavLink to="/profile" className={buildNavClass({ activeDark: "bg-slate-800 text-white", activeLight: "bg-slate-100 text-slate-900" })} onClick={() => setMenuOpen(false)}>
                                    Profile
                                </NavLink>
                                {user?.role === "admin" ? (
                                    <NavLink to="/admin" className={buildNavClass({ activeDark: "bg-slate-800 text-white", activeLight: "bg-slate-100 text-slate-900" })} onClick={() => setMenuOpen(false)}>
                                        Admin
                                    </NavLink>
                                ) : null}
                                <button
                                    onClick={handleLogout}
                                    className={`rounded-xl px-3 py-2 text-left text-sm font-bold ${darkMode ? "text-rose-300 hover:bg-rose-500/10" : "text-rose-600 hover:bg-rose-50"}`}
                                >
                                    Log out
                                </button>
                            </>
                        ) : (
                            <div className="mt-2 grid gap-2 sm:grid-cols-2">
                                <NavLink to="/login" onClick={() => setMenuOpen(false)} className={buildNavClass({ activeDark: "bg-slate-800 text-white", activeLight: "bg-slate-100 text-slate-900" })}>
                                    Log In
                                </NavLink>
                                <NavLink to="/signup" onClick={() => setMenuOpen(false)} className="rounded-xl bg-slate-900 px-4 py-2 text-center text-sm font-bold text-white">
                                    Sign Up
                                </NavLink>
                            </div>
                        )}
                    </div>
                </div>
            ) : null}
        </header>
    );
}

export default Navbar;
