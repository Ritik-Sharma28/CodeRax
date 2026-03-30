import { motion } from 'motion/react';

const MotionButton = motion.button;

function categoryClasses(category, darkMode) {
    const tones = {
        Sorting: darkMode ? 'from-sky-500/15 to-cyan-500/5 border-sky-500/20' : 'from-sky-100 to-cyan-50 border-sky-200',
        Recursion: darkMode ? 'from-rose-500/15 to-orange-500/5 border-rose-500/20' : 'from-rose-100 to-orange-50 border-rose-200',
        Tree: darkMode ? 'from-emerald-500/15 to-lime-500/5 border-emerald-500/20' : 'from-emerald-100 to-lime-50 border-emerald-200',
        Graph: darkMode ? 'from-violet-500/15 to-fuchsia-500/5 border-violet-500/20' : 'from-violet-100 to-fuchsia-50 border-violet-200',
    };

    return tones[category] || (darkMode ? 'from-slate-800 to-slate-900 border-slate-700' : 'from-white to-slate-50 border-slate-200');
}

export default function AlgorithmSidebar({ algorithms, selectedId, onSelect, darkMode }) {
    const grouped = algorithms.reduce((acc, algorithm) => {
        if (!acc[algorithm.category]) acc[algorithm.category] = [];
        acc[algorithm.category].push(algorithm);
        return acc;
    }, {});

    return (
        <aside className={`flex h-full min-h-0 flex-col rounded-[24px] border overflow-hidden ${darkMode ? 'bg-slate-900/90 border-slate-700/60' : 'bg-white/90 border-slate-200/70 shadow-[0_20px_80px_-45px_rgba(15,23,42,0.35)]'}`}>
            <div className={`px-4 py-4 border-b ${darkMode ? 'border-slate-700/60 bg-slate-900/95' : 'border-slate-200/70 bg-white/95'}`}>
                <p className={`text-[11px] font-semibold uppercase tracking-[0.28em] ${darkMode ? 'text-amber-300' : 'text-amber-700'}`}>Algorithms</p>
                <p className={`mt-2 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Choose an animation.</p>
            </div>

            <div className="min-h-0 space-y-3 overflow-y-auto p-3">
                {Object.entries(grouped).map(([category, items]) => (
                    <section key={category} className={`rounded-[22px] border bg-gradient-to-br p-2.5 ${categoryClasses(category, darkMode)}`}>
                        <div className={`px-2 pb-2 text-[11px] font-bold uppercase tracking-[0.22em] ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                            {category}
                        </div>
                        <div className="space-y-2">
                            {items.map((algorithm) => {
                                const selected = selectedId === algorithm.id;
                                return (
                                    <MotionButton
                                        key={algorithm.id}
                                        whileHover={{ x: 3 }}
                                        whileTap={{ scale: 0.99 }}
                                        onClick={() => onSelect(algorithm.id)}
                                        className={`w-full rounded-[18px] border px-3 py-3 text-left transition-all duration-200 ${selected
                                            ? (darkMode ? 'border-white/10 bg-slate-950/70 shadow-[0_18px_40px_-30px_rgba(255,255,255,0.5)]' : 'border-white bg-white shadow-[0_20px_45px_-30px_rgba(15,23,42,0.35)]')
                                            : (darkMode ? 'border-transparent bg-slate-900/40 hover:bg-slate-950/70' : 'border-transparent bg-white/70 hover:bg-white')
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className={`text-[13px] font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{algorithm.name}</p>
                                                <p className={`mt-1 text-[11px] leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                                    {algorithm.shortDescription}
                                                </p>
                                            </div>
                                            <span className={`mt-0.5 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${selected
                                                ? (darkMode ? 'bg-amber-400/20 text-amber-300' : 'bg-amber-100 text-amber-700')
                                                : (darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500')
                                                }`}>
                                                {algorithm.badge}
                                            </span>
                                        </div>
                                    </MotionButton>
                                );
                            })}
                        </div>
                    </section>
                ))}
            </div>
        </aside>
    );
}
