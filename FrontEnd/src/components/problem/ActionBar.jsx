function ActionBar({ onRun, onSubmit, onConsole, loading, darkMode }) {
    return (
        <div className={`flex items-center justify-between px-2 sm:px-4 py-2 sm:py-3 border-t
            ${darkMode
                ? 'bg-slate-800/80 border-slate-700/60'
                : 'bg-slate-50/80 border-slate-200/60'
            }`}
        >
            <button
                onClick={onConsole}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold transition-colors
                    ${darkMode
                        ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/80'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                    }`}
            >
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
                </svg>
                Console
            </button>

            <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                    onClick={onRun}
                    disabled={loading}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all duration-200 border
                        ${loading
                            ? (darkMode ? 'bg-slate-700 text-slate-500 border-slate-600 cursor-not-allowed' : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed')
                            : (darkMode
                                ? 'bg-slate-700/80 text-slate-200 border-slate-600 hover:bg-slate-600 hover:text-white'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-sm')
                        }`}
                >
                    {loading ? (
                        <span className="flex items-center gap-1.5">
                            <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Running...
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                            </svg>
                            Run
                        </span>
                    )}
                </button>

                <button
                    onClick={onSubmit}
                    disabled={loading}
                    className={`px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all duration-200
                        ${loading
                            ? 'bg-indigo-500/50 text-indigo-300 cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/25 hover:shadow-lg hover:shadow-indigo-600/30'
                        }`}
                >
                    {loading ? (
                        <span className="flex items-center gap-1.5">
                            <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Submitting...
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                            </svg>
                            Submit
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
}

export default ActionBar;
