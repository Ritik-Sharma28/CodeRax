import { useState, useEffect } from 'react';
import { NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../services/authSlice';

function Navbar({ darkMode, setDarkMode }) {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [profileOpen, setProfileOpen] = useState(false);

    const handleLogout = () => {
        dispatch(logoutUser());
        setProfileOpen(false);
    };

    return (
        <nav className={`sticky top-0 z-50 w-full border-b transition-colors duration-300
            ${darkMode
                ? 'bg-slate-900/80 border-slate-700/60 backdrop-blur-xl'
                : 'bg-white/80 border-slate-200/60 backdrop-blur-xl'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <NavLink to="/" className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-600/25 group-hover:shadow-lg group-hover:shadow-indigo-600/30 transition-shadow">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                        </div>
                        <span className={`text-lg font-bold transition-colors ${darkMode ? 'text-white' : 'text-slate-900'}`}>LeetCode</span>
                    </NavLink>

                    {/* Desktop Nav Links */}
                    <div className="hidden md:flex items-center gap-1">
                        <NavLink to="/" className={({ isActive }) =>
                            `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                ? (darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-700')
                                : (darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')
                            }`
                        }>
                            Home
                        </NavLink>
                        <NavLink to="/problems" className={({ isActive }) =>
                            `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                ? (darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-700')
                                : (darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')
                            }`
                        }>
                            Problems
                        </NavLink>
                        {user?.role === 'admin' && (
                            <NavLink to="/admin" className={({ isActive }) =>
                                `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? (darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-700')
                                    : (darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')
                                }`
                            }>
                                Admin
                            </NavLink>
                        )}
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-2">
                        {/* Dark Mode Toggle */}
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300
                                ${darkMode
                                    ? 'bg-slate-800 hover:bg-slate-700 text-yellow-400'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                }`}
                            title={darkMode ? 'Light mode' : 'Dark mode'}
                        >
                            {darkMode ? (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            )}
                        </button>

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setProfileOpen(!profileOpen)}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors
                                    ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                                    {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <span className={`hidden sm:block text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                    {user?.firstName}
                                </span>
                                <svg className={`hidden sm:block w-4 h-4 transition-transform ${profileOpen ? 'rotate-180' : ''} ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {profileOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                                    <div className={`absolute right-0 mt-2 w-56 rounded-xl shadow-xl border py-2 z-50
                                        ${darkMode
                                            ? 'bg-slate-800 border-slate-700'
                                            : 'bg-white border-slate-200/80'
                                        }`}>
                                        <div className={`px-4 py-3 border-b ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                                            <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{user?.firstName}</p>
                                            <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{user?.emailId}</p>
                                        </div>
                                        {user?.role === 'admin' && (
                                            <NavLink to="/admin" onClick={() => setProfileOpen(false)}
                                                className={`flex items-center gap-3 px-4 py-2.5 text-sm md:hidden
                                                    ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-50'}`}>
                                                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                Admin Panel
                                            </NavLink>
                                        )}
                                        <button onClick={handleLogout}
                                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Log out
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
