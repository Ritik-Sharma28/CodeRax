import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import { useSelector } from 'react-redux';
import problemService from '../services/problemService';
import Navbar from '../components/Navbar';

function Home() {
    const { user } = useSelector((state) => state.auth);
    const [problems, setProblems] = useState([]);
    const [solvedProblems, setSolvedProblems] = useState([]);
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
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    {[
                        { label: 'Total', value: problems.length, sub: `${solvedCount} solved`, gradient: darkMode ? 'from-slate-700 to-slate-800' : 'from-slate-600 to-slate-800', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
                        { label: 'Easy', value: easyCount, sub: null, gradient: 'from-emerald-500 to-emerald-700', icon: 'M5 13l4 4L19 7' },
                        { label: 'Medium', value: mediumCount, sub: null, gradient: 'from-amber-500 to-amber-700', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                        { label: 'Hard', value: hardCount, sub: null, gradient: 'from-red-500 to-red-700', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z' },
                    ].map((stat, i) => (
                        <div key={i} className={`rounded-3xl border p-6 sm:p-8 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300
                            ${darkMode
                                ? 'bg-slate-900/80 border-slate-700/50 hover:border-indigo-500/50'
                                : 'bg-white/80 border-slate-200/60 hover:border-indigo-200'
                            }`}>
                            <div className="flex items-center justify-between mb-5">
                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                                    </svg>
                                </div>
                                {stat.sub && (
                                    <span className={`text-sm font-bold px-3 py-1.5 rounded-xl
                                        ${darkMode ? 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20' : 'text-indigo-700 bg-indigo-50 border border-indigo-100'}`}>
                                        {stat.sub}
                                    </span>
                                )}
                            </div>
                            <div className={`text-4xl sm:text-5xl font-black tracking-tight mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{stat.value}</div>
                            <div className={`text-sm font-bold uppercase tracking-wider ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{stat.label} Problems</div>
                        </div>
                    ))}
                </div>

                {/* Call to Action */}
                <div className="flex justify-center sm:justify-start animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
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
                </div>
            </div>
        </div>
    );
}

export default Home;
