import ProblemRow from "./ProblemRow";

function ProblemTable({ problems, solvedIds, status, darkMode, children, isAuthenticated = true, error = "" }) {
    return (
        <div className={`overflow-hidden rounded-2xl border shadow-sm transition-colors duration-300 ${darkMode ? "border-slate-800 bg-slate-900" : "border-slate-200/60 bg-white"}`}>
            <div className={`hidden gap-4 border-b px-6 py-3 text-xs font-bold uppercase tracking-wider sm:grid sm:grid-cols-[minmax(0,1fr)_100px_100px_80px] ${darkMode ? "border-slate-800 bg-slate-800/50 text-slate-500" : "border-slate-100 bg-slate-50/80 text-slate-500"}`}>
                <span>Title</span>
                <span>Difficulty</span>
                <span>Tag</span>
                <span className="text-right">Status</span>
            </div>

            {status === "loading" ? (
                <div className="px-6 py-20 text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-cyan-500" />
                    <p className={`mt-4 text-sm font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Loading problems...</p>
                </div>
            ) : error ? (
                <div className="px-6 py-16 text-center">
                    <p className="text-sm font-bold text-rose-500">Problem library unavailable</p>
                    <p className={`mt-2 text-xs ${darkMode ? "text-slate-500" : "text-slate-400"}`}>{error}</p>
                </div>
            ) : problems.length === 0 ? (
                <div className="px-6 py-16 text-center">
                    <svg className={`mx-auto mb-4 h-12 w-12 ${darkMode ? "text-slate-700" : "text-slate-300"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    <p className={`text-sm font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>No problems found</p>
                    <p className={`mt-1 text-xs ${darkMode ? "text-slate-600" : "text-slate-400"}`}>Try adjusting your filters or search query</p>
                </div>
            ) : (
                problems.map((problem, idx) => (
                    <ProblemRow
                        key={problem._id}
                        problem={problem}
                        isSolved={solvedIds.has(problem._id)}
                        index={idx}
                        isLast={idx === problems.length - 1}
                        darkMode={darkMode}
                        isAuthenticated={isAuthenticated}
                    />
                ))
            )}

            {children}
        </div>
    );
}

export default ProblemTable;
