import { NavLink } from "react-router";
import SectionCard from "./ui/SectionCard";

function FeaturePreview({ feature, darkMode }) {
    return (
        <SectionCard darkMode={darkMode} className="overflow-hidden">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                <div>
                    <p className={`text-xs font-bold uppercase tracking-[0.22em] ${darkMode ? "text-indigo-400" : "text-indigo-600"}`}>
                        {feature.eyebrow}
                    </p>
                    <h2 className={`mt-3 text-3xl font-black sm:text-4xl ${darkMode ? "text-white" : "text-slate-900"}`}>
                        {feature.heroTagline || feature.title}
                    </h2>
                    <p className={`mt-4 max-w-xl text-sm leading-7 sm:text-base ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                        {feature.longDescription || feature.description}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <NavLink
                            to="/signup"
                            className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 text-sm font-bold text-white transition hover:from-indigo-500 hover:to-purple-500"
                        >
                            Get Started
                        </NavLink>
                        <NavLink
                            to="/login"
                            className={`rounded-2xl border px-5 py-3 text-sm font-bold transition ${
                                darkMode ? "border-slate-700 text-slate-200 hover:border-indigo-400 hover:text-white" : "border-slate-200 text-slate-700 hover:border-slate-400 hover:text-slate-900"
                            }`}
                        >
                            Log in
                        </NavLink>
                    </div>
                </div>

                <div className={`rounded-2xl border p-5 sm:p-6 ${darkMode ? "border-slate-800 bg-slate-950/70" : "border-slate-200 bg-slate-50"}`}>
                    {feature.highlights?.length > 0 ? (
                        <div className="space-y-4">
                            {feature.highlights.map((h) => (
                                <div
                                    key={h.title}
                                    className={`flex items-start gap-3 rounded-2xl border p-4 ${
                                        darkMode ? "border-slate-800 bg-slate-900 text-slate-200" : "border-slate-200 bg-white text-slate-700"
                                    }`}
                                >
                                    <span className="text-xl shrink-0">{h.icon}</span>
                                    <div>
                                        <p className="text-sm font-bold">{h.title}</p>
                                        <p className={`mt-1 text-xs leading-5 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{h.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={`rounded-2xl bg-gradient-to-br ${feature.accent} p-[1px]`}>
                            <div className={`rounded-2xl p-6 ${darkMode ? "bg-slate-950" : "bg-white"}`}>
                                <p className={`text-xs font-bold uppercase tracking-[0.2em] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Why it matters</p>
                                <p className={`mt-3 text-sm leading-6 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                                    CodeRax keeps this experience available to guests so they can understand the value before committing to an account.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </SectionCard>
    );
}

export default FeaturePreview;
