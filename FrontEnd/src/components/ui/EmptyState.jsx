function EmptyState({ title, description, action, darkMode }) {
    return (
        <div
            className={`rounded-[28px] border border-dashed px-6 py-12 text-center ${
                darkMode ? "border-slate-800 bg-slate-900/60" : "border-slate-200 bg-white/80"
            }`}
        >
            <div
                className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${
                    darkMode ? "bg-slate-800 text-cyan-300" : "bg-cyan-50 text-cyan-700"
                }`}
            >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625A3.375 3.375 0 0016.125 8.25h-1.5A1.125 1.125 0 0113.5 7.125v-1.5A3.375 3.375 0 0010.125 2.25H8.25m0 12.75h7.5m-7.5 3H12" />
                </svg>
            </div>
            <h3 className={`mt-5 text-lg font-black ${darkMode ? "text-white" : "text-slate-900"}`}>{title}</h3>
            <p className={`mx-auto mt-2 max-w-md text-sm leading-6 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                {description}
            </p>
            {action ? <div className="mt-6">{action}</div> : null}
        </div>
    );
}

export default EmptyState;
