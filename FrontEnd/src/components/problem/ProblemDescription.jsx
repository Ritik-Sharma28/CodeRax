import { renderMarkdown } from '../ui/MarkdownRenderer';

const getDifficultyStyle = (difficulty, darkMode) => {
    switch (difficulty?.toLowerCase()) {
        case 'easy': return { bg: darkMode ? 'bg-emerald-500/15' : 'bg-emerald-50', text: darkMode ? 'text-emerald-400' : 'text-emerald-600', dot: 'bg-emerald-500' };
        case 'medium': return { bg: darkMode ? 'bg-amber-500/15' : 'bg-amber-50', text: darkMode ? 'text-amber-400' : 'text-amber-600', dot: 'bg-amber-500' };
        case 'hard': return { bg: darkMode ? 'bg-red-500/15' : 'bg-red-50', text: darkMode ? 'text-red-400' : 'text-red-600', dot: 'bg-red-500' };
        default: return { bg: darkMode ? 'bg-slate-700' : 'bg-slate-100', text: darkMode ? 'text-slate-400' : 'text-slate-500', dot: 'bg-slate-400' };
    }
};

function ProblemDescription({ problem, darkMode }) {
    if (!problem) return null;

    const diffStyle = getDifficultyStyle(problem.difficulty, darkMode);

    return (
        <div className="space-y-6">
            {/* Title + Badges */}
            <div>
                <h1 className={`text-xl sm:text-2xl font-extrabold tracking-tight mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {problem.title}
                </h1>
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Difficulty Badge */}
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold capitalize ${diffStyle.bg} ${diffStyle.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${diffStyle.dot}`} />
                        {problem.difficulty}
                    </span>
                    {/* Tags */}
                    {problem.tags && (
                        <span className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize
                            ${darkMode ? 'bg-indigo-500/15 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                            {problem.tags}
                        </span>
                    )}
                </div>
            </div>

            {/* Description — now rendered as markdown */}
            <div className={`text-sm leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {renderMarkdown(problem.description, darkMode)}
            </div>

            {/* Examples */}
            {problem.visibleTestCases && problem.visibleTestCases.length > 0 && (
                <div>
                    <h3 className={`text-base font-bold mb-3 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                        Examples
                    </h3>
                    <div className="space-y-3">
                        {problem.visibleTestCases.map((example, index) => (
                            <div
                                key={index}
                                className={`rounded-xl border p-4 transition-colors
                                    ${darkMode
                                        ? 'bg-slate-800/50 border-slate-700/60'
                                        : 'bg-slate-50 border-slate-200/80'
                                    }`}
                            >
                                <div className={`text-xs font-bold uppercase tracking-wider mb-2.5
                                    ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                    Example {index + 1}
                                </div>
                                <div className="space-y-2 font-mono text-sm">
                                    <div className="flex gap-2">
                                        <span className={`font-bold flex-shrink-0 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Input:</span>
                                        <span className={`${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{example.input}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className={`font-bold flex-shrink-0 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Output:</span>
                                        <span className={`${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{example.output}</span>
                                    </div>
                                    {example.explanation && (
                                        <div className="flex gap-2">
                                            <span className={`font-bold flex-shrink-0 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Explanation:</span>
                                            <span className={`font-sans ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{example.explanation}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProblemDescription;
