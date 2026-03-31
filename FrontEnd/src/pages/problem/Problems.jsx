import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import FilterBar from "../../components/problem/FilterBar";
import ProblemTable from "../../components/problem/ProblemTable";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import { useThemeMode } from "../../context/ThemeContext";
import problemService from "../../services/problemService";

function Problems() {
    const { isAuthenticated } = useSelector((state) => state.auth);
    const { darkMode, setDarkMode } = useThemeMode();
    const [problemIndex, setProblemIndex] = useState([]);
    const [solvedProblems, setSolvedProblems] = useState([]);
    const [status, setStatus] = useState("loading");
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [search, setSearch] = useState("");
    const [difficultyFilter, setDifficultyFilter] = useState("all");
    const [tagFilter, setTagFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const loadProblems = async () => {
        setStatus("loading");
        setError("");
        try {
            const [problems, solved] = await Promise.all([
                isAuthenticated ? problemService.getAllProblems() : problemService.getPublicProblems(),
                isAuthenticated ? problemService.getSolvedProblems() : Promise.resolve([]),
            ]);
            setProblemIndex(Array.isArray(problems) ? problems : []);
            setSolvedProblems(Array.isArray(solved) ? solved : []);
            setStatus("success");
        } catch (err) {
            setError(err.message || "Failed to load problems.");
            setProblemIndex([]);
            setSolvedProblems([]);
            setStatus("error");
        }
    };

    useEffect(() => {
        loadProblems();
    }, [isAuthenticated]);

    const solvedIds = useMemo(() => new Set(solvedProblems.map((problem) => problem._id)), [solvedProblems]);
    const filteredProblems = useMemo(() => {
        return problemIndex.filter((problem) => {
            if (isAuthenticated && activeTab === "solved" && !solvedIds.has(problem._id)) return false;
            if (difficultyFilter !== "all" && problem.difficulty !== difficultyFilter) return false;
            if (tagFilter !== "all" && problem.tags !== tagFilter) return false;
            if (search.trim() && !problem.title.toLowerCase().includes(search.trim().toLowerCase())) return false;
            return true;
        });
    }, [problemIndex, activeTab, solvedIds, difficultyFilter, tagFilter, search, isAuthenticated]);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, difficultyFilter, tagFilter, search]);

    const solvedCount = problemIndex.filter((problem) => solvedIds.has(problem._id)).length;
    const totalPages = Math.max(1, Math.ceil(filteredProblems.length / ITEMS_PER_PAGE));
    const paginatedProblems = filteredProblems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    if (status === "loading") {
        return (
            <div className={`min-h-screen ${darkMode ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"}`}>
                <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
                <LoadingState title="Loading problems..." description="Building the CodeRax problem library." darkMode={darkMode} />
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className={`min-h-screen ${darkMode ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"}`}>
                <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
                <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
                    <ErrorState title="Problem library unavailable" description={error} onRetry={loadProblems} darkMode={darkMode} />
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${darkMode ? "bg-slate-950 text-white" : "bg-[linear-gradient(180deg,_#f8fbff_0%,_#ffffff_34%,_#f7fafc_100%)] text-slate-900"}`}>
            <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <p className={`text-xs font-bold uppercase tracking-[0.2em] ${darkMode ? "text-cyan-300" : "text-cyan-700"}`}>Problem Library</p>
                    <h1 className="mt-3 text-3xl font-black sm:text-4xl">Find the next problem worth your time.</h1>
                    <p className={`mt-2 text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                        {isAuthenticated ? "Filter by difficulty, continue your progress, and jump into the editor fast." : "Browse the CodeRax problem library before logging in. Solving unlocks after sign in."}
                    </p>
                </div>

                <div className="mb-4 flex flex-wrap items-center gap-2">
                    {[
                        { key: "all", label: "All Problems", count: problemIndex.length },
                        ...(isAuthenticated ? [{ key: "solved", label: "Solved", count: solvedCount }] : []),
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                                activeTab === tab.key
                                    ? darkMode
                                        ? "border border-cyan-500/30 bg-cyan-500/15 text-cyan-300"
                                        : "bg-cyan-600 text-white"
                                    : darkMode
                                    ? "border border-slate-700 bg-slate-800 text-slate-400"
                                    : "border border-slate-200 bg-white text-slate-600"
                            }`}
                        >
                            {tab.label}
                            <span className={`ml-2 rounded-md px-1.5 py-0.5 text-xs font-bold ${activeTab === tab.key ? (darkMode ? "bg-cyan-500/20 text-cyan-200" : "bg-white/15 text-white") : darkMode ? "bg-slate-700 text-slate-500" : "bg-slate-100 text-slate-500"}`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="mb-6">
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

                <ProblemTable
                    problems={paginatedProblems}
                    solvedIds={solvedIds}
                    status={status}
                    darkMode={darkMode}
                    isAuthenticated={isAuthenticated}
                    error={error}
                >
                    {totalPages > 1 ? (
                        <div className={`flex items-center justify-between border-t px-6 py-4 ${darkMode ? "border-slate-800 bg-slate-900" : "border-slate-100 bg-white"}`}>
                            <button
                                onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))}
                                disabled={currentPage === 1}
                                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                                    currentPage === 1
                                        ? darkMode
                                            ? "bg-slate-800 text-slate-600"
                                            : "bg-slate-100 text-slate-400"
                                        : darkMode
                                        ? "bg-slate-800 text-white hover:bg-slate-700"
                                        : "bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
                                }`}
                            >
                                Previous
                            </button>
                            <span className={`text-xs font-bold ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage((previous) => Math.min(totalPages, previous + 1))}
                                disabled={currentPage === totalPages}
                                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                                    currentPage === totalPages
                                        ? darkMode
                                            ? "bg-slate-800 text-slate-600"
                                            : "bg-slate-100 text-slate-400"
                                        : darkMode
                                        ? "bg-slate-800 text-white hover:bg-slate-700"
                                        : "bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
                                }`}
                            >
                                Next
                            </button>
                        </div>
                    ) : null}
                </ProblemTable>
            </main>
            <Footer darkMode={darkMode} />
        </div>
    );
}

export default Problems;
