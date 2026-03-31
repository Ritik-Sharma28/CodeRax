import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router";
import { useSelector } from "react-redux";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SectionCard from "../../components/ui/SectionCard";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import BrandWordmark from "../../components/brand/BrandWordmark";
import InteractiveHeroBackdrop from "../../components/brand/InteractiveHeroBackdrop";
import { useThemeMode } from "../../context/ThemeContext";
import dashboardService from "../../services/dashboardService";
import { DEFAULT_FEATURE_ORDER } from "../../utils/featureCatalog";

function StatPill({ label, value, darkMode, accent }) {
    return (
        <div className={`rounded-2xl border px-4 py-4 ${darkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-white shadow-sm"}`}>
            <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>{label}</p>
            <p className={`mt-2 text-2xl sm:text-3xl font-black ${accent}`}>{value}</p>
        </div>
    );
}

function ProgressBar({ label, solved, total, darkMode, accent }) {
    const width = total > 0 ? Math.round((solved / total) * 100) : 0;
    return (
        <div>
            <div className="mb-2 flex items-center justify-between text-sm">
                <span className={darkMode ? "text-slate-200" : "text-slate-700"}>{label}</span>
                <span className={darkMode ? "text-slate-500" : "text-slate-400"}>{solved}/{total}</span>
            </div>
            <div className={`h-2 rounded-full ${darkMode ? "bg-slate-800" : "bg-slate-100"}`}>
                <div className={`h-2 rounded-full bg-gradient-to-r ${accent} transition-all duration-500`} style={{ width: `${width}%` }} />
            </div>
        </div>
    );
}

const formatTagText = (value) => {
    if (Array.isArray(value)) return value.slice(0, 2).join(" / ");
    return value || "Curated topic";
};

const featureIcons = {
    problems: "💻",
    "revision-mentor": "🧠",
    "mock-interview": "🎙️",
    "dsa-visualizer": "📐",
    "battle-lobby": "⚔️",
};

function Home() {
    const { darkMode, setDarkMode } = useThemeMode();
    const { user } = useSelector((state) => state.auth);
    const [summary, setSummary] = useState(null);
    const [status, setStatus] = useState("loading");
    const [error, setError] = useState("");

    const loadSummary = async () => {
        setStatus("loading");
        setError("");
        try {
            const data = await dashboardService.getSummary();
            setSummary(data);
            setStatus("success");
        } catch (err) {
            setError(err.message || "Failed to load dashboard.");
            setStatus("error");
        }
    };

    useEffect(() => {
        loadSummary();
    }, []);

    const noSolvesYet = useMemo(() => (summary?.solvedTotal || 0) === 0, [summary?.solvedTotal]);
    const welcomeName = user?.firstName || "Coder";

    if (status === "loading") {
        return (
            <div className={`min-h-screen ${darkMode ? "bg-slate-950 text-white" : "bg-[#f8f9fc] text-slate-900"}`}>
                <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
                <LoadingState title="Loading your CodeRax home..." description="Bringing back your latest rhythm and next target." darkMode={darkMode} />
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className={`min-h-screen ${darkMode ? "bg-slate-950 text-white" : "bg-[#f8f9fc] text-slate-900"}`}>
                <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
                <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
                    <ErrorState title="Home is temporarily unavailable" description={error} onRetry={loadSummary} darkMode={darkMode} />
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${darkMode ? "bg-slate-950 text-white" : "bg-[#f8f9fc] text-slate-900"}`}>
            <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

            <main className="overflow-hidden">
                <InteractiveHeroBackdrop darkMode={darkMode} className="border-b border-transparent">
                    <section className="mx-auto max-w-[1440px] px-4 pb-12 pt-8 sm:px-6 sm:pt-10 lg:px-8">
                        <div className="grid gap-8 lg:grid-cols-[1.04fr_0.96fr]">
                            <div className="max-w-4xl">
                                <p className={`text-xs font-bold uppercase tracking-[0.26em] ${darkMode ? "text-indigo-400" : "text-indigo-600"}`}>
                                    Welcome back, {welcomeName}
                                </p>
                                <BrandWordmark darkMode={darkMode} compact className="mt-4" />
                                <h1 className="mt-5 text-3xl font-black leading-[0.92] tracking-tight sm:text-4xl lg:text-6xl xl:text-7xl">
                                    Stay dangerous.
                                    <br className="hidden sm:block" />
                                    <span className="sm:hidden"> </span>Solve with rhythm.
                                    <br className="hidden sm:block" />
                                    <span className="sm:hidden"> </span>Stack one more win.
                                </h1>
                                <p className={`mt-5 max-w-2xl text-sm leading-7 sm:text-base sm:leading-8 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                                    Your dashboard is built to point at the next move fast: continue the current problem, hit the daily question, or jump straight into the arena.
                                </p>
                                <div className="mt-6 flex flex-wrap gap-3 sm:mt-8 sm:gap-4">
                                    <NavLink
                                        to={summary?.continueProblem ? `/problem/${summary.continueProblem.problemId}` : "/problems"}
                                        className={`rounded-2xl px-5 py-3 text-sm font-black transition hover:scale-[1.02] sm:px-6 sm:py-3.5 ${
                                            darkMode
                                                ? "bg-indigo-500 text-white hover:bg-indigo-400"
                                                : "bg-slate-900 text-white hover:bg-slate-800"
                                        }`}
                                    >
                                        Continue Solving
                                    </NavLink>
                                    <NavLink
                                        to="/problems"
                                        className={`rounded-2xl border px-5 py-3 text-sm font-black transition sm:px-6 sm:py-3.5 ${
                                            darkMode
                                                ? "border-slate-700 text-slate-200 hover:border-indigo-400 hover:text-white"
                                                : "border-slate-300 text-slate-700 hover:border-slate-900 hover:text-slate-900"
                                        }`}
                                    >
                                        Open Problem Library
                                    </NavLink>
                                </div>
                            </div>

                            <div className="grid gap-3 grid-cols-2 sm:gap-4">
                                <StatPill label="Current streak" value={summary?.currentStreak ?? 0} darkMode={darkMode} accent="text-cyan-500" />
                                <StatPill label="Longest streak" value={summary?.longestStreak ?? 0} darkMode={darkMode} accent="text-indigo-500" />
                                <StatPill label="Solved total" value={summary?.solvedTotal ?? 0} darkMode={darkMode} accent="text-emerald-500" />
                                <StatPill label="Arena rating" value={summary?.battleSnapshot?.rating ?? 1200} darkMode={darkMode} accent="text-fuchsia-500" />
                                <div className={`col-span-2 rounded-2xl border p-4 sm:p-5 ${darkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-white shadow-sm"}`}>
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Battle snapshot</p>
                                            <h2 className={`mt-2 text-lg sm:text-xl font-black ${darkMode ? "text-white" : "text-slate-900"}`}>
                                                Rank {summary?.battleSnapshot?.rank || user?.rank || "Rookie"}
                                            </h2>
                                        </div>
                                        <div className={`rounded-2xl px-3 py-2 text-right sm:px-4 sm:py-3 ${darkMode ? "bg-slate-900/80" : "bg-slate-50"}`}>
                                            <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Win rate</p>
                                            <p className={`mt-1 text-xl sm:text-2xl font-black ${darkMode ? "text-white" : "text-slate-900"}`}>
                                                {summary?.battleSnapshot?.winRate ?? 0}%
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </InteractiveHeroBackdrop>

                <section className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                    <div className="grid gap-5 sm:gap-6 xl:grid-cols-[1.02fr_0.98fr]">
                        <SectionCard darkMode={darkMode}>
                            <p className={`text-xs font-bold uppercase tracking-[0.18em] ${darkMode ? "text-indigo-400" : "text-indigo-600"}`}>Continue run</p>
                            <h2 className="mt-3 text-2xl sm:text-3xl font-black">Your next clean move is already lined up.</h2>
                            {summary?.continueProblem ? (
                                <div className={`mt-5 sm:mt-6 rounded-2xl border p-4 sm:p-5 ${darkMode ? "border-slate-800 bg-slate-950/70" : "border-slate-200 bg-slate-50"}`}>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${darkMode ? "bg-slate-800 text-slate-300" : "bg-white text-slate-700"}`}>
                                            {summary.continueProblem.difficulty}
                                        </span>
                                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${darkMode ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-50 text-indigo-700"}`}>
                                            {formatTagText(summary.continueProblem.tags)}
                                        </span>
                                    </div>
                                    <h3 className={`mt-3 text-xl sm:text-2xl font-black ${darkMode ? "text-white" : "text-slate-900"}`}>{summary.continueProblem.title}</h3>
                                    <p className={`mt-2 text-sm leading-7 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                                        No hunting around. Re-enter the workspace and keep the momentum from slipping.
                                    </p>
                                    <NavLink to={`/problem/${summary.continueProblem.problemId}`} className="mt-5 inline-flex rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 text-sm font-black text-white hover:from-indigo-500 hover:to-purple-500">
                                        Resume Problem
                                    </NavLink>
                                </div>
                            ) : (
                                <div className="mt-5 sm:mt-6">
                                    <EmptyState
                                        title="No active problem yet"
                                        description="Start your first solve and CodeRax will keep your best next move visible here."
                                        darkMode={darkMode}
                                        action={<NavLink to="/problems" className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-bold text-white">Start Solving</NavLink>}
                                    />
                                </div>
                            )}
                        </SectionCard>

                        <SectionCard darkMode={darkMode}>
                            <p className={`text-xs font-bold uppercase tracking-[0.18em] ${darkMode ? "text-amber-300" : "text-amber-700"}`}>Daily challenge</p>
                            <h2 className="mt-3 text-2xl sm:text-3xl font-black">One featured problem. One clear target for today.</h2>
                            {summary?.dailyChallenge ? (
                                <div className={`mt-5 sm:mt-6 rounded-2xl border p-4 sm:p-5 ${darkMode ? "border-slate-800 bg-slate-950/70" : "border-slate-200 bg-slate-50"}`}>
                                    <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${darkMode ? "bg-amber-500/15 text-amber-300" : "bg-amber-50 text-amber-700"}`}>
                                        Admin picked
                                    </span>
                                    <h3 className={`mt-3 text-xl sm:text-2xl font-black ${darkMode ? "text-white" : "text-slate-900"}`}>{summary.dailyChallenge.title}</h3>
                                    <p className={`mt-2 text-sm leading-7 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                                        Hit the platform's featured question before your streak window closes.
                                    </p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${darkMode ? "bg-slate-800 text-slate-300" : "bg-white text-slate-700"}`}>
                                            {summary.dailyChallenge.difficulty}
                                        </span>
                                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${darkMode ? "bg-cyan-500/20 text-cyan-300" : "bg-cyan-50 text-cyan-700"}`}>
                                            {formatTagText(summary.dailyChallenge.tags)}
                                        </span>
                                    </div>
                                    <NavLink to={`/problem/${summary.dailyChallenge.problemId}`} className="mt-5 inline-flex rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 text-sm font-black text-white hover:from-indigo-500 hover:to-purple-500">
                                        Solve Challenge
                                    </NavLink>
                                </div>
                            ) : (
                                <div className="mt-5 sm:mt-6">
                                    <EmptyState
                                        title="Daily challenge not set"
                                        description="Your admin has not pinned a challenge yet, so head into the library and choose a strong medium question."
                                        darkMode={darkMode}
                                        action={<NavLink to="/problems" className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-bold text-white">Open Problems</NavLink>}
                                    />
                                </div>
                            )}
                        </SectionCard>
                    </div>

                    <div className="mt-6 grid gap-5 sm:mt-8 sm:gap-6 xl:grid-cols-[0.88fr_1.12fr]">
                        <SectionCard darkMode={darkMode}>
                            <p className={`text-xs font-bold uppercase tracking-[0.18em] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Progress by difficulty</p>
                            <h2 className="mt-3 text-xl sm:text-2xl font-black">Keep your skill tree balanced.</h2>
                            <div className="mt-6 sm:mt-8 space-y-5 sm:space-y-6">
                                <ProgressBar label="Easy" solved={summary?.difficultyProgress?.easy?.solved || 0} total={summary?.difficultyProgress?.easy?.total || 0} darkMode={darkMode} accent="from-emerald-400 to-emerald-500" />
                                <ProgressBar label="Medium" solved={summary?.difficultyProgress?.medium?.solved || 0} total={summary?.difficultyProgress?.medium?.total || 0} darkMode={darkMode} accent="from-amber-400 to-orange-500" />
                                <ProgressBar label="Hard" solved={summary?.difficultyProgress?.hard?.solved || 0} total={summary?.difficultyProgress?.hard?.total || 0} darkMode={darkMode} accent="from-rose-400 to-rose-500" />
                            </div>
                        </SectionCard>

                        <SectionCard darkMode={darkMode}>
                            <p className={`text-xs font-bold uppercase tracking-[0.18em] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Recent wins</p>
                            <h2 className="mt-3 text-xl sm:text-2xl font-black">The latest problems you put away.</h2>
                            {noSolvesYet ? (
                                <div className="mt-5 sm:mt-6">
                                    <EmptyState
                                        title="No accepted solves yet"
                                        description="Your first accepted problem will start filling this section with visible momentum."
                                        darkMode={darkMode}
                                        action={<NavLink to="/problems" className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-bold text-white">Solve First Problem</NavLink>}
                                    />
                                </div>
                            ) : (
                                <div className="mt-5 sm:mt-6 grid gap-3 grid-cols-1 sm:grid-cols-2">
                                    {summary?.recentSolved?.slice(0, 4).map((problem) => (
                                        <NavLink
                                            key={problem.problemId}
                                            to={`/problem/${problem.problemId}`}
                                            className={`rounded-2xl border px-4 py-3 transition ${darkMode ? "border-slate-800 bg-slate-950/70 hover:border-indigo-500/40" : "border-slate-200 bg-slate-50 hover:border-indigo-300 hover:shadow-md"}`}
                                        >
                                            <h3 className={`text-sm font-black ${darkMode ? "text-white" : "text-slate-900"}`}>{problem.title}</h3>
                                            <p className={`mt-2 text-xs uppercase tracking-[0.16em] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                                                {formatTagText(problem.tags)}
                                            </p>
                                            <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize ${darkMode ? "bg-slate-800 text-slate-300" : "bg-white text-slate-700"}`}>
                                                {problem.difficulty}
                                            </span>
                                        </NavLink>
                                    ))}
                                </div>
                            )}
                        </SectionCard>
                    </div>

                    <section className="mt-6 sm:mt-8">
                        <div className="mb-4">
                            <p className={`text-xs font-bold uppercase tracking-[0.18em] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Launch fast</p>
                            <h2 className="mt-3 text-xl sm:text-2xl font-black">Move across CodeRax without losing pace.</h2>
                        </div>
                        <div className="grid gap-3 grid-cols-2 sm:gap-4 md:grid-cols-3 xl:grid-cols-5">
                            {DEFAULT_FEATURE_ORDER.map((feature) => (
                                <NavLink key={feature.key} to={feature.route} className={`group rounded-2xl bg-gradient-to-br ${feature.accent} p-[1px] transition hover:-translate-y-1`}>
                                    <div className={`flex h-full flex-col rounded-2xl p-4 transition sm:p-5 ${darkMode ? "bg-slate-950 group-hover:bg-slate-900" : "bg-white group-hover:bg-slate-50"}`}>
                                        <span className="text-xl sm:text-2xl">{featureIcons[feature.key]}</span>
                                        <h3 className={`mt-2 text-sm sm:text-lg font-black ${darkMode ? "text-white" : "text-slate-900"}`}>{feature.title}</h3>
                                        <p className={`mt-1 text-xs sm:text-sm leading-5 sm:leading-6 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{feature.description}</p>
                                    </div>
                                </NavLink>
                            ))}
                        </div>
                    </section>
                </section>
            </main>

            <Footer darkMode={darkMode} />
        </div>
    );
}

export default Home;
