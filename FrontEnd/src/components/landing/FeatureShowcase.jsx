import { NavLink } from "react-router";
import { DEFAULT_FEATURE_ORDER } from "../../utils/featureCatalog";

const featureIcons = {
    problems: "💻",
    "revision-mentor": "🧠",
    "mock-interview": "🎙️",
    "dsa-visualizer": "📐",
    "battle-lobby": "⚔️",
};

function FeatureShowcase({ darkMode }) {
    return (
        <section className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
                <p
                    className={`text-xs font-bold uppercase tracking-[0.22em] ${
                        darkMode ? "text-indigo-400" : "text-indigo-600"
                    }`}
                >
                    Features
                </p>
                <h2
                    className={`mt-3 text-3xl font-black sm:text-4xl ${
                        darkMode ? "text-white" : "text-slate-900"
                    }`}
                >
                    Everything you need to dominate DSA
                </h2>
                <p
                    className={`mt-3 text-sm sm:text-base leading-7 ${
                        darkMode ? "text-slate-400" : "text-slate-500"
                    }`}
                >
                    Five integrated tools in one platform. No tab-hopping, no scattered bookmarks.
                </p>
            </div>

            <div className="mt-10 grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {DEFAULT_FEATURE_ORDER.map((feature, index) => (
                    <NavLink
                        key={feature.key}
                        to={feature.route}
                        className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${feature.accent} p-[1px] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                            index >= 3 ? "lg:col-span-1 sm:col-span-1" : ""
                        } ${index === 3 ? "lg:col-start-1 lg:col-end-2" : ""}`}
                    >
                        <div
                            className={`flex h-full flex-col rounded-2xl p-6 sm:p-7 ${
                                darkMode ? "bg-slate-950/95" : "bg-white/95"
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <span className="text-3xl">{featureIcons[feature.key]}</span>
                                <span
                                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                                        darkMode
                                            ? "bg-slate-800 text-slate-400"
                                            : "bg-slate-100 text-slate-500"
                                    }`}
                                >
                                    {feature.eyebrow}
                                </span>
                            </div>
                            <h3
                                className={`mt-4 text-lg font-black ${
                                    darkMode ? "text-white" : "text-slate-900"
                                }`}
                            >
                                {feature.title}
                            </h3>
                            <p
                                className={`mt-2 text-sm leading-7 ${
                                    darkMode ? "text-slate-400" : "text-slate-500"
                                }`}
                            >
                                {feature.description}
                            </p>
                            <div className="mt-auto pt-4">
                                <span
                                    className={`text-sm font-bold transition-colors ${
                                        darkMode
                                            ? "text-indigo-400 group-hover:text-indigo-300"
                                            : "text-indigo-600 group-hover:text-indigo-500"
                                    }`}
                                >
                                    Explore →
                                </span>
                            </div>
                        </div>
                    </NavLink>
                ))}
            </div>
        </section>
    );
}

export default FeatureShowcase;
