export default function ControlBar({
    darkMode,
    isPlaying,
    canStepBack,
    canStepForward,
    speed,
    onPlayPause,
    onStepBack,
    onStepForward,
    onReset,
    onRandomize,
    onApplyInput,
    onSpeedChange,
}) {
    const buttonClass = `inline-flex items-center justify-center rounded-xl border px-3 py-2 text-xs font-semibold transition-all duration-200 ${darkMode
        ? 'border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800'
        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
        }`;

    return (
        <div className={`rounded-[22px] border p-3 ${darkMode ? 'border-slate-700/60 bg-slate-900/80' : 'border-slate-200/70 bg-white/90 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)]'}`}>
            <div className="flex flex-col gap-2">
                {/* Buttons row */}
                <div className="flex flex-wrap items-center gap-2">
                    <button onClick={onPlayPause} className={`${buttonClass} min-w-[90px] ${isPlaying
                        ? (darkMode ? 'border-amber-500/30 text-amber-300' : 'border-amber-200 text-amber-700')
                        : (darkMode ? 'border-emerald-500/30 text-emerald-300' : 'border-emerald-200 text-emerald-700')
                        }`}>
                        {isPlaying ? 'Pause' : 'Play'}
                    </button>
                    <button onClick={onStepBack} disabled={!canStepBack} className={`${buttonClass} disabled:cursor-not-allowed disabled:opacity-45`}>
                        Previous
                    </button>
                    <button onClick={onStepForward} disabled={!canStepForward} className={`${buttonClass} disabled:cursor-not-allowed disabled:opacity-45`}>
                        Next
                    </button>
                    <button onClick={onReset} className={buttonClass}>
                        Reset
                    </button>
                </div>

                {/* Generate / Apply row */}
                <div className="flex flex-wrap items-center gap-2">
                    <button onClick={onRandomize} className={buttonClass}>
                        Generate Input
                    </button>
                    <button onClick={onApplyInput} className={`${buttonClass} ${darkMode ? 'border-indigo-500/30 text-indigo-300' : 'border-indigo-200 text-indigo-700'}`}>
                        Apply Input
                    </button>
                </div>

                {/* Speed — inline */}
                <div className="flex items-center gap-3">
                    <p className={`shrink-0 text-[10px] font-bold uppercase tracking-[0.22em] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Speed</p>
                    <p className={`shrink-0 text-xs font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{speed}x</p>
                    <input
                        type="range"
                        min="0.5"
                        max="2.5"
                        step="0.25"
                        value={speed}
                        onChange={(event) => onSpeedChange(Number(event.target.value))}
                        className="range range-warning range-xs w-full"
                    />
                </div>
            </div>
        </div>
    );
}
