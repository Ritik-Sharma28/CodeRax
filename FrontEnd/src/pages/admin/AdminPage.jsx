import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router";
import problemService from "../../services/problemService";
import contentService from "../../services/contentService";
import Navbar from "../../components/Navbar";
import AdminProblemList from "../../components/admin/AdminProblemList";
import AdminProblemForm from "../../components/admin/AdminProblemForm";
import { useThemeMode } from "../../context/ThemeContext";
import { DEFAULT_FEATURE_ORDER } from "../../utils/featureCatalog";

const EMPTY_FORM = {
    title: "",
    description: "",
    difficulty: "easy",
    tags: "array",
    problemSignature: { functionName: "", returnType: "int", args: [{ name: "", type: "int" }] },
    visibleTestCases: [{ input: "", output: "", explanation: "" }],
    hiddenTestCases: [{ input: "", output: "" }],
    startCode: [{ language: "cpp", initialCode: "" }],
    referenceSolution: [{ language: "cpp", completeCode: "" }],
};

function SiteTab({ problems, contentState, setContentState, onSave, loading, darkMode, error, success }) {
    const toggleModule = (featureKey) => {
        setContentState((current) => {
            const modules = new Set(current.homepageFeaturedModules || []);
            if (modules.has(featureKey)) modules.delete(featureKey);
            else modules.add(featureKey);
            return { ...current, homepageFeaturedModules: Array.from(modules) };
        });
    };

    return (
        <div className="flex h-full flex-col">
            <div className={`border-b px-3 py-2 ${darkMode ? "border-slate-700/60 bg-slate-900/60" : "border-slate-200/60 bg-slate-50/60"}`}>
                <h2 className={`text-sm font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>Site Content</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-3 sm:p-5">
                <div className="mx-auto max-w-3xl space-y-5">
                    <div>
                        <label className={`mb-1.5 block text-xs font-bold uppercase tracking-wider ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Hero Badge</label>
                        <input
                            value={contentState.heroBadge || ""}
                            onChange={(event) => setContentState((current) => ({ ...current, heroBadge: event.target.value }))}
                            className={`w-full rounded-lg border px-3 py-2 text-sm outline-none ${darkMode ? "border-slate-700 bg-slate-800 text-slate-200" : "border-slate-200 bg-white text-slate-800"}`}
                        />
                    </div>
                    <div>
                        <label className={`mb-1.5 block text-xs font-bold uppercase tracking-wider ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Hero Headline</label>
                        <input
                            value={contentState.heroHeadline || ""}
                            onChange={(event) => setContentState((current) => ({ ...current, heroHeadline: event.target.value }))}
                            className={`w-full rounded-lg border px-3 py-2 text-sm outline-none ${darkMode ? "border-slate-700 bg-slate-800 text-slate-200" : "border-slate-200 bg-white text-slate-800"}`}
                        />
                    </div>
                    <div>
                        <label className={`mb-1.5 block text-xs font-bold uppercase tracking-wider ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Hero Subheadline</label>
                        <textarea
                            rows={4}
                            value={contentState.heroSubheadline || ""}
                            onChange={(event) => setContentState((current) => ({ ...current, heroSubheadline: event.target.value }))}
                            className={`w-full rounded-lg border px-3 py-2 text-sm outline-none ${darkMode ? "border-slate-700 bg-slate-800 text-slate-200" : "border-slate-200 bg-white text-slate-800"}`}
                        />
                    </div>
                    <div>
                        <label className={`mb-1.5 block text-xs font-bold uppercase tracking-wider ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Daily Question</label>
                        <select
                            value={contentState.dailyChallengeProblemId || ""}
                            onChange={(event) => setContentState((current) => ({ ...current, dailyChallengeProblemId: event.target.value }))}
                            className={`w-full rounded-lg border px-3 py-2 text-sm outline-none ${darkMode ? "border-slate-700 bg-slate-800 text-slate-200" : "border-slate-200 bg-white text-slate-800"}`}
                        >
                            <option value="">No daily question selected</option>
                            {problems.map((problem) => (
                                <option key={problem._id} value={problem._id}>
                                    {problem.title}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={`mb-2 block text-xs font-bold uppercase tracking-wider ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Featured Modules</label>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {DEFAULT_FEATURE_ORDER.map((feature) => {
                                const active = (contentState.homepageFeaturedModules || []).includes(feature.key);
                                return (
                                    <button
                                        key={feature.key}
                                        type="button"
                                        onClick={() => toggleModule(feature.key)}
                                        className={`rounded-xl border px-4 py-3 text-left text-sm font-bold transition ${
                                            active
                                                ? darkMode
                                                    ? "border-indigo-500/30 bg-indigo-500/15 text-indigo-300"
                                                    : "border-indigo-300 bg-indigo-50 text-indigo-700"
                                                : darkMode
                                                ? "border-slate-700 bg-slate-800 text-slate-300"
                                                : "border-slate-200 bg-white text-slate-700"
                                        }`}
                                    >
                                        {feature.title}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
            <div className={`flex items-center justify-between border-t px-3 py-3 sm:px-5 ${darkMode ? "border-slate-700/60 bg-slate-800/80" : "border-slate-200/60 bg-slate-50/80"}`}>
                <div className="text-xs font-semibold">
                    {error ? <span className="text-red-500">{error}</span> : null}
                    {success ? <span className="text-emerald-500">{success}</span> : null}
                </div>
                <button
                    onClick={onSave}
                    disabled={loading}
                    className={`rounded-lg px-5 py-2 text-xs font-bold transition ${loading ? "bg-indigo-500/50 text-indigo-200" : "bg-indigo-600 text-white hover:bg-indigo-500"}`}
                >
                    {loading ? "Saving..." : "Save Content"}
                </button>
            </div>
        </div>
    );
}

function AdminPage() {
    const { user } = useSelector((state) => state.auth);
    const { darkMode, setDarkMode } = useThemeMode();
    const [activeTab, setActiveTab] = useState("problems");
    const [problems, setProblems] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [formData, setFormData] = useState({ ...EMPTY_FORM });
    const [isEditMode, setIsEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [mobileView, setMobileView] = useState("list");
    const [contentState, setContentState] = useState({
        heroBadge: "",
        heroHeadline: "",
        heroSubheadline: "",
        dailyChallengeProblemId: "",
        homepageFeaturedModules: [],
    });
    const [contentLoading, setContentLoading] = useState(false);
    const [contentError, setContentError] = useState(null);
    const [contentSuccess, setContentSuccess] = useState(null);

    const fetchProblems = async () => {
        setPageLoading(true);
        try {
            const data = await problemService.getAllProblems();
            setProblems(Array.isArray(data) ? data : []);
        } catch (err) {
            setProblems([]);
        } finally {
            setPageLoading(false);
        }
    };

    const fetchContent = async () => {
        setContentLoading(true);
        try {
            const data = await contentService.getAdminContent();
            setContentState({
                heroBadge: data.heroBadge || "",
                heroHeadline: data.heroHeadline || "",
                heroSubheadline: data.heroSubheadline || "",
                dailyChallengeProblemId: data.dailyChallenge?._id || "",
                homepageFeaturedModules: data.homepageFeaturedModules || [],
            });
            setContentError(null);
        } catch (err) {
            setContentError(err.message || "Failed to load site content");
        } finally {
            setContentLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === "admin") {
            fetchProblems();
            fetchContent();
        }
    }, [user]);

    if (user?.role !== "admin") {
        return <Navigate to="/" replace />;
    }

    const handleSelect = async (id) => {
        setSelectedId(id);
        setIsEditMode(true);
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            const data = await problemService.getProblemById(id);
            setFormData(data);
            setMobileView("editor");
        } catch (err) {
            setError("Failed to load problem");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedId(null);
        setIsEditMode(false);
        setFormData({ ...EMPTY_FORM });
        setError(null);
        setSuccess(null);
        setMobileView("editor");
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            if (isEditMode && selectedId) {
                await problemService.updateProblem(selectedId, formData);
                setSuccess("Problem updated successfully!");
            } else {
                await problemService.createProblem(formData);
                setSuccess("Problem created successfully!");
                setFormData({ ...EMPTY_FORM });
            }
            await fetchProblems();
        } catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedId) return;
        if (!window.confirm("Are you sure you want to delete this problem?")) return;

        setLoading(true);
        setError(null);

        try {
            await problemService.deleteProblem(selectedId);
            setSuccess("Problem deleted!");
            setSelectedId(null);
            setIsEditMode(false);
            setFormData({ ...EMPTY_FORM });
            await fetchProblems();
            setMobileView("list");
        } catch (err) {
            setError("Failed to delete problem");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveContent = async () => {
        setContentLoading(true);
        setContentError(null);
        setContentSuccess(null);
        try {
            await contentService.updateAdminContent(contentState);
            setContentSuccess("Site content updated!");
            await fetchContent();
        } catch (err) {
            setContentError(err.message || "Failed to save site content");
        } finally {
            setContentLoading(false);
        }
    };

    return (
        <div className={`h-screen flex flex-col transition-colors duration-300 ${darkMode ? "bg-slate-950" : "bg-white"}`}>
            <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

            <div className={`flex items-center gap-2 border-b px-3 py-2 ${darkMode ? "border-slate-700/60 bg-slate-900/60" : "border-slate-200/60 bg-slate-50/60"}`}>
                <button
                    onClick={() => setActiveTab("problems")}
                    className={`rounded-lg px-3 py-2 text-xs font-bold transition ${activeTab === "problems" ? (darkMode ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-50 text-indigo-700") : (darkMode ? "text-slate-400 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-100")}`}
                >
                    Problems
                </button>
                <button
                    onClick={() => setActiveTab("site")}
                    className={`rounded-lg px-3 py-2 text-xs font-bold transition ${activeTab === "site" ? (darkMode ? "bg-amber-500/20 text-amber-300" : "bg-amber-50 text-amber-700") : (darkMode ? "text-slate-400 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-100")}`}
                >
                    Daily Question / Site Content
                </button>
            </div>

            {activeTab === "problems" ? (
                <>
                    <div className={`flex md:hidden border-b ${darkMode ? "bg-slate-900 border-slate-700/60" : "bg-slate-50 border-slate-200/60"}`}>
                        <button
                            onClick={() => setMobileView("list")}
                            className={`flex-1 py-2.5 text-xs font-bold text-center transition-colors ${mobileView === "list" ? (darkMode ? "text-indigo-400 border-b-2 border-indigo-500" : "text-indigo-600 border-b-2 border-indigo-600") : "text-slate-500"}`}
                        >
                            Problem List
                        </button>
                        <button
                            onClick={() => setMobileView("editor")}
                            className={`flex-1 py-2.5 text-xs font-bold text-center transition-colors ${mobileView === "editor" ? (darkMode ? "text-indigo-400 border-b-2 border-indigo-500" : "text-indigo-600 border-b-2 border-indigo-600") : "text-slate-500"}`}
                        >
                            {isEditMode ? "Edit Problem" : "New Problem"}
                        </button>
                    </div>

                    <div className="flex flex-1 min-h-0">
                        <div className={`flex flex-col border-r ${darkMode ? "border-slate-700/60" : "border-slate-200/60"} w-full md:w-[340px] lg:w-[380px] flex-shrink-0 ${mobileView === "list" ? "flex" : "hidden md:flex"}`}>
                            {pageLoading ? (
                                <div className="flex flex-1 items-center justify-center">
                                    <div className={`h-8 w-8 animate-spin rounded-full border-3 border-t-indigo-500 ${darkMode ? "border-slate-700" : "border-slate-200"}`} />
                                </div>
                            ) : (
                                <AdminProblemList problems={problems} selectedId={selectedId} onSelect={handleSelect} onCreate={handleCreate} darkMode={darkMode} />
                            )}
                        </div>

                        <div className={`flex flex-1 flex-col ${mobileView === "editor" ? "flex" : "hidden md:flex"}`}>
                            <AdminProblemForm
                                formData={formData}
                                setFormData={setFormData}
                                isEditMode={isEditMode}
                                onSubmit={handleSubmit}
                                onDelete={handleDelete}
                                loading={loading}
                                error={error}
                                success={success}
                                darkMode={darkMode}
                            />
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex flex-1 min-h-0">
                    <div className="flex flex-1 flex-col">
                        <SiteTab
                            problems={problems}
                            contentState={contentState}
                            setContentState={setContentState}
                            onSave={handleSaveContent}
                            loading={contentLoading}
                            darkMode={darkMode}
                            error={contentError}
                            success={contentSuccess}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminPage;
