import { useState, useEffect } from 'react';
import submissionService from '../../services/submissionService';

const langIcons = {
    cpp: '⚡', 'c++': '⚡', c: '⚙️', java: '☕',
    python: '🐍', python3: '🐍', javascript: '🟨', js: '🟨',
    go: '🐹', rust: '🦀', typescript: '🔷', ts: '🔷',
};

const statusConfig = {
    Accepted: {
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
        ),
        dark: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
        light: 'text-emerald-600 bg-emerald-50 border-emerald-200',
        dotDark: 'bg-emerald-400',
        dotLight: 'bg-emerald-500',
    },
    default: {
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
        ),
        dark: 'text-red-400 bg-red-500/15 border-red-500/30',
        light: 'text-red-600 bg-red-50 border-red-200',
        dotDark: 'bg-red-400',
        dotLight: 'bg-red-500',
    },
};

function getRelativeTime(dateStr) {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
}

function formatRuntime(runtime) {
    if (runtime == null) return '—';
    if (runtime < 1) return `${(runtime * 1000).toFixed(0)} ms`;
    return `${runtime.toFixed(2)} s`;
}

function formatMemory(memoryKB) {
    if (memoryKB == null) return '—';
    if (memoryKB >= 1024) return `${(memoryKB / 1024).toFixed(1)} MB`;
    return `${memoryKB} KB`;
}

function SubmissionHistory({ problemId, darkMode, onSelectSubmission }) {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        const fetchSubmissions = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await submissionService.getAllSubmissions(problemId);
                const sorted = (data || []).sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                );
                setSubmissions(sorted);
            } catch (err) {
                console.error('Error fetching submissions:', err);
                setError('Failed to load submissions');
            } finally {
                setLoading(false);
            }
        };

        if (problemId) fetchSubmissions();
    }, [problemId]);

    const handleToggleExpand = (id) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="relative w-10 h-10">
                    <div className={`absolute inset-0 rounded-full border-2 border-t-indigo-500 animate-spin ${darkMode ? 'border-slate-700' : 'border-slate-200'}`} />
                </div>
                <p className={`text-xs font-medium ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    Loading submissions...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4 gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${darkMode ? 'bg-red-500/10' : 'bg-red-50'}`}>
                    <svg className={`w-5 h-5 ${darkMode ? 'text-red-400' : 'text-red-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <p className={`text-xs font-semibold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
            </div>
        );
    }

    if (submissions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <div className={`w-14 h-14 rounded-2xl mb-4 flex items-center justify-center ${darkMode ? 'bg-slate-800/80' : 'bg-slate-100'}`}>
                    <svg className={`w-7 h-7 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <h4 className={`text-sm font-bold mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    No submissions yet
                </h4>
                <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    Submit your solution and track your progress here
                </p>
            </div>
        );
    }

    const acceptedCount = submissions.filter((s) => s.status === 'Accepted').length;
    const bestRuntime = submissions
        .filter((s) => s.status === 'Accepted' && s.runtime != null)
        .reduce((best, s) => (best === null || s.runtime < best ? s.runtime : best), null);
    const bestMemory = submissions
        .filter((s) => s.status === 'Accepted' && s.memory != null)
        .reduce((best, s) => (best === null || s.memory < best ? s.memory : best), null);

    return (
        <div className="flex flex-col gap-3 p-1">
            {/* Summary Stats */}
            <div className={`grid grid-cols-3 gap-2 p-3 rounded-xl border ${darkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex flex-col items-center gap-0.5">
                    <span className={`text-lg font-black tabular-nums ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                        {submissions.length}
                    </span>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        Total
                    </span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                    <span className={`text-lg font-black tabular-nums ${acceptedCount > 0 ? (darkMode ? 'text-emerald-400' : 'text-emerald-600') : (darkMode ? 'text-slate-500' : 'text-slate-400')}`}>
                        {acceptedCount}
                    </span>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        Accepted
                    </span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                    <span className={`text-lg font-black tabular-nums ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                        {bestRuntime != null ? formatRuntime(bestRuntime) : '—'}
                    </span>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        Best Time
                    </span>
                </div>
            </div>

            {/* Submission List */}
            <div className="flex flex-col gap-1.5">
                {submissions.map((sub, idx) => {
                    const config = statusConfig[sub.status] || statusConfig.default;
                    const isAccepted = sub.status === 'Accepted';
                    const isExpanded = expandedId === sub._id;
                    const passRatio = sub.testCasesTotal > 0 ? sub.testCasesPassed / sub.testCasesTotal : 0;
                    const allPassed = sub.testCasesPassed === sub.testCasesTotal;

                    return (
                        <div key={sub._id} className="flex flex-col">
                            <button
                                onClick={() => handleToggleExpand(sub._id)}
                                className={`relative flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 group text-left w-full
                                    ${isExpanded
                                        ? (darkMode ? 'bg-slate-800 border-indigo-500/50 shadow-lg shadow-indigo-500/5' : 'bg-white border-indigo-400 shadow-md shadow-indigo-100')
                                        : (darkMode ? 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/60' : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm')
                                    }`}
                            >
                                {/* Status Icon */}
                                <div className={`flex-shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center ${darkMode ? config.dark : config.light}`}>
                                    {config.icon}
                                </div>

                                {/* Main Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className={`text-xs font-bold ${isAccepted ? (darkMode ? 'text-emerald-400' : 'text-emerald-600') : (darkMode ? 'text-red-400' : 'text-red-600')}`}>
                                            {sub.status}
                                        </span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold flex items-center gap-1 ${darkMode ? 'bg-slate-700/80 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                                            {langIcons[sub.language?.toLowerCase()] || '📄'} {sub.language}
                                        </span>
                                        {idx === 0 && (
                                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                                                Latest
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {/* Test Cases Progress */}
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-14 h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                                                <div
                                                    className={`h-full rounded-full transition-all ${allPassed ? 'bg-emerald-500' : (passRatio > 0 ? 'bg-amber-500' : 'bg-red-500')}`}
                                                    style={{ width: `${passRatio * 100}%` }}
                                                />
                                            </div>
                                            <span className={`text-[10px] font-mono font-bold tabular-nums ${allPassed ? (darkMode ? 'text-emerald-400' : 'text-emerald-600') : (darkMode ? 'text-slate-400' : 'text-slate-500')}`}>
                                                {sub.testCasesPassed}/{sub.testCasesTotal}
                                            </span>
                                        </div>

                                        <span className={`text-[10px] ${darkMode ? 'text-slate-600' : 'text-slate-300'}`}>•</span>

                                        <span className={`text-[10px] font-medium ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                            {getRelativeTime(sub.createdAt)}
                                        </span>
                                    </div>
                                </div>

                                {/* Right Side Stats */}
                                <div className="flex-shrink-0 flex items-center gap-3">
                                    <div className={`hidden sm:flex flex-col items-end gap-0.5`}>
                                        <div className="flex items-center gap-1">
                                            <svg className={`w-3 h-3 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            <span className={`text-[10px] font-mono font-semibold tabular-nums ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                                {formatRuntime(sub.runtime)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <svg className={`w-3 h-3 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            <span className={`text-[10px] font-mono font-semibold tabular-nums ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                                {formatMemory(sub.memory)}
                                            </span>
                                        </div>
                                    </div>

                                    <svg
                                        className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''} ${darkMode ? 'text-slate-600 group-hover:text-slate-400' : 'text-slate-300 group-hover:text-slate-500'}`}
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </button>

                            {/* Expanded Details */}
                            {isExpanded && (
                                <div className={`mx-2 mt-0 mb-1 p-3 rounded-b-xl border border-t-0 transition-all duration-200
                                    ${darkMode ? 'bg-slate-800/80 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}
                                >
                                    {/* Stats Row (visible on mobile) */}
                                    <div className={`sm:hidden grid grid-cols-2 gap-2 mb-3`}>
                                        <div className={`flex items-center gap-2 p-2 rounded-lg ${darkMode ? 'bg-slate-900/50' : 'bg-white'}`}>
                                            <svg className={`w-3.5 h-3.5 ${darkMode ? 'text-indigo-400' : 'text-indigo-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            <div>
                                                <p className={`text-[9px] font-semibold uppercase ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Runtime</p>
                                                <p className={`text-xs font-mono font-bold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{formatRuntime(sub.runtime)}</p>
                                            </div>
                                        </div>
                                        <div className={`flex items-center gap-2 p-2 rounded-lg ${darkMode ? 'bg-slate-900/50' : 'bg-white'}`}>
                                            <svg className={`w-3.5 h-3.5 ${darkMode ? 'text-indigo-400' : 'text-indigo-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            <div>
                                                <p className={`text-[9px] font-semibold uppercase ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Memory</p>
                                                <p className={`text-xs font-mono font-bold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{formatMemory(sub.memory)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Error Message */}
                                    {sub.errorMessage && (
                                        <div className={`mb-3 p-2.5 rounded-lg border text-[11px] font-mono leading-relaxed whitespace-pre-wrap
                                            ${darkMode ? 'bg-red-500/5 border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-600'}`}
                                        >
                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="text-[10px] font-bold font-sans uppercase tracking-wider">Error Output</span>
                                            </div>
                                            {sub.errorMessage}
                                        </div>
                                    )}

                                    {/* Code Preview */}
                                    {sub.code && (
                                        <div className={`rounded-lg border overflow-hidden ${darkMode ? 'border-slate-700/50' : 'border-slate-200'}`}>
                                            <div className={`flex items-center justify-between px-3 py-1.5 ${darkMode ? 'bg-slate-900/80' : 'bg-slate-100'}`}>
                                                <span className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                                    Submitted Code
                                                </span>
                                                <span className={`text-[10px] font-medium ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                                                    {new Date(sub.createdAt).toLocaleString([], {
                                                        month: 'short', day: 'numeric', year: 'numeric',
                                                        hour: '2-digit', minute: '2-digit',
                                                    })}
                                                </span>
                                            </div>
                                            <pre className={`p-3 text-[11px] font-mono leading-relaxed overflow-x-auto max-h-52
                                                ${darkMode ? 'bg-slate-900/50 text-slate-300' : 'bg-white text-slate-700'}`}
                                            >
                                                {sub.code}
                                            </pre>
                                        </div>
                                    )}

                                    {/* Action Button */}
                                    <div className="flex items-center justify-end gap-2 mt-3">
                                        {onSelectSubmission && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onSelectSubmission(sub);
                                                }}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all
                                                    ${darkMode
                                                        ? 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30'
                                                        : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                                                    }`}
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                </svg>
                                                Load in Editor
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default SubmissionHistory;