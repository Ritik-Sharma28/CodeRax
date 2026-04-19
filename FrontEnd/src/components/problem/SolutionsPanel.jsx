function SolutionsPanel({ problem, darkMode }) {
    if (!problem) return null;

    const solutions = problem.referenceSolution;

    if (!solutions || solutions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <svg className={`w-12 h-12 mb-3 ${darkMode ? 'text-slate-700' : 'text-slate-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                </svg>
                <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Solutions will be available after you solve the problem.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Reference Solutions
            </h2>
            {solutions.map((solution, index) => (
                <div
                    key={index}
                    className={`rounded-xl border overflow-hidden transition-colors
                        ${darkMode
                            ? 'bg-slate-800/50 border-slate-700/60'
                            : 'bg-white border-slate-200/80'
                        }`}
                >
                    {/* Solution Header */}
                    <div className={`flex items-center justify-between px-4 py-2.5 border-b
                        ${darkMode
                            ? 'bg-slate-800 border-slate-700/60'
                            : 'bg-slate-50 border-slate-200/80'
                        }`}>
                        <div className="flex items-center gap-2">
                            <svg className={`w-4 h-4 ${darkMode ? 'text-indigo-400' : 'text-indigo-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                            <span className={`text-sm font-bold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                                {solution.language}
                            </span>
                        </div>
                    </div>
                    {/* Solution Code */}
                    <div className="p-4 overflow-x-auto">
                        <pre className={`text-sm font-mono leading-relaxed whitespace-pre-wrap break-words ${darkMode ? 'text-slate-300' : 'text-slate-800'}`}>
                            <code>{solution.completeCode}</code>
                        </pre>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default SolutionsPanel;
