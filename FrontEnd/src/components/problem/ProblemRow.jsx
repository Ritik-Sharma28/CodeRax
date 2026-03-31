import { NavLink } from "react-router";

const getDifficultyStyle = (difficulty, darkMode) => {
    switch (difficulty?.toLowerCase()) {
        case "easy":
            return { dot: "bg-emerald-500", text: darkMode ? "text-emerald-400" : "text-emerald-600" };
        case "medium":
            return { dot: "bg-amber-500", text: darkMode ? "text-amber-400" : "text-amber-600" };
        case "hard":
            return { dot: "bg-red-500", text: darkMode ? "text-red-400" : "text-red-600" };
        default:
            return { dot: "bg-slate-400", text: darkMode ? "text-slate-400" : "text-slate-500" };
    }
};

function ProblemRow({ problem, isSolved, index, isLast, darkMode, isAuthenticated = true }) {
    const diffStyle = getDifficultyStyle(problem.difficulty, darkMode);

    return (
        <NavLink
            to={`/problem/${problem._id}`}
            className={`block sm:grid sm:grid-cols-[minmax(0,1fr)_100px_100px_80px] gap-4 px-5 sm:px-6 py-4 items-center transition-colors cursor-pointer group ${
                !isLast ? (darkMode ? "border-b border-slate-800" : "border-b border-slate-100") : ""
            } ${darkMode ? "hover:bg-slate-800/60" : "hover:bg-cyan-50/60"}`}
        >
            <div className="mb-2 flex min-w-0 items-center gap-3 sm:mb-0">
                <span className={`hidden w-6 flex-shrink-0 text-right text-xs font-bold sm:block ${darkMode ? "text-slate-600" : "text-slate-400"}`}>{index + 1}</span>
                <h3 className={`truncate text-sm font-semibold transition-colors ${darkMode ? "text-slate-200 group-hover:text-cyan-300" : "text-slate-800 group-hover:text-cyan-700"}`}>
                    {problem.title}
                </h3>
            </div>

            <div className="mb-2 mr-2 inline-flex items-center gap-1.5 sm:mb-0 sm:mr-0 sm:flex">
                <span className={`h-1.5 w-1.5 rounded-full ${diffStyle.dot}`} />
                <span className={`text-xs font-semibold capitalize ${diffStyle.text}`}>{problem.difficulty}</span>
            </div>

            <div className="mb-2 inline-flex sm:mb-0 sm:flex">
                <span className={`rounded-lg px-2.5 py-1 text-xs font-medium capitalize ${darkMode ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"}`}>
                    {problem.tags}
                </span>
            </div>

            <div className="sm:text-right">
                {isSolved ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-500">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Solved
                    </span>
                ) : (
                    <span className={`text-xs font-medium ${darkMode ? "text-slate-600" : "text-slate-400"}`}>
                        {isAuthenticated ? "-" : "Preview"}
                    </span>
                )}
            </div>
        </NavLink>
    );
}

export { getDifficultyStyle };
export default ProblemRow;
