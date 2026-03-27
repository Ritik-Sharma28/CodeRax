import ProblemRow from './ProblemRow';

/**
 * ProblemTable — Wraps a list of problems with header + empty/loading states.
 * Used by Homepage.jsx and Problems.jsx.
 */
function ProblemTable({ problems, solvedIds, status, darkMode, children }) {
    return (
        <div className={`rounded-2xl border shadow-sm overflow-hidden transition-colors duration-300
            ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60'}`}>

            {/* Table Header */}
            <div className={`hidden sm:grid sm:grid-cols-[minmax(0,1fr)_100px_100px_80px] gap-4 px-6 py-3 border-b text-xs font-bold uppercase tracking-wider
                ${darkMode
                    ? 'bg-slate-800/50 border-slate-800 text-slate-500'
                    : 'bg-slate-50/80 border-slate-100 text-slate-500'
                }`}>
                <span>Title</span>
                <span>Difficulty</span>
                <span>Tag</span>
                <span className="text-right">Status</span>
            </div>

            {/* Content */}
            {status === 'loading' ? (
                <div className="px-6 py-20 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
                    <p className={`mt-4 text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Loading problems...</p>
                </div>
            ) : problems.length === 0 ? (
                <div className="px-6 py-16 text-center">
                    <svg className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-slate-700' : 'text-slate-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>No problems found</p>
                    <p className={`text-xs mt-1 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>Try adjusting your filters or search query</p>
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
                    />
                ))
            )}

            {/* Optional children for pagination, etc. */}
            {children}
        </div>
    );
}

export default ProblemTable;
