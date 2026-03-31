import { NavLink } from "react-router";
import { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import BrandWordmark from "../../components/brand/BrandWordmark";
import InteractiveHeroBackdrop from "../../components/brand/InteractiveHeroBackdrop";
import FAQSection from "../../components/landing/FAQSection";
import StatsCounter from "../../components/landing/StatsCounter";
import FeatureShowcase from "../../components/landing/FeatureShowcase";
import HowItWorks from "../../components/landing/HowItWorks";
import { useThemeMode } from "../../context/ThemeContext";
import { DEFAULT_FEATURE_ORDER, resolveFeaturedModules } from "../../utils/featureCatalog";
import contentService from "../../services/contentService";

/* ──────────────── TAGLINE CONFIG ──────────────── */
// ✏️  Change these two lines to update the site-wide tagline:
const TAGLINE_MAIN = "Where AI Meets the Arena";
const TAGLINE_SUB = "Practice with AI. Battle in Real-Time. Dominate DSA.";
/* ──────────────────────────────────────────────── */

function LandingPage() {
    const { darkMode, setDarkMode } = useThemeMode();
    const [content, setContent] = useState(null);
    const [status, setStatus] = useState("loading");

    const loadContent = async () => {
        setStatus("loading");
        try {
            const data = await contentService.getPublicContent();
            setContent(data);
            setStatus("success");
        } catch (error) {
            setStatus("error");
        }
    };

    useEffect(() => {
        loadContent();
    }, []);

    const features = useMemo(
        () => resolveFeaturedModules(content?.homepageFeaturedModules),
        [content?.homepageFeaturedModules]
    );

    return (
        <div className={`min-h-screen ${darkMode ? "bg-slate-950 text-white" : "bg-[#f8f9fc] text-slate-900"}`}>
            <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

            <main className="overflow-hidden">
                {/* ═══════ SECTION 1 — HERO ═══════ */}
                <InteractiveHeroBackdrop darkMode={darkMode} intensity={1.15} className="min-h-[94vh]">
                    <section className="mx-auto flex min-h-[94vh] max-w-[1440px] items-center px-4 pb-14 pt-12 sm:px-6 lg:px-8">
                        <div className="w-full grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                            {/* Left — Copy */}
                            <div className="max-w-4xl">
                                <p className={`text-xs font-bold uppercase tracking-[0.3em] ${darkMode ? "text-indigo-400" : "text-indigo-600"}`}>
                                    {content?.heroBadge || "CodeRax — The DSA Arena"}
                                </p>
                                <BrandWordmark darkMode={darkMode} className="mt-5" />
                                <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[0.92] tracking-tight sm:text-5xl lg:text-7xl">
                                    <span className="gradient-text">{TAGLINE_MAIN}</span>
                                </h1>
                                <p className={`mt-5 max-w-2xl text-base leading-8 sm:text-lg ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                                    {content?.heroSubheadline || TAGLINE_SUB}
                                </p>

                                {/* CTAs */}
                                <div className="mt-8 flex flex-wrap gap-4">
                                    <NavLink
                                        to="/signup"
                                        className={`rounded-2xl px-6 py-3.5 text-sm font-black transition hover:scale-[1.02] ${
                                            darkMode
                                                ? "bg-indigo-500 text-white hover:bg-indigo-400"
                                                : "bg-slate-900 text-white hover:bg-slate-800"
                                        }`}
                                    >
                                        Start Free — No Card Needed
                                    </NavLink>
                                    <NavLink
                                        to="/problems"
                                        className={`rounded-2xl border px-6 py-3.5 text-sm font-black transition ${
                                            darkMode
                                                ? "border-slate-700 text-slate-200 hover:border-indigo-400 hover:text-white"
                                                : "border-slate-300 text-slate-700 hover:border-slate-900 hover:text-slate-900"
                                        }`}
                                    >
                                        Explore Problems
                                    </NavLink>
                                </div>

                                {/* Quick stats row */}
                                <div className="mt-10 grid gap-3 grid-cols-2 sm:grid-cols-3">
                                    {[
                                        { label: "AI Tools", value: "3 Integrated" },
                                        { label: "Battle Arena", value: "Real-Time 1v1" },
                                        { label: "Visualizer", value: "10+ Algorithms" },
                                    ].map((item) => (
                                        <div
                                            key={item.label}
                                            className={`rounded-2xl border px-4 py-3 ${
                                                darkMode
                                                    ? "border-white/10 bg-white/5"
                                                    : "border-slate-200 bg-white/80 shadow-sm"
                                            }`}
                                        >
                                            <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                                                {item.label}
                                            </p>
                                            <p className={`mt-1 text-sm font-bold ${darkMode ? "text-slate-100" : "text-slate-800"}`}>
                                                {item.value}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right — Feature cards grid */}
                            <div className="relative hidden sm:block">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {features.slice(0, 4).map((feature, index) => (
                                        <NavLink
                                            key={feature.key}
                                            to={feature.route}
                                            className={`rounded-2xl bg-gradient-to-br ${feature.accent} p-[1px] transition duration-300 hover:-translate-y-1 hover:shadow-lg ${
                                                index >= 2 ? "lg:-mt-2" : ""
                                            }`}
                                        >
                                            <div
                                                className={`h-full rounded-2xl p-5 ${
                                                    darkMode ? "bg-slate-950/95" : "bg-white/95"
                                                }`}
                                            >
                                                <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                                                    {feature.eyebrow}
                                                </p>
                                                <h2 className={`mt-2 text-lg font-black ${darkMode ? "text-white" : "text-slate-900"}`}>
                                                    {feature.title}
                                                </h2>
                                                <p className={`mt-2 text-sm leading-6 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                                                    {feature.description}
                                                </p>
                                            </div>
                                        </NavLink>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                </InteractiveHeroBackdrop>

                {/* ═══════ SECTION 2 — WHAT IS CODERAX ═══════ */}
                <section className={`py-16 sm:py-20 ${darkMode ? "" : "bg-white"}`}>
                    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-3xl text-center">
                            <p className={`text-xs font-bold uppercase tracking-[0.22em] ${darkMode ? "text-cyan-400" : "text-cyan-700"}`}>
                                What is CodeRax?
                            </p>
                            <h2 className={`mt-3 text-3xl font-black sm:text-4xl ${darkMode ? "text-white" : "text-slate-900"}`}>
                                One platform. Five weapons for your DSA journey.
                            </h2>
                            <p className={`mt-4 text-sm sm:text-base leading-7 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                                CodeRax isn't another LeetCode clone. It's a practice arena that blends AI coaching, real-time battles, visual learning, and mock interviews into one unified workspace.
                            </p>
                        </div>

                        <div className="mt-12 grid gap-5 sm:grid-cols-3">
                            {[
                                {
                                    icon: "🤖",
                                    title: "AI-Powered Practice",
                                    desc: "Revision Mentor identifies your weak spots and guides you through targeted revision with AI-generated insights and notes.",
                                },
                                {
                                    icon: "⚔️",
                                    title: "Live Battle Arena",
                                    desc: "Compete 1v1 in real-time coding battles. Same problem, same clock. Your ELO ranking proves you're getting faster.",
                                },
                                {
                                    icon: "📐",
                                    title: "Visual Algorithm Lab",
                                    desc: "Watch sorting algorithms, tree traversals, and graph operations animate step by step. Learn by seeing the data move.",
                                },
                            ].map((card) => (
                                <div
                                    key={card.title}
                                    className={`rounded-2xl border p-6 sm:p-7 transition-all hover:-translate-y-1 ${
                                        darkMode
                                            ? "border-slate-800 bg-slate-900/50 hover:border-indigo-500/30"
                                            : "border-slate-200 bg-white hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50"
                                    }`}
                                >
                                    <div className="text-3xl sm:text-4xl">{card.icon}</div>
                                    <h3 className={`mt-4 text-lg font-black ${darkMode ? "text-white" : "text-slate-900"}`}>{card.title}</h3>
                                    <p className={`mt-2 text-sm leading-7 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{card.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══════ SECTION 3 — FEATURE SHOWCASE ═══════ */}
                <FeatureShowcase darkMode={darkMode} />

                {/* ═══════ SECTION 4 — HOW IT WORKS ═══════ */}
                <HowItWorks darkMode={darkMode} />

                {/* ═══════ SECTION 5 — STATS ═══════ */}
                <StatsCounter darkMode={darkMode} />

                {/* ═══════ SECTION 6 — FAQ ═══════ */}
                <FAQSection darkMode={darkMode} />

                {/* ═══════ SECTION 7 — FINAL CTA ═══════ */}
                <section className="mx-auto max-w-[1440px] px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
                    <div
                        className={`relative overflow-hidden rounded-3xl p-8 sm:p-12 lg:p-16 text-center ${
                            darkMode
                                ? "bg-gradient-to-br from-indigo-900/40 via-slate-900 to-purple-900/30 border border-indigo-500/20"
                                : "bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700"
                        }`}
                    >
                        {/* Decorative glow */}
                        <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-cyan-400/20 blur-3xl" />
                        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-indigo-400/20 blur-3xl" />

                        <div className="relative z-10">
                            <h2 className="text-3xl font-black text-white sm:text-4xl lg:text-5xl">
                                Ready to enter the arena?
                            </h2>
                            <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-white/75 sm:text-lg">
                                {TAGLINE_SUB}
                            </p>
                            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                                <NavLink
                                    to="/signup"
                                    className="rounded-2xl bg-white px-7 py-3.5 text-sm font-black text-slate-900 transition hover:scale-[1.02] hover:bg-slate-100"
                                >
                                    Create Free Account
                                </NavLink>
                                <NavLink
                                    to="/problems"
                                    className="rounded-2xl border border-white/30 px-7 py-3.5 text-sm font-black text-white transition hover:bg-white/10"
                                >
                                    Browse Problems First
                                </NavLink>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer darkMode={darkMode} />
        </div>
    );
}

export default LandingPage;
