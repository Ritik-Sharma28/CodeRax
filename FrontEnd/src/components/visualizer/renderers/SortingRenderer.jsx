import { motion } from 'motion/react';

const MotionDiv = motion.div;

function statusClasses(status, darkMode) {
    const palette = {
        compare: darkMode ? 'border-amber-300 bg-amber-300/15 text-amber-100' : 'border-amber-300 bg-amber-100 text-amber-800',
        swap: darkMode ? 'border-rose-300 bg-rose-400/15 text-rose-100' : 'border-rose-300 bg-rose-100 text-rose-800',
        sorted: darkMode ? 'border-emerald-300 bg-emerald-400/15 text-emerald-100' : 'border-emerald-300 bg-emerald-100 text-emerald-800',
        current: darkMode ? 'border-cyan-300 bg-cyan-300/15 text-cyan-100' : 'border-cyan-300 bg-cyan-100 text-cyan-800',
        candidate: darkMode ? 'border-violet-300 bg-violet-300/15 text-violet-100' : 'border-violet-300 bg-violet-100 text-violet-800',
        shifted: darkMode ? 'border-fuchsia-300 bg-fuchsia-300/15 text-fuchsia-100' : 'border-fuchsia-300 bg-fuchsia-100 text-fuchsia-800',
        default: darkMode ? 'border-slate-700 bg-slate-950 text-slate-200' : 'border-slate-200 bg-white text-slate-800',
    };

    return palette[status] || palette.default;
}

export default function SortingRenderer({ step, darkMode }) {
    const items = step.state.items || [];
    const statusMap = step.state.statusMap || {};
    const sortedValues = items.filter((item) => step.state.sortedIds?.includes(item.id)).map((item) => item.value);

    return (
        <div className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto p-3">
            {/* Array motion */}
            <div className={`rounded-[20px] border p-3 ${darkMode ? 'border-slate-700/60 bg-slate-950/80' : 'border-slate-200/70 bg-white/95'}`}>
                <div className="flex items-center justify-between gap-2">
                    <p className={`text-[10px] font-bold uppercase tracking-[0.24em] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Array Motion</p>
                    <p className={`text-[10px] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Cells move directly when the algorithm swaps or shifts.</p>
                </div>

                <div className="mt-3 overflow-x-auto pb-2 pt-5">
                    <div className="mx-auto flex min-w-max items-center justify-center gap-2">
                        {items.map((item, index) => {
                            const status = statusMap[item.id] || 'default';
                            return (
                                <MotionDiv
                                    key={item.id}
                                    layout
                                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                                    animate={{
                                        y: status === 'current' ? -14 : status === 'compare' ? -8 : 0,
                                        scale: status === 'swap' ? 1.06 : 1,
                                        rotate: status === 'swap' ? (index % 2 === 0 ? -3 : 3) : 0,
                                    }}
                                    className={`flex h-[72px] w-[56px] shrink-0 flex-col items-center justify-center rounded-[20px] border-2 shadow-[0_16px_28px_-22px_rgba(15,23,42,0.7)] ${statusClasses(status, darkMode)}`}
                                >
                                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-70">idx {index}</span>
                                    <span className="mt-1 text-xl font-black">{item.value}</span>
                                </MotionDiv>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Bottom info row — Live Result | Current Action | Locked Output */}
            <div className="grid gap-3 lg:grid-cols-3">
                <div className={`rounded-[20px] border p-3 ${darkMode ? 'border-slate-700/60 bg-slate-950/80' : 'border-slate-200/70 bg-white/95'}`}>
                    <p className={`text-[10px] font-bold uppercase tracking-[0.24em] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Live Result</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        {items.map((item) => (
                            <MotionDiv
                                key={`result-${item.id}`}
                                layout
                                className={`rounded-xl border px-2 py-1 text-xs font-bold ${statusClasses(statusMap[item.id] || 'default', darkMode)}`}
                            >
                                {item.value}
                            </MotionDiv>
                        ))}
                    </div>
                </div>

                <div className={`rounded-[20px] border p-3 ${darkMode ? 'border-slate-700/60 bg-slate-950/80' : 'border-slate-200/70 bg-white/95'}`}>
                    <p className={`text-[10px] font-bold uppercase tracking-[0.24em] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Current Action</p>
                    <p className={`mt-2 text-xs font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                        {step.state.comparedValues?.length ? `${step.state.comparedValues[0]} vs ${step.state.comparedValues[1]}` : 'Waiting for next comparison'}
                    </p>
                </div>

                <div className={`rounded-[20px] border p-3 ${darkMode ? 'border-slate-700/60 bg-slate-950/80' : 'border-slate-200/70 bg-white/95'}`}>
                    <p className={`text-[10px] font-bold uppercase tracking-[0.24em] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Locked Output</p>
                    <p className={`mt-2 text-xs ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                        {sortedValues.length ? sortedValues.join(', ') : 'No positions locked yet'}
                    </p>
                </div>
            </div>
        </div>
    );
}
