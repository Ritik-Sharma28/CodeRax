import { motion } from 'motion/react';

const pegNames = ['Source', 'Helper', 'Target'];
const MotionDiv = motion.div;

function diskLabel(diskNumber) {
    return String.fromCharCode(64 + diskNumber); // 1→A, 2→B, 3→C, 4→D ...
}

export default function HanoiRenderer({ step, darkMode }) {
    const pegs = step.state.pegs || [[], [], []];

    return (
        <div className="flex h-full min-h-0 flex-col overflow-y-auto p-3">
            <div className={`flex-1 rounded-[20px] border p-3 ${darkMode ? 'border-slate-700/60 bg-slate-950/85' : 'border-slate-200/70 bg-white/95'}`}>
                <p className={`text-[10px] font-bold uppercase tracking-[0.24em] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Tower State</p>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                    {pegs.map((peg, pegIndex) => (
                        <div key={`peg-${pegIndex}`} className={`rounded-[20px] border px-3 pb-3 pt-4 ${darkMode ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-slate-50'}`}>
                            <div className="flex min-h-[200px] items-end justify-center">
                                <div className={`relative flex h-[180px] w-full max-w-[150px] flex-col justify-end rounded-[18px] ${darkMode ? 'bg-slate-950' : 'bg-white'}`}>
                                    <div className={`absolute bottom-0 left-1/2 h-[160px] w-2.5 -translate-x-1/2 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-slate-300'}`} />
                                    <div className={`absolute bottom-0 left-0 right-0 h-2.5 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-slate-300'}`} />
                                    <div className="relative z-10 flex flex-1 flex-col justify-end gap-1.5 px-1.5 pb-3">
                                        {[...peg].reverse().map((disk) => {
                                            const active = step.state.move?.disk === disk;
                                            return (
                                                <MotionDiv
                                                    key={`disk-${pegIndex}-${disk}`}
                                                    layout
                                                    animate={{ y: active ? -8 : 0, scale: active ? 1.02 : 1 }}
                                                    transition={{ type: 'spring', stiffness: 180, damping: 18 }}
                                                    className={`mx-auto flex h-7 items-center justify-center rounded-full border text-[10px] font-black ${active
                                                        ? (darkMode ? 'border-amber-300 bg-gradient-to-r from-amber-300 to-orange-400 text-amber-950' : 'border-amber-400 bg-gradient-to-r from-amber-400 to-orange-500 text-white')
                                                        : (darkMode ? 'border-fuchsia-400/30 bg-gradient-to-r from-fuchsia-400 to-violet-500 text-white' : 'border-violet-300 bg-gradient-to-r from-violet-400 to-fuchsia-500 text-white')
                                                        }`}
                                                    style={{ width: `${40 + disk * 18}px` }}
                                                >
                                                    {diskLabel(disk)}
                                                </MotionDiv>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                            <p className={`mt-3 text-center text-xs font-bold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{pegNames[pegIndex]}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
