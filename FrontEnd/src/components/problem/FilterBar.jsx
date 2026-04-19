/**
 * FilterBar — Reusable search + difficulty + tag filter row.
 * Used by Homepage.jsx and Problems.jsx.
 */
function FilterBar({ search, setSearch, difficultyFilter, setDifficultyFilter, tagFilter, setTagFilter, resultCount, darkMode }) {
    return (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
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
                <option value="string">String</option>
                <option value="hashTable">Hash Table</option>
                <option value="twoPointers">Two Pointers</option>
                <option value="binarySearch">Binary Search</option>
                <option value="linkedList">Linked List</option>
                <option value="stack">Stack</option>
                <option value="queue">Queue</option>
                <option value="tree">Tree</option>
                <option value="graph">Graph</option>
                <option value="bfs">BFS</option>
                <option value="dfs">DFS</option>
                <option value="dp">Dynamic Programming</option>
                <option value="greedy">Greedy</option>
                <option value="backtracking">Backtracking</option>
                <option value="heap">Heap</option>
                <option value="math">Math</option>
            </select>

            {/* Count */}
            <div className={`hidden sm:block text-xs font-medium ml-auto ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                {resultCount} problem{resultCount !== 1 ? 's' : ''}
            </div>
        </div>
    );
}

export default FilterBar;
