import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllProblems } from '../../services/slices/problemsSlice';
import problemService from '../../services/problemService';
import Navbar from '../../components/Navbar';
import StatsGrid from '../../components/problem/StatsGrid';

function Home() {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { problemIndex: problems, status } = useSelector((state) => state.problems);
    const [solvedProblems, setSolvedProblems] = useState([]);
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

        const loadData = async () => {
            if (user) await fetchSolvedProblems();
        };

        loadData();
    }, [user, status, dispatch]);

    const solvedIds = new Set(solvedProblems.map(sp => sp._id));
    const solvedCount = problems.filter(p => solvedIds.has(p._id)).length;
    const easyCount = problems.filter(p => p.difficulty === 'easy').length;
    const mediumCount = problems.filter(p => p.difficulty === 'medium').length;
    const hardCount = problems.filter(p => p.difficulty === 'hard').length;

    return (
        <div className={`min-h-screen transition-colors duration-300 flex flex-col ${darkMode ? 'bg-slate-950' : 'bg-gradient-to-br from-slate-50 via-white to-indigo-50/30'}`}>
            <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

            {/* Background effects */}
            <div className={`fixed top-[-20%] right-[-10%] w-[40vw] h-[40vw] rounded-full blur-[100px] pointer-events-none ${darkMode ? 'bg-indigo-500/5' : 'bg-indigo-400/5'}`} />
            <div className={`fixed bottom-[-15%] left-[-5%] w-[35vw] h-[35vw] rounded-full blur-[80px] pointer-events-none ${darkMode ? 'bg-purple-500/5' : 'bg-purple-400/5'}`} />

            <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
                {/* Welcome */}
                <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center sm:text-left">
                    <h1 className={`text-4xl sm:text-5xl font-extrabold tracking-tight mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">{user?.firstName || 'Coder'}</span>
                    </h1>
                    <p className={`text-lg sm:text-xl ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Ready to conquer another coding challenge today?
                    </p>
                </div>

                {/* Stats Grid */}
                <StatsGrid
                    totalCount={problems.length}
                    solvedCount={solvedCount}
                    easyCount={easyCount}
                    mediumCount={mediumCount}
                    hardCount={hardCount}
                    darkMode={darkMode}
                />

                {/* Call to Action */}
                <div className="flex flex-wrap justify-center gap-4 sm:justify-start animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                    <NavLink
                        to="/problems"
                        className={`group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg overflow-hidden transition-all duration-300
                            ${darkMode
                                ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] hover:shadow-[0_0_60px_-10px_rgba(79,70,229,0.7)]'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-[0_10px_40px_-10px_rgba(79,70,229,0.5)] hover:shadow-[0_20px_60px_-10px_rgba(79,70,229,0.6)]'
                            }`}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="relative z-10">Start Solving Now</span>
                        <svg className="relative z-10 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </NavLink>
                    <NavLink
                        to="/mock-interview"
                        className={`group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg overflow-hidden transition-all duration-300 border
                            ${darkMode
                                ? 'border-cyan-400/30 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20'
                                : 'border-cyan-200 bg-white text-cyan-700 hover:bg-cyan-50'
                            }`}
                    >
                        <span className="relative z-10">Launch Mock Interview</span>
                        <svg className="relative z-10 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.5c3.866 0 7-2.91 7-6.5s-3.134-6.5-7-6.5-7 2.91-7 6.5 3.134 6.5 7 6.5zm0 0v3m-4 0h8" />
                        </svg>
                    </NavLink>
                </div>
            </div>
        </div>
    );
}

export default Home;
