function LoadingState({ title = "Loading...", description = "Preparing your workspace.", darkMode, compact = false }) {
    return (
        <div className={`flex items-center justify-center ${compact ? "py-10" : "min-h-[280px]"}`}>
            <div className="flex flex-col items-center gap-3 text-center">
                <div
                    className={`h-10 w-10 animate-spin rounded-full border-2 border-t-cyan-500 ${
                        darkMode ? "border-slate-800" : "border-slate-200"
                    }`}
                />
                <div>
                    <p className={`text-sm font-semibold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
                        {title}
                    </p>
                    <p className={`mt-1 text-xs ${darkMode ? "text-slate-500" : "text-slate-500"}`}>
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LoadingState;
