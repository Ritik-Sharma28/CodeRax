/**
 * StatsGrid — Reusable grid of 4 stat cards (Total, Easy, Medium, Hard).
 * Used by Home.jsx (large variant) and Homepage.jsx (compact variant).
 *
 * @param {boolean} compact — When true, renders the smaller Homepage variant.
 */
function StatsGrid({ totalCount, solvedCount, easyCount, mediumCount, hardCount, darkMode, compact = false }) {
    const stats = [
        { label: 'Total', value: totalCount, sub: `${solvedCount} solved`, gradient: darkMode ? 'from-slate-700 to-slate-800' : 'from-slate-600 to-slate-800', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
        { label: 'Easy', value: easyCount, sub: null, gradient: 'from-emerald-500 to-emerald-700', icon: 'M5 13l4 4L19 7' },
        { label: 'Medium', value: mediumCount, sub: null, gradient: 'from-amber-500 to-amber-700', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
        { label: 'Hard', value: hardCount, sub: null, gradient: 'from-red-500 to-red-700', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z' },
    ];

    return (
        <div className={compact
            ? 'grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8'
            : 'grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 animate-in fade-in slide-in-from-bottom-6 duration-700'
        }>
            {stats.map((stat, i) => (
                <div key={i} className={compact
                    ? `rounded-2xl border p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200 ${darkMode ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200/60'}`
                    : `rounded-3xl border p-6 sm:p-8 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${darkMode ? 'bg-slate-900/80 border-slate-700/50 hover:border-indigo-500/50' : 'bg-white/80 border-slate-200/60 hover:border-indigo-200'}`
                }>
                    <div className={compact ? 'flex items-center justify-between mb-3' : 'flex items-center justify-between mb-5'}>
                        <div className={compact
                            ? `w-9 h-9 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-sm`
                            : `w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`
                        }>
                            <svg className={compact ? 'w-4 h-4 text-white' : 'w-6 h-6 text-white'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                            </svg>
                        </div>
                        {stat.sub && (
                            <span className={compact
                                ? `text-xs font-semibold px-2 py-1 rounded-lg ${darkMode ? 'text-indigo-400 bg-indigo-500/10' : 'text-indigo-600 bg-indigo-50'}`
                                : `text-sm font-bold px-3 py-1.5 rounded-xl ${darkMode ? 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20' : 'text-indigo-700 bg-indigo-50 border border-indigo-100'}`
                            }>
                                {stat.sub}
                            </span>
                        )}
                    </div>
                    <div className={compact
                        ? `text-2xl sm:text-3xl font-extrabold ${darkMode ? 'text-white' : 'text-slate-900'}`
                        : `text-4xl sm:text-5xl font-black tracking-tight mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`
                    }>{stat.value}</div>
                    <div className={compact
                        ? `text-xs font-medium mt-0.5 ${darkMode ? 'text-slate-500' : 'text-slate-500'}`
                        : `text-sm font-bold uppercase tracking-wider ${darkMode ? 'text-slate-500' : 'text-slate-400'}`
                    }>{stat.label} Problems</div>
                </div>
            ))}
        </div>
    );
}

export default StatsGrid;
