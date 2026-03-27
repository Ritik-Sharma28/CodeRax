import { NavLink } from 'react-router';

const getDifficultyStyle = (difficulty, darkMode) => {
    switch (difficulty?.toLowerCase()) {
        case 'easy': return { dot: 'bg-emerald-500', text: darkMode ? 'text-emerald-400' : 'text-emerald-600' };
        case 'medium': return { dot: 'bg-amber-500', text: darkMode ? 'text-amber-400' : 'text-amber-600' };
        case 'hard': return { dot: 'bg-red-500', text: darkMode ? 'text-red-400' : 'text-red-600' };
        default: return { dot: 'bg-slate-400', text: darkMode ? 'text-slate-400' : 'text-slate-500' };
    }
};

/**
 * ProblemRow — A single problem entry in a list.
 * Used by ProblemTable.
 */
function ProblemRow({ problem, isSolved, index, isLast, darkMode }) {
    const diffStyle = getDifficultyStyle(problem.difficulty, darkMode);

    return (
        <NavLink
            to={`/problem/${problem._id}`}
            className={`block sm:grid sm:grid-cols-[minmax(0,1fr)_100px_100px_80px] gap-4 px-5 sm:px-6 py-4 items-center transition-colors cursor-pointer group
                ${!isLast ? (darkMode ? 'border-b border-slate-800' : 'border-b border-slate-100') : ''}
                ${darkMode ? 'hover:bg-slate-800/60' : 'hover:bg-indigo-50/40'}`}
        >
            {/* Title */}
            <div className="flex items-center gap-3 mb-2 sm:mb-0 min-w-0">
                <span className={`text-xs font-bold w-6 text-right hidden sm:block flex-shrink-0 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>{index + 1}</span>
                <h3 className={`text-sm font-semibold transition-colors truncate
                    ${darkMode
                        ? 'text-slate-200 group-hover:text-indigo-400'
                        : 'text-slate-800 group-hover:text-indigo-700'
                    }`}>
                    {problem.title}
                </h3>
            </div>

            {/* Difficulty */}
            <div className="inline-flex sm:flex items-center gap-1.5 mr-2 sm:mr-0 mb-2 sm:mb-0">
                <span className={`w-1.5 h-1.5 rounded-full ${diffStyle.dot}`} />
                <span className={`text-xs font-semibold capitalize ${diffStyle.text}`}>{problem.difficulty}</span>
            </div>

            {/* Tag */}
            <div className="inline-flex sm:flex mb-2 sm:mb-0">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-lg capitalize
                    ${darkMode ? 'text-slate-400 bg-slate-800' : 'text-slate-500 bg-slate-100'}`}>
                    {problem.tags}
                </span>
            </div>

            {/* Status */}
            <div className="sm:text-right">
                {isSolved ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-500">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Solved
                    </span>
                ) : (
                    <span className={`text-xs font-medium ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>—</span>
                )}
            </div>
        </NavLink>
    );
}

export { getDifficultyStyle };
export default ProblemRow;
