import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from '../../components/Navbar';
import { checkAuth, updateUserFields } from '../../services/slices/authSlice';
import matchService from '../../services/matchService';
import problemService from '../../services/problemService';

function StatCard({ label, value, hint, darkMode, accent }) {
    return (
        <div className={`rounded-3xl border p-6 transition-colors ${darkMode ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-white'}`}>
            <p className={`text-xs font-bold uppercase tracking-[0.18em] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{label}</p>
            <p className={`mt-3 text-4xl font-black ${accent}`}>{value}</p>
            <p className={`mt-2 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{hint}</p>
        </div>
    );
}

function ProgressRow({ label, solved, total, darkMode, accentClass }) {
    const percentage = total > 0 ? Math.round((solved / total) * 100) : 0;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>{label}</span>
                <span className={darkMode ? 'text-slate-500' : 'text-slate-400'}>{solved}/{total}</span>
            </div>
            <div className={`h-2 rounded-full ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <div className={`h-2 rounded-full ${accentClass}`} style={{ width: `${percentage}%` }} />
            </div>
        </div>
    );
}

export default function ProfilePage() {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const fileInputRef = useRef(null);

    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [allProblems, setAllProblems] = useState([]);
    const [solvedProblems, setSolvedProblems] = useState([]);

    useEffect(() => {
        localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);

    useEffect(() => {
        if (!user?._id) {
            return;
        }

        const loadProfile = async () => {
            setLoading(true);
            try {
                const [profile, problems, solved] = await Promise.all([
                    matchService.getUserProfile(user._id),
                    problemService.getAllProblems(),
                    problemService.getSolvedProblems(),
                ]);

                setProfileData(profile);
                setAllProblems(Array.isArray(problems) ? problems : []);
                setSolvedProblems(Array.isArray(solved) ? solved : []);
            } catch (error) {
                console.error('Error fetching profile data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [user]);

    const handleImageUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const data = await matchService.uploadProfilePicture(formData);
            dispatch(updateUserFields({ profilePicture: data.profilePicture }));
            await dispatch(checkAuth());
            setProfileData((current) => ({ ...current, profilePicture: data.profilePicture }));
        } catch (error) {
            console.error('Error uploading image:', error);
        } finally {
            setUploading(false);
            event.target.value = '';
        }
    };

    const profile = profileData || user || {};
    const solvedIds = useMemo(() => new Set(solvedProblems.map((problem) => problem._id)), [solvedProblems]);

    const solvedCount = solvedProblems.length;
    const easyTotal = allProblems.filter((problem) => problem.difficulty === 'easy').length;
    const mediumTotal = allProblems.filter((problem) => problem.difficulty === 'medium').length;
    const hardTotal = allProblems.filter((problem) => problem.difficulty === 'hard').length;
    const easySolved = allProblems.filter((problem) => problem.difficulty === 'easy' && solvedIds.has(problem._id)).length;
    const mediumSolved = allProblems.filter((problem) => problem.difficulty === 'medium' && solvedIds.has(problem._id)).length;
    const hardSolved = allProblems.filter((problem) => problem.difficulty === 'hard' && solvedIds.has(problem._id)).length;
    const totalProblems = allProblems.length;
    const completionRate = totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0;
    const matchesPlayed = profile.matchesPlayed || 0;
    const matchesWon = profile.matchesWon || 0;
    const winRate = matchesPlayed > 0 ? ((matchesWon / matchesPlayed) * 100).toFixed(1) : '0.0';
    const recentSolved = solvedProblems.slice(0, 6);

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
                <span className="loading loading-spinner loading-lg text-indigo-500"></span>
            </div>
        );
    }

    return (
        <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
            <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <section className={`relative overflow-hidden rounded-[2rem] border p-8 sm:p-10 ${darkMode ? 'border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/70' : 'border-slate-200 bg-gradient-to-br from-white via-indigo-50 to-slate-100'}`}>
                    <div className="absolute right-[-8%] top-[-12%] h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />
                    <div className="absolute bottom-[-10%] left-[-5%] h-52 w-52 rounded-full bg-cyan-500/10 blur-3xl" />

                    <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                            <div className="relative">
                                <div className={`h-28 w-28 overflow-hidden rounded-[2rem] border-4 shadow-2xl ${darkMode ? 'border-slate-800 bg-slate-800' : 'border-white bg-slate-200'}`}>
                                    {profile.profilePicture ? (
                                        <img src={profile.profilePicture} alt="Profile" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-indigo-500/10 text-4xl font-black text-indigo-500">
                                            {profile.firstName?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="absolute -bottom-2 -right-2 rounded-2xl bg-slate-900 px-3 py-2 text-xs font-bold text-white shadow-lg transition hover:bg-slate-800 disabled:opacity-60"
                                >
                                    {uploading ? 'Uploading...' : 'Edit'}
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                    disabled={uploading}
                                />
                            </div>

                            <div>
                                <p className={`text-xs font-bold uppercase tracking-[0.22em] ${darkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>Coder Profile</p>
                                <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                                    {profile.firstName} {profile.lastName}
                                </h1>
                                <div className="mt-4 flex flex-wrap items-center gap-3">
                                    <span className="rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-2 text-sm font-bold text-indigo-400">
                                        {profile.rank || 'Bronze'}
                                    </span>
                                    <span className={`rounded-full border px-4 py-2 text-sm font-semibold ${darkMode ? 'border-slate-700 bg-slate-900 text-slate-300' : 'border-slate-200 bg-white text-slate-700'}`}>
                                        Rating {profile.rating || 1200}
                                    </span>
                                    <span className={`rounded-full border px-4 py-2 text-sm font-semibold ${darkMode ? 'border-slate-700 bg-slate-900 text-slate-300' : 'border-slate-200 bg-white text-slate-700'}`}>
                                        {completionRate}% complete
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className={`grid grid-cols-2 gap-4 rounded-[1.75rem] border p-5 ${darkMode ? 'border-slate-800 bg-slate-950/60' : 'border-white/80 bg-white/80'}`}>
                            <div>
                                <p className={`text-xs font-bold uppercase tracking-[0.18em] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Solved</p>
                                <p className="mt-2 text-3xl font-black text-emerald-500">{solvedCount}</p>
                            </div>
                            <div>
                                <p className={`text-xs font-bold uppercase tracking-[0.18em] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Arena Win Rate</p>
                                <p className="mt-2 text-3xl font-black text-cyan-500">{winRate}%</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard label="Problems Solved" value={solvedCount} hint={`${totalProblems} total available`} darkMode={darkMode} accent="text-emerald-500" />
                    <StatCard label="Contest Rating" value={profile.rating || 1200} hint={`Current rank: ${profile.rank || 'Bronze'}`} darkMode={darkMode} accent="text-indigo-500" />
                    <StatCard label="Matches Played" value={matchesPlayed} hint={`${matchesWon} wins so far`} darkMode={darkMode} accent="text-cyan-500" />
                    <StatCard label="Win Rate" value={`${winRate}%`} hint="Across DSA Arena matches" darkMode={darkMode} accent="text-pink-500" />
                </section>

                <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className={`rounded-[2rem] border p-6 sm:p-8 ${darkMode ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-white'}`}>
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className={`text-xs font-bold uppercase tracking-[0.18em] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Progress Breakdown</p>
                                <h2 className="mt-2 text-2xl font-black">LeetCode-style progress view</h2>
                            </div>
                            <div className={`rounded-full px-4 py-2 text-sm font-bold ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                                {completionRate}% complete
                            </div>
                        </div>

                        <div className="mt-8 space-y-6">
                            <ProgressRow label="Easy" solved={easySolved} total={easyTotal} darkMode={darkMode} accentClass="bg-gradient-to-r from-emerald-400 to-emerald-500" />
                            <ProgressRow label="Medium" solved={mediumSolved} total={mediumTotal} darkMode={darkMode} accentClass="bg-gradient-to-r from-amber-400 to-amber-500" />
                            <ProgressRow label="Hard" solved={hardSolved} total={hardTotal} darkMode={darkMode} accentClass="bg-gradient-to-r from-rose-400 to-rose-500" />
                        </div>
                    </div>

                    <div className={`rounded-[2rem] border p-6 sm:p-8 ${darkMode ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-white'}`}>
                        <p className={`text-xs font-bold uppercase tracking-[0.18em] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Recent Solves</p>
                        <h2 className="mt-2 text-2xl font-black">Latest completed problems</h2>

                        <div className="mt-6 space-y-3">
                            {recentSolved.length === 0 ? (
                                <div className={`rounded-3xl border border-dashed px-5 py-10 text-center text-sm ${darkMode ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-500'}`}>
                                    No solved problems yet. Start with an easy one and this space will come alive.
                                </div>
                            ) : (
                                recentSolved.map((problem) => (
                                    <div key={problem._id} className={`rounded-2xl border px-4 py-4 ${darkMode ? 'border-slate-800 bg-slate-950/50' : 'border-slate-200 bg-slate-50'}`}>
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className={`text-sm font-bold ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>{problem.title}</p>
                                                <p className={`mt-1 text-xs uppercase tracking-[0.16em] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{problem.tags}</p>
                                            </div>
                                            <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                                                problem.difficulty === 'easy'
                                                    ? 'bg-emerald-500/10 text-emerald-500'
                                                    : problem.difficulty === 'medium'
                                                    ? 'bg-amber-500/10 text-amber-500'
                                                    : 'bg-rose-500/10 text-rose-500'
                                            }`}>
                                                {problem.difficulty}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
