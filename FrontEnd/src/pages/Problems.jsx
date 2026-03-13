import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import { useSelector } from 'react-redux';
import problemService from '../services/problemService';
import Navbar from '../components/Navbar';

const getDifficultyStyle = (difficulty, darkMode) => {
    switch (difficulty?.toLowerCase()) {
        case 'easy': return { dot: 'bg-emerald-500', text: darkMode ? 'text-emerald-400' : 'text-emerald-600' };
        case 'medium': return { dot: 'bg-amber-500', text: darkMode ? 'text-amber-400' : 'text-amber-600' };
        case 'hard': return { dot: 'bg-red-500', text: darkMode ? 'text-red-400' : 'text-red-600' };
        default: return { dot: 'bg-slate-400', text: darkMode ? 'text-slate-400' : 'text-slate-500' };
    }
};

function Problems() {
    const { user } = useSelector((state) => state.auth);
    const [problems, setProblems] = useState([]);
    const [solvedProblems, setSolvedProblems] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const [search, setSearch] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('all');
    const [tagFilter, setTagFilter] = useState('all');
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('darkMode') === 'true';
    });

    useEffect(() => {
        localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const data = await problemService.getAllProblems();
                setProblems(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error fetching problems:', error);
                setProblems([]);
            }
        };

        const fetchSolvedProblems = async () => {
            try {
                const data = await problemService.getSolvedProblems();
                setSolvedProblems(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error fetching solved problems:', error);
                setSolvedProblems([]);
            }
        };

        const loadData = async () => {
            await fetchProblems();
            if (user) await fetchSolvedProblems();
        };

        loadData();
    }, [user]);

    const solvedIds = new Set(solvedProblems.map(sp => sp._id));

    const filteredProblems = problems.filter(problem => {
        if (activeTab === 'solved' && !solvedIds.has(problem._id)) return false;
        if (difficultyFilter !== 'all' && problem.difficulty !== difficultyFilter) return false;
        if (tagFilter !== 'all' && problem.tags !== tagFilter) return false;
        if (search.trim() && !problem.title.toLowerCase().includes(search.trim().toLowerCase())) return false;
        return true;
    });

    const solvedCount = problems.filter(p => solvedIds.has(p._id)).length;

    return (
        <div className={`min-h-screen transition-colors duration-300 flex flex-col ${darkMode ? 'bg-slate-950' : 'bg-gradient-to-br from-slate-50 via-white to-indigo-50/30'}`}>
            <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

            <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                
                {/* Header text */}
                <div className="mb-6 animate-in slide-in-from-top-4 fade-in duration-500">
                    <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>Problem List</h1>
                    <p className={`mt-1 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Find your next challenge and sharpen your skills.</p>
                </div>

                {/* Tabs Row */}
                <div className="flex items-center gap-2 flex-wrap mb-4 animate-in slide-in-from-bottom-2 fade-in duration-500">
                    {[
                        { key: 'all', label: 'All Problems', count: problems.length },
                        { key: 'solved', label: 'Solved', count: solvedCount },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                                ${activeTab === tab.key
                                    ? (darkMode
                                        ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-sm'
                                        : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20')
                                    : (darkMode
                                        ? 'bg-slate-800/80 text-slate-400 border border-slate-700 hover:bg-slate-800 hover:text-slate-300'
                                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-800 shadow-sm')
                                }`}
                        >
                            {tab.label}
                            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-md font-bold
                                ${activeTab === tab.key
                                    ? (darkMode ? 'bg-indigo-500/30 text-indigo-300' : 'bg-white/20 text-white')
                                    : (darkMode ? 'bg-slate-700 text-slate-500' : 'bg-slate-100 text-slate-500')
                                }`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Search + Filters Row */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <svg className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search problems..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium outline-none transition-all duration-200
                                ${darkMode
                                    ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                                    : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 hover:border-slate-300'
                                }`}
                        />
                    </div>

                    {/* Difficulty Filter */}
                    <select
                        value={difficultyFilter}
                        onChange={(e) => setDifficultyFilter(e.target.value)}
                        className={`px-3 py-2.5 rounded-xl border text-sm font-medium outline-none transition-all cursor-pointer
                            ${darkMode
                                ? 'bg-slate-900 border-slate-700 text-slate-300 focus:border-indigo-500'
                                : 'bg-white border-slate-200 text-slate-700 focus:border-indigo-500 hover:border-slate-300'
                            }`}
                    >
                        <option value="all">All Levels</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>

                    {/* Tag Filter */}
                    <select
                        value={tagFilter}
                        onChange={(e) => setTagFilter(e.target.value)}
                        className={`px-3 py-2.5 rounded-xl border text-sm font-medium outline-none transition-all cursor-pointer
                            ${darkMode
                                ? 'bg-slate-900 border-slate-700 text-slate-300 focus:border-indigo-500'
                                : 'bg-white border-slate-200 text-slate-700 focus:border-indigo-500 hover:border-slate-300'
                            }`}
                    >
                        <option value="all">All Tags</option>
                        <option value="array">Array</option>
                        <option value="linkedList">Linked List</option>
                        <option value="graph">Graph</option>
                        <option value="dp">DP</option>
                    </select>

                    {/* Count */}
                    <div className={`hidden sm:flex items-center text-xs font-bold uppercase tracking-wider ml-auto ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        {filteredProblems.length} result{filteredProblems.length !== 1 ? 's' : ''}
                    </div>
                </div>

                {/* Problems Table */}
                <div className={`rounded-2xl border shadow-sm overflow-hidden transition-colors duration-300 animate-in slide-in-from-bottom-6 fade-in duration-700
                    ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60'}`}>

                    {/* Table Header */}
                    <div className={`hidden sm:grid sm:grid-cols-[minmax(0,1fr)_100px_100px_80px] gap-4 px-6 py-4 border-b text-xs font-bold uppercase tracking-wider
                        ${darkMode
                            ? 'bg-slate-800/50 border-slate-800 text-slate-500'
                            : 'bg-slate-50/80 border-slate-100 text-slate-500'
                        }`}>
                        <span>Title</span>
                        <span>Difficulty</span>
                        <span>Tag</span>
                        <span className="text-right">Status</span>
                    </div>

                    {/* Rows */}
                    {filteredProblems.length === 0 ? (
                        <div className="px-6 py-20 text-center">
                            <svg className={`w-14 h-14 mx-auto mb-5 ${darkMode ? 'text-slate-700' : 'text-slate-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 9l-6 6m0-6l6 6" />
                            </svg>
                            <p className={`text-base font-bold mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>No matches found</p>
                            <p className={`text-sm ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Try adjusting your filters or search terms.</p>
                        </div>
                    ) : (
                        filteredProblems.map((problem, idx) => {
                            const diffStyle = getDifficultyStyle(problem.difficulty, darkMode);
                            const isSolved = solvedIds.has(problem._id);

                            return (
                                <NavLink
                                    key={problem._id}
                                    to={`/problem/${problem._id}`}
                                    className={`block sm:grid sm:grid-cols-[minmax(0,1fr)_100px_100px_80px] gap-4 px-5 sm:px-6 py-4 items-center transition-colors cursor-pointer group
                                        ${idx !== filteredProblems.length - 1
                                            ? (darkMode ? 'border-b border-slate-800' : 'border-b border-slate-100')
                                            : ''
                                        }
                                        ${darkMode ? 'hover:bg-slate-800/60' : 'hover:bg-indigo-50/40'}`}
                                >
                                    {/* Title */}
                                    <div className="flex items-center gap-3 mb-2 sm:mb-0 min-w-0">
                                        <span className={`text-xs font-bold w-6 text-right hidden sm:block flex-shrink-0 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                                            {idx + 1}.
                                        </span>
                                        <h3 className={`text-sm font-semibold transition-colors truncate
                                            ${darkMode
                                                ? 'text-slate-200 group-hover:text-indigo-400'
                                                : 'text-slate-800 group-hover:text-indigo-700'
                                            }`}>
                                            {problem.title}
                                        </h3>
                                    </div>

                                    {/* Difficulty */}
                                    <div className="inline-flex sm:flex items-center gap-2 mr-3 sm:mr-0 mb-2 sm:mb-0">
                                        <span className={`w-1.5 h-1.5 rounded-full ${diffStyle.dot}`} />
                                        <span className={`text-xs font-bold capitalize ${diffStyle.text}`}>{problem.difficulty}</span>
                                    </div>

                                    {/* Tag */}
                                    <div className="inline-flex sm:flex mb-2 sm:mb-0">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md
                                            ${darkMode ? 'text-slate-400 bg-slate-800' : 'text-slate-500 bg-slate-100'}`}>
                                            {problem.tags}
                                        </span>
                                    </div>

                                    {/* Status */}
                                    <div className="sm:text-right">
                                        {isSolved ? (
                                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                                Solved
                                            </span>
                                        ) : (
                                            <span className={`text-[10px] font-bold uppercase tracking-widest ${darkMode ? 'text-slate-600' : 'text-slate-300'}`}>Pending</span>
                                        )}
                                    </div>
                                </NavLink>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

export default Problems;
