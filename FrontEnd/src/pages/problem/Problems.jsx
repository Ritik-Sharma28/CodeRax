import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllProblems } from '../../services/slices/problemsSlice';
import problemService from '../../services/problemService';
import Navbar from '../../components/Navbar';
import FilterBar from '../../components/problem/FilterBar';
import ProblemTable from '../../components/problem/ProblemTable';

function Problems() {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { problemIndex, status } = useSelector((state) => state.problems);
    
    const [solvedProblems, setSolvedProblems] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const [search, setSearch] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('all');
    const [tagFilter, setTagFilter] = useState('all');
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;
    
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('darkMode') === 'true';
    });

    useEffect(() => {
        localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchAllProblems());
        }

        const fetchSolvedProblems = async () => {
            try {
                const data = await problemService.getSolvedProblems();
                setSolvedProblems(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error fetching solved problems:', error);
                setSolvedProblems([]);
            }
        };

        if (user) {
            fetchSolvedProblems();
        }
    }, [user, status, dispatch]);

    const solvedIds = useMemo(() => new Set(solvedProblems.map(sp => sp._id)), [solvedProblems]);

    // Derived completely filtered array. Notice how search is fully local & instant.
    const filteredProblems = useMemo(() => {
        return problemIndex.filter(problem => {
            if (activeTab === 'solved' && !solvedIds.has(problem._id)) return false;
            if (difficultyFilter !== 'all' && problem.difficulty !== difficultyFilter) return false;
            if (tagFilter !== 'all' && problem.tags !== tagFilter) return false;
            if (search.trim() && !problem.title.toLowerCase().includes(search.trim().toLowerCase())) return false;
            return true;
        });
    }, [problemIndex, activeTab, solvedIds, difficultyFilter, tagFilter, search]);

    // Reset page index if any filter is modified
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, difficultyFilter, tagFilter, search]);

    const solvedCount = problemIndex.filter(p => solvedIds.has(p._id)).length;
    
    // Compute purely paginated slice
    const totalPages = Math.ceil(filteredProblems.length / ITEMS_PER_PAGE);
    const paginatedProblems = filteredProblems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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
                        { key: 'all', label: 'All Problems', count: problemIndex.length },
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
                <div className="mb-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
                    <FilterBar
                        search={search}
                        setSearch={setSearch}
                        difficultyFilter={difficultyFilter}
                        setDifficultyFilter={setDifficultyFilter}
                        tagFilter={tagFilter}
                        setTagFilter={setTagFilter}
                        resultCount={filteredProblems.length}
                        darkMode={darkMode}
                    />
                </div>

                {/* Problems Table */}
                <ProblemTable
                    problems={paginatedProblems}
                    solvedIds={solvedIds}
                    status={status}
                    darkMode={darkMode}
                >
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className={`flex items-center justify-between px-6 py-4 border-t ${darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'}`}>
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                    currentPage === 1 
                                        ? (darkMode ? 'bg-slate-800 text-slate-600' : 'bg-slate-100 text-slate-400')
                                        : (darkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700')
                                }`}
                            >
                                Previous
                            </button>
                            <span className={`text-xs font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                    currentPage === totalPages 
                                        ? (darkMode ? 'bg-slate-800 text-slate-600' : 'bg-slate-100 text-slate-400')
                                        : (darkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700')
                                }`}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </ProblemTable>
            </div>
        </div>
    );
}

export default Problems;
