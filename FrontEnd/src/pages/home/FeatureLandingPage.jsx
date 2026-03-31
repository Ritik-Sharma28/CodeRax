import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import FeaturePreview from "../../components/FeaturePreview";
import InteractiveHeroBackdrop from "../../components/brand/InteractiveHeroBackdrop";
import { useThemeMode } from "../../context/ThemeContext";
import { FEATURE_CATALOG } from "../../utils/featureCatalog";
import { NavLink } from "react-router";

function FeatureLandingPage({ featureKey }) {
    const { darkMode, setDarkMode } = useThemeMode();
    const feature = FEATURE_CATALOG[featureKey];

    if (!feature) return null;

    return (
        <div className={`min-h-screen ${darkMode ? "bg-slate-950 text-white" : "bg-[#f8f9fc] text-slate-900"}`}>
            <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

            <main className="overflow-hidden">
                {/* Hero section */}
                <InteractiveHeroBackdrop darkMode={darkMode} className="border-b border-transparent">
                    <section className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
                        <div className="mx-auto max-w-3xl text-center">
                            <p className={`text-xs font-bold uppercase tracking-[0.3em] ${darkMode ? "text-indigo-400" : "text-indigo-600"}`}>
                                {feature.eyebrow}
                            </p>
                            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                                <span className="gradient-text">{feature.heroTagline || feature.title}</span>
                            </h1>
                            <p className={`mt-5 text-base leading-8 sm:text-lg ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                                {feature.longDescription || feature.description}
                            </p>
                            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                                <NavLink
                                    to="/signup"
                                    className={`rounded-2xl px-6 py-3.5 text-sm font-black transition hover:scale-[1.02] ${
                                        darkMode
                                            ? "bg-indigo-500 text-white hover:bg-indigo-400"
                                            : "bg-slate-900 text-white hover:bg-slate-800"
                                    }`}
                                >
                                    Get Started Free
                                </NavLink>
                                <NavLink
                                    to="/login"
                                    className={`rounded-2xl border px-6 py-3.5 text-sm font-black transition ${
                                        darkMode
                                            ? "border-slate-700 text-slate-200 hover:border-indigo-400"
                                            : "border-slate-300 text-slate-700 hover:border-slate-900"
                                    }`}
                                >
                                    Log In
                                </NavLink>
                            </div>
                        </div>
                    </section>
                </InteractiveHeroBackdrop>

                {/* Highlights grid */}
                {feature.highlights?.length > 0 && (
                    <section className={`py-16 sm:py-20 ${darkMode ? "" : "bg-white"}`}>
                        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
                            <div className="mx-auto max-w-3xl text-center">
                                <p className={`text-xs font-bold uppercase tracking-[0.22em] ${darkMode ? "text-cyan-400" : "text-cyan-700"}`}>
                                    What it does
                                </p>
                                <h2 className={`mt-3 text-3xl font-black sm:text-4xl ${darkMode ? "text-white" : "text-slate-900"}`}>
                                    Key capabilities
                                </h2>
                            </div>
                            <div className="mt-10 grid gap-5 sm:grid-cols-3">
                                {feature.highlights.map((h) => (
                                    <div
                                        key={h.title}
                                        className={`rounded-2xl border p-6 transition-all hover:-translate-y-1 ${
                                            darkMode
                                                ? "border-slate-800 bg-slate-900/50 hover:border-indigo-500/30"
                                                : "border-slate-200 bg-white hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50"
                                        }`}
                                    >
                                        <div className="text-3xl">{h.icon}</div>
                                        <h3 className={`mt-3 text-lg font-black ${darkMode ? "text-white" : "text-slate-900"}`}>{h.title}</h3>
                                        <p className={`mt-2 text-sm leading-7 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{h.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Benefits list */}
                {feature.benefits?.length > 0 && (
                    <section className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
                        <div className="mx-auto max-w-3xl text-center">
                            <p className={`text-xs font-bold uppercase tracking-[0.22em] ${darkMode ? "text-indigo-400" : "text-indigo-600"}`}>
                                Why it matters
                            </p>
                            <h2 className={`mt-3 text-3xl font-black sm:text-4xl ${darkMode ? "text-white" : "text-slate-900"}`}>
                                How {feature.title} helps you
                            </h2>
                        </div>
                        <div className="mx-auto mt-10 max-w-2xl space-y-4">
                            {feature.benefits.map((benefit, index) => (
                                <div
                                    key={index}
                                    className={`flex items-start gap-4 rounded-2xl border p-5 ${
                                        darkMode
                                            ? "border-slate-800 bg-slate-900/40"
                                            : "border-slate-200 bg-white"
                                    }`}
                                >
                                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                                        darkMode ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-100 text-indigo-600"
                                    }`}>
                                        {index + 1}
                                    </span>
                                    <p className={`text-sm leading-7 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                                        {benefit}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* CTA banner */}
                <section className="mx-auto max-w-[1440px] px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
                    <div
                        className={`overflow-hidden rounded-3xl p-8 sm:p-12 text-center ${
                            darkMode
                                ? "bg-gradient-to-br from-indigo-900/40 via-slate-900 to-purple-900/30 border border-indigo-500/20"
                                : "bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700"
                        }`}
                    >
                        <h2 className="text-2xl font-black text-white sm:text-3xl">
                            Ready to try {feature.title}?
                        </h2>
                        <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-white/70 sm:text-base">
                            Create a free account and unlock the full {feature.title} experience.
                        </p>
                        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
                            <NavLink
                                to="/signup"
                                className="rounded-2xl bg-white px-6 py-3.5 text-sm font-black text-slate-900 transition hover:bg-slate-100"
                            >
                                Create Free Account
                            </NavLink>
                        </div>
                    </div>
                </section>
            </main>

            <Footer darkMode={darkMode} />
        </div>
    );
}

export default FeatureLandingPage;
