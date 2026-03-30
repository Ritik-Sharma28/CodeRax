function StepLegend({ items, darkMode }) {
    if (!items?.length) return null;

    return (
        <div className="flex flex-wrap gap-1.5">
            {items.map((item) => (
                <div
                    key={item.label}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium ${darkMode ? 'border-slate-700 bg-slate-900 text-slate-300' : 'border-slate-200 bg-white text-slate-600'}`}
                >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.label}
                </div>
            ))}
        </div>
    );
}

export default function ExplanationPanel({ algorithm, step, stepIndex, totalSteps, darkMode }) {
    return (
        <div className={`flex h-full min-h-0 flex-col rounded-[24px] border p-3 ${darkMode ? 'border-slate-700/60 bg-slate-900/85' : 'border-slate-200/70 bg-white/90 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)]'}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className={`text-[10px] font-bold uppercase tracking-[0.28em] ${darkMode ? 'text-amber-300' : 'text-amber-700'}`}>Narration</p>
                    <h3 className={`mt-1 text-lg font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{algorithm.name}</h3>
                </div>

                <div className={`rounded-xl border px-3 py-2 text-right ${darkMode ? 'border-slate-700 bg-slate-950 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em]">Step</p>
                    <p className="mt-0.5 text-lg font-black">{Math.min(stepIndex + 1, totalSteps)} / {totalSteps}</p>
                </div>
            </div>

            <div className={`mt-2 rounded-[18px] border p-3 ${darkMode ? 'border-slate-700 bg-slate-950/80' : 'border-slate-200 bg-slate-50/90'}`}>
                <p className={`text-xs leading-5 ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                    {step?.message}
                </p>
            </div>

            <div className="mt-2 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                <StepLegend items={algorithm.legend} darkMode={darkMode} />

                {step?.details?.length ? (
                    <div className="grid gap-2 sm:grid-cols-2">
                        {step.details.map((detail) => (
                            <div
                                key={detail.label}
                                className={`rounded-xl border p-3 ${darkMode ? 'border-slate-700 bg-slate-950/70' : 'border-slate-200 bg-white'}`}
                            >
                                <p className={`text-[10px] font-bold uppercase tracking-[0.22em] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{detail.label}</p>
                                <p className={`mt-1 text-xs font-medium break-words ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{detail.value}</p>
                            </div>
                        ))}
                    </div>
                ) : null}

                <div className={`rounded-[18px] border p-3 ${darkMode ? 'border-slate-700 bg-slate-950/70' : 'border-slate-200 bg-white'}`}>
                    <p className={`text-[10px] font-bold uppercase tracking-[0.22em] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Pseudocode</p>
                    <div className="mt-2 space-y-1 font-mono text-[11px]">
                        {algorithm.pseudocode.map((line, index) => {
                            const active = step?.codeLine === index;
                            return (
                                <div
                                    key={`${index}-${line}`}
                                    className={`rounded-lg px-2.5 py-1.5 transition-colors ${active
                                        ? (darkMode ? 'bg-amber-400/15 text-amber-200' : 'bg-amber-100 text-amber-900')
                                        : (darkMode ? 'text-slate-400' : 'text-slate-500')
                                        }`}
                                >
                                    <span className={`mr-2 inline-block w-4 ${active ? 'font-bold' : ''}`}>{index + 1}</span>
                                    {line}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
