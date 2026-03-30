import { motion } from 'motion/react';

const MotionDiv = motion.div;

function chipClasses(active, darkMode, tone = 'split') {
    if (active) {
        return darkMode ? 'border-amber-300 bg-amber-300/15 text-amber-100' : 'border-amber-300 bg-amber-100 text-amber-800';
    }

    if (tone === 'merge') {
        return darkMode ? 'border-emerald-300/40 bg-emerald-400/12 text-emerald-100' : 'border-emerald-300 bg-emerald-100 text-emerald-800';
    }

    return darkMode ? 'border-slate-700 bg-slate-950 text-slate-200' : 'border-slate-200 bg-white text-slate-800';
}

function SegmentRow({ segments, darkMode, tone = 'split' }) {
    return (
        <div className="flex flex-wrap items-center justify-center gap-2">
            {segments.map((segment) => (
                <MotionDiv
                    key={segment.id}
                    layout
                    transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                    className={`rounded-[18px] border px-2.5 py-2 ${chipClasses(segment.active, darkMode, tone)}`}
                >
                    <div className="flex flex-wrap items-center justify-center gap-1.5">
                        {segment.values.map((value, index) => (
                            <span key={`${segment.id}-${index}-${value}`} className="rounded-lg bg-black/10 px-2.5 py-1.5 text-xs font-black">
                                {value}
                            </span>
                        ))}
                    </div>
                </MotionDiv>
            ))}
        </div>
    );
}

export default function MergeSortRenderer({ step, darkMode }) {
    const splitRows = step.state.splitRows || [];
    const mergeRows = step.state.mergeRows || [];

    return (
        <div className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto p-3">
            {/* Split section */}
            <div className={`min-h-0 rounded-[20px] border p-3 ${darkMode ? 'border-slate-700/60 bg-slate-950/80' : 'border-slate-200/70 bg-white/95'}`}>
                <div className="flex items-center justify-between gap-2">
                    <p className={`text-[10px] font-bold uppercase tracking-[0.24em] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Split Downward</p>
                    <p className={`text-[10px] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Each recursive split appears on the row below.</p>
                </div>
                <div className="mt-3 flex min-h-0 flex-col justify-center gap-2 overflow-hidden">
                    {splitRows.map((segments, index) => (
                        <SegmentRow key={`split-row-${index}`} segments={segments} darkMode={darkMode} />
                    ))}
                </div>
            </div>

            {/* Merge + Info section */}
            <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(0,1fr)_240px]">
                <div className={`min-h-0 rounded-[20px] border p-3 ${darkMode ? 'border-slate-700/60 bg-slate-950/80' : 'border-slate-200/70 bg-white/95'}`}>
                    <div className="flex items-center justify-between gap-2">
                        <p className={`text-[10px] font-bold uppercase tracking-[0.24em] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Merge Upward</p>
                        <p className={`text-[10px] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Merged pieces build toward the final array.</p>
                    </div>

                    <div className="mt-3 flex min-h-0 flex-col-reverse justify-start gap-2 overflow-hidden">
                        {mergeRows.length ? mergeRows.map((segments, index) => (
                            <SegmentRow key={`merge-row-${index}`} segments={segments} darkMode={darkMode} tone="merge" />
                        )) : (
                            <div className={`flex h-full items-center justify-center rounded-[18px] border border-dashed text-xs ${darkMode ? 'border-slate-700 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
                                Merged rows will rise here as recursion unwinds.
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <div className={`rounded-[20px] border p-3 ${darkMode ? 'border-slate-700/60 bg-slate-950/80' : 'border-slate-200/70 bg-white/95'}`}>
                        <p className={`text-[10px] font-bold uppercase tracking-[0.24em] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Compare</p>
                        <p className={`mt-2 text-xs font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                            {step.state.comparePair?.length ? `${step.state.comparePair[0]} vs ${step.state.comparePair[1]}` : 'No active comparison'}
                        </p>
                    </div>
                    <div className={`rounded-[20px] border p-3 ${darkMode ? 'border-slate-700/60 bg-slate-950/80' : 'border-slate-200/70 bg-white/95'}`}>
                        <p className={`text-[10px] font-bold uppercase tracking-[0.24em] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Live Merge Output</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                            {(step.state.mergeOutput || []).map((value, index) => (
                                <MotionDiv
                                    key={`merge-output-${index}-${value}`}
                                    layout
                                    className={`rounded-xl border px-2 py-1 text-xs font-black ${darkMode ? 'border-emerald-300/40 bg-emerald-400/12 text-emerald-100' : 'border-emerald-300 bg-emerald-100 text-emerald-800'}`}
                                >
                                    {value}
                                </MotionDiv>
                            ))}
                        </div>
                    </div>
                    <div className={`rounded-[20px] border p-3 ${darkMode ? 'border-slate-700/60 bg-slate-950/80' : 'border-slate-200/70 bg-white/95'}`}>
                        <p className={`text-[10px] font-bold uppercase tracking-[0.24em] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Current Halves</p>
                        <p className={`mt-1 text-xs ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>Left: {(step.state.leftSegment || []).join(', ') || 'None'}</p>
                        <p className={`mt-0.5 text-xs ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>Right: {(step.state.rightSegment || []).join(', ') || 'None'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
