import { useState } from 'react';
import ProblemDescription from './ProblemDescription';
import SolutionsPanel from './SolutionsPanel';
import SubmissionHistory from './SubmissionHistory';
import ChatAI from '../chat/ChatAI';
// Editorial — Coming Soon

const LEFT_TABS = [
    { key: 'description', label: 'Description', icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z' },
    { key: 'editorial', label: 'Editorial', icon: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25' },
    { key: 'solutions', label: 'Solutions', icon: 'M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z' },
    { key: 'submissions', label: 'Submissions', icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z' },
    { key: 'chatAI', label: 'AI Chat', icon: 'M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z' },
];


function LeftPanel({ problem, problemId, darkMode , code  }) {
    const [activeTab, setActiveTab] = useState('description');

    return (
        <div className="flex-1 flex flex-col min-h-0">
            {/* Tab Navigation */}
            <div className={`flex items-center gap-1 px-3 py-2 border-b overflow-x-auto scrollbar-none
                ${darkMode
                    ? 'bg-slate-900/60 border-slate-700/60'
                    : 'bg-slate-50/60 border-slate-200/60'
                }`}
            >
                {LEFT_TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-semibold whitespace-nowrap transition-all duration-200
                            ${activeTab === tab.key
                                ? (darkMode
                                    ? 'bg-indigo-500/15 text-indigo-400 shadow-sm'
                                    : 'bg-indigo-50 text-indigo-700 shadow-sm')
                                : (darkMode
                                    ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/80'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100')
                            }`}
                    >
                        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                        </svg>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-5">
                {problem && (
                    <>
                        {activeTab === 'description' && (
                            <ProblemDescription problem={problem} darkMode={darkMode} />
                        )}

                        {activeTab === 'editorial' && (
                            <ComingSoon feature="Editorial" darkMode={darkMode} />
                            /* TODO: Re-enable when backend editorial API is ready
                            <Editorial secureUrl={problem.secureUrl} thumbnailUrl={problem.thumbnailUrl} duration={problem.duration} />
                            */
                        )}

                        {activeTab === 'solutions' && (
                            <SolutionsPanel problem={problem} darkMode={darkMode} />
                        )}

                        {activeTab === 'submissions' && (
                            <SubmissionHistory problemId={problemId} darkMode={darkMode} />

                        )}

                        {activeTab === 'chatAI' && (
                             <ChatAI problemId={problemId} darkMode={darkMode}  code = {code} />

                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default LeftPanel;
