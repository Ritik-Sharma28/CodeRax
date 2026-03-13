import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router';
import problemService from '../services/problemService';
import Navbar from '../components/Navbar';
import AdminProblemList from '../components/admin/AdminProblemList';
import AdminProblemForm from '../components/admin/AdminProblemForm';

const EMPTY_FORM = {
    title: '',
    description: '',
    difficulty: 'easy',
    tags: 'array',
    problemSignature: { functionName: '', returnType: 'int', args: [{ name: '', type: 'int' }] },
    visibleTestCases: [{ input: '', output: '', explanation: '' }],
    hiddenTestCases: [{ input: '', output: '' }],
    startCode: [{ language: 'cpp', initialCode: '' }],
    referenceSolution: [{ language: 'cpp', completeCode: '' }],
};

const AdminPage = () => {
    const { user } = useSelector((state) => state.auth);
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
    const [problems, setProblems] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [formData, setFormData] = useState({ ...EMPTY_FORM });
    const [isEditMode, setIsEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Mobile panel toggle
    const [mobileView, setMobileView] = useState('list'); // 'list' or 'editor'

    useEffect(() => {
        localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);

    // Fetch all problems
    const fetchProblems = async () => {
        setPageLoading(true);
        try {
            const data = await problemService.getAllProblems();
            if (Array.isArray(data)) {
                setProblems(data);
            } else {
                setProblems([]);
            }
        } catch (err) {
            console.error('Error fetching problems:', err);
        } finally {
            setPageLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchProblems();
        }
    }, [user]);

    // Guard: redirect non-admin (AFTER all hooks)
    if (user?.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    // Select a problem for editing
    const handleSelect = async (id) => {
        setSelectedId(id);
        setIsEditMode(true);
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            const data = await problemService.getProblemById(id);
            setFormData(data);
            setMobileView('editor');
        } catch (err) {
            setError('Failed to load problem');
        } finally {
            setLoading(false);
        }
    };

    // New problem
    const handleCreate = () => {
        setSelectedId(null);
        setIsEditMode(false);
        setFormData({ ...EMPTY_FORM });
        setError(null);
        setSuccess(null);
        setMobileView('editor');
    };

    // Submit (create or update)
    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            if (isEditMode && selectedId) {
                await problemService.updateProblem(selectedId, formData);
                setSuccess('Problem updated successfully!');
            } else {
                await problemService.createProblem(formData);
                setSuccess('Problem created successfully!');
                setFormData({ ...EMPTY_FORM });
            }
            await fetchProblems();
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data || 'Something went wrong';
            setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
        } finally {
            setLoading(false);
        }
    };

    // Delete
    const handleDelete = async () => {
        if (!selectedId) return;
        if (!window.confirm('Are you sure you want to delete this problem?')) return;

        setLoading(true);
        setError(null);

        try {
            await problemService.deleteProblem(selectedId);
            setSuccess('Problem deleted!');
            setSelectedId(null);
            setIsEditMode(false);
            setFormData({ ...EMPTY_FORM });
            await fetchProblems();
            setMobileView('list');
        } catch (err) {
            setError('Failed to delete problem');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`h-screen flex flex-col transition-colors duration-300 ${darkMode ? 'bg-slate-950' : 'bg-white'}`}>
            <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

            {/* Mobile View Toggle */}
            <div className={`flex md:hidden border-b ${darkMode ? 'bg-slate-900 border-slate-700/60' : 'bg-slate-50 border-slate-200/60'}`}>
                <button
                    onClick={() => setMobileView('list')}
                    className={`flex-1 py-2.5 text-xs font-bold text-center transition-colors
                        ${mobileView === 'list'
                            ? (darkMode ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-indigo-600 border-b-2 border-indigo-600')
                            : (darkMode ? 'text-slate-500' : 'text-slate-500')
                        }`}
                >
                    📋 Problem List
                </button>
                <button
                    onClick={() => setMobileView('editor')}
                    className={`flex-1 py-2.5 text-xs font-bold text-center transition-colors
                        ${mobileView === 'editor'
                            ? (darkMode ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-indigo-600 border-b-2 border-indigo-600')
                            : (darkMode ? 'text-slate-500' : 'text-slate-500')
                        }`}
                >
                    ✏️ {isEditMode ? 'Edit Problem' : 'New Problem'}
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex min-h-0">
                {/* Left: Problem List */}
                <div className={`flex flex-col border-r
                    ${darkMode ? 'border-slate-700/60' : 'border-slate-200/60'}
                    w-full md:w-[340px] lg:w-[380px] flex-shrink-0
                    ${mobileView === 'list' ? 'flex' : 'hidden md:flex'}
                `}>
                    {pageLoading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className={`w-8 h-8 border-3 border-t-indigo-500 rounded-full animate-spin
                                ${darkMode ? 'border-slate-700' : 'border-slate-200'}`} />
                        </div>
                    ) : (
                        <AdminProblemList
                            problems={problems}
                            selectedId={selectedId}
                            onSelect={handleSelect}
                            onCreate={handleCreate}
                            darkMode={darkMode}
                        />
                    )}
                </div>

                {/* Right: Form */}
                <div className={`flex flex-col flex-1
                    ${mobileView === 'editor' ? 'flex' : 'hidden md:flex'}
                `}>
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
        </div>
    );
};

export default AdminPage;
