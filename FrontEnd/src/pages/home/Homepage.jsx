import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllProblems } from '../../services/slices/problemsSlice';
import axiosClient from '../../services/axiosClient';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import StatsGrid from '../../components/problem/StatsGrid';
import FilterBar from '../../components/problem/FilterBar';
import ProblemTable from '../../components/problem/ProblemTable';
import { useThemeMode } from '../../context/ThemeContext';

function Homepage() {
    const dispatch = useDispatch();
    const { darkMode, setDarkMode } = useThemeMode();
    const { user } = useSelector((state) => state.auth);
    const { problemIndex: problems, status } = useSelector((state) => state.problems);
    const [solvedProblems, setSolvedProblems] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const [search, setSearch] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('all');
    const [tagFilter, setTagFilter] = useState('all');

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchAllProblems());
        }

        const fetchSolvedProblems = async () => {
            try {
                const { data } = await axiosClient.get('/problem/problemSolvedByUser');
                setSolvedProblems(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error fetching solved problems:', error);
                setSolvedProblems([]);
            }
        };

        const loadData = async () => {
            if (user) await fetchSolvedProblems();
        };

        loadData();
    }, [user, status, dispatch]);

    const solvedIds = new Set(solvedProblems.map(sp => sp._id));

    const filteredProblems = problems.filter(problem => {
        if (activeTab === 'solved' && !solvedIds.has(problem._id)) return false;
        if (difficultyFilter !== 'all' && problem.difficulty !== difficultyFilter) return false;
        if (tagFilter !== 'all' && problem.tags !== tagFilter) return false;
        if (search.trim() && !problem.title.toLowerCase().includes(search.trim().toLowerCase())) return false;
        return true;
    });

    const solvedCount = problems.filter(p => solvedIds.has(p._id)).length;
    const easyCount = problems.filter(p => p.difficulty === 'easy').length;
    const mediumCount = problems.filter(p => p.difficulty === 'medium').length;
    const hardCount = problems.filter(p => p.difficulty === 'hard').length;

    return (
        <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-950' : 'bg-[#f8f9fc]'}`}>
            <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

            {/* Background effects */}
            <div className={`fixed top-[-20%] right-[-10%] w-[40vw] h-[40vw] rounded-full blur-[100px] pointer-events-none ${darkMode ? 'bg-indigo-500/5' : 'bg-indigo-400/5'}`} />
            <div className={`fixed bottom-[-15%] left-[-5%] w-[35vw] h-[35vw] rounded-full blur-[80px] pointer-events-none ${darkMode ? 'bg-purple-500/5' : 'bg-purple-400/5'}`} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">

                {/* Welcome */}
                <div className="mb-6 sm:mb-8">
                    <h1 className={`text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        Welcome back, <span className="gradient-text">{user?.firstName || 'Coder'}</span>
                    </h1>
                    <p className={`mt-1 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Track your progress and keep solving.</p>
                </div>

                {/* Stats Cards */}
                <StatsGrid
                    totalCount={problems.length}
                    solvedCount={solvedCount}
                    easyCount={easyCount}
                    mediumCount={mediumCount}
                    hardCount={hardCount}
                    darkMode={darkMode}
                    compact
                />

                {/* Tabs + Search + Filters Row */}
                <div className="flex flex-col gap-3 sm:gap-4 mb-5 sm:mb-6">
                    {/* Tabs Row */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {[
                            { key: 'all', label: 'All Problems', count: problems.length },
                            { key: 'solved', label: 'Solved', count: solvedCount },
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
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

                    {/* Search + Filters */}
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
                    problems={filteredProblems}
                    solvedIds={solvedIds}
                    status={status}
                    darkMode={darkMode}
                />
            </div>

            <Footer darkMode={darkMode} />
        </div>
    );
}

export default Homepage;