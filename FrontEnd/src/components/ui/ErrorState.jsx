function ErrorState({ title = "Something went wrong", description, onRetry, darkMode, compact = false }) {
    return (
        <div
            className={`rounded-[28px] border px-6 py-8 ${
                compact ? "" : "min-h-[220px]"
            } ${darkMode ? "border-rose-500/20 bg-rose-500/10" : "border-rose-200 bg-rose-50"}`}
        >
            <div className="flex h-full flex-col items-center justify-center text-center">
                <div className={`rounded-2xl p-3 ${darkMode ? "bg-rose-500/10 text-rose-300" : "bg-white text-rose-600"}`}>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008v.008H12v-.008zm0-13.5l9.15 15.844A1.5 1.5 0 0119.85 21H4.15a1.5 1.5 0 01-1.3-2.25L12 2.25z" />
                    </svg>
                </div>
                <h3 className={`mt-4 text-lg font-black ${darkMode ? "text-white" : "text-slate-900"}`}>{title}</h3>
                <p className={`mt-2 max-w-md text-sm leading-6 ${darkMode ? "text-rose-100/80" : "text-rose-700"}`}>
                    {description}
                </p>
                {onRetry ? (
                    <button
                        onClick={onRetry}
                        className={`mt-5 rounded-2xl px-4 py-2 text-sm font-bold transition ${
                            darkMode ? "bg-white text-slate-900 hover:bg-slate-100" : "bg-slate-900 text-white hover:bg-slate-800"
                        }`}
                    >
                        Try again
                    </button>
                ) : null}
            </div>
        </div>
    );
}

export default ErrorState;
