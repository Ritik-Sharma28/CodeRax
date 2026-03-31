import { useState, useEffect } from 'react';
import CodeEditor from './CodeEditor';
import CustomTestcasePanel from './CustomTestcasePanel';
import TestResultPanel from './TestResultPanel';
import SubmitResultPanel from './SubmitResultPanel';
import ActionBar from './ActionBar';
import axiosClient from '../../services/axiosClient';
import { Link } from 'react-router';

const RIGHT_TABS = [
    { key: 'code', label: 'Code', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
    { key: 'testcases', label: 'Testcases', icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z' },
    { key: 'test_result', label: 'Test Result', icon: 'M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5' },
    { key: 'submit_result', label: 'Submit Result', icon: 'M4.5 12.75l6 6 9-13.5' },
    { key: 'notes', label: '📌 Notes', icon: 'M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z' },
];

function LockedFeaturePanel({ darkMode, title, description }) {
    return (
        <div className="flex flex-1 items-center justify-center p-5">
            <div className={`flex max-w-md flex-col items-center rounded-2xl border px-6 py-10 text-center ${
                darkMode
                    ? 'border-slate-700/60 bg-slate-900/70'
                    : 'border-slate-200 bg-slate-50'
            }`}>
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${
                    darkMode ? 'bg-indigo-500/15 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
                }`}>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 0h10.5A1.5 1.5 0 0118.75 12v6.75a1.5 1.5 0 01-1.5 1.5H6.75a1.5 1.5 0 01-1.5-1.5V12a1.5 1.5 0 011.5-1.5z" />
                    </svg>
                </div>
                <h3 className={`text-base font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
                <p className={`mt-2 text-sm leading-6 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {description}
                </p>
                <div className="mt-5 flex items-center gap-3">
                    <Link
                        to="/login"
                        className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                            darkMode ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-white text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                        Log In
                    </Link>
                    <Link
                        to="/signup"
                        className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-indigo-500"
                    >
                        Sign Up
                    </Link>
                </div>
            </div>
        </div>
    );
}

function NotesPanel({ problemId, darkMode }) {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [noteInput, setNoteInput] = useState('');
    const [tagsInput, setTagsInput] = useState('');
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    useEffect(() => {
        if (problemId) fetchNotes();
    }, [problemId]);

    const fetchNotes = async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get(`/ai/memories/${problemId}`);
            setNotes(res.data.memories || []);
        } catch (err) {
            console.error('Failed to fetch notes:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveNote = async (e) => {
        e.preventDefault();
        if (!noteInput.trim() || saving) return;
        setSaving(true);
        setSuccessMsg(null);

        try {
            const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
            const res = await axiosClient.post('/ai/quick-note', {
                note: noteInput.trim(),
                problemId,
                tags,
            });
            setNotes(prev => [res.data.memory, ...prev]);
            setNoteInput('');
            setTagsInput('');
            setSuccessMsg('✅ Note saved!');
            setTimeout(() => setSuccessMsg(null), 2500);
        } catch (err) {
            console.error('Failed to save note:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        setDeletingId(id);
        try {
            await axiosClient.delete(`/ai/memory/${id}`);
            setNotes(prev => prev.filter(n => n._id !== id));
        } catch (err) {
            console.error('Failed to delete note:', err);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="flex-1 flex flex-col min-h-0">
            <div className={`p-3 border-b ${darkMode ? 'border-slate-700/50' : 'border-slate-200/50'}`}>
                <form onSubmit={handleSaveNote} className="space-y-2">
                    <textarea
                        value={noteInput}
                        onChange={(e) => setNoteInput(e.target.value)}
                        placeholder='Add a note: e.g. "Forgot to handle empty array edge case"'
                        rows={2}
                        className={`w-full px-3 py-2 rounded-xl text-xs border outline-none resize-none transition-all ${darkMode ? 'bg-slate-800/80 border-slate-700/60 text-slate-200 placeholder:text-slate-600 focus:border-amber-500/50' : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-amber-400'}`}
                    />
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={tagsInput}
                            onChange={(e) => setTagsInput(e.target.value)}
                            placeholder="Tags: dp, recursion"
                            className={`flex-1 px-3 py-1.5 rounded-lg text-[10px] border outline-none transition-all ${darkMode ? 'bg-slate-800/80 border-slate-700/60 text-slate-200 placeholder:text-slate-600 focus:border-amber-500/50' : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-amber-400'}`}
                        />
                        <button
                            type="submit"
                            disabled={!noteInput.trim() || saving}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${noteInput.trim() && !saving ? (darkMode ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' : 'bg-amber-500 text-white hover:bg-amber-600') : (darkMode ? 'bg-slate-800 text-slate-600' : 'bg-slate-200 text-slate-400')}`}
                        >
                            {saving ? '...' : '📌 Save'}
                        </button>
                    </div>
                </form>
                {successMsg && (
                    <p className={`text-[10px] font-semibold mt-1.5 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{successMsg}</p>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-3">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className={`w-5 h-5 border-2 border-t-amber-500 rounded-full animate-spin ${darkMode ? 'border-slate-700' : 'border-slate-200'}`} />
                    </div>
                ) : notes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 px-4">
                        <div className={`w-10 h-10 rounded-xl mb-2 flex items-center justify-center ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                            <svg className={`w-5 h-5 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                            </svg>
                        </div>
                        <p className={`text-xs text-center ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>No notes for this problem yet.</p>
                        <p className={`text-[10px] text-center mt-0.5 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>Add a quick note above or pin AI chat messages!</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {notes.map(note => (
                            <div key={note._id} className={`p-3 rounded-xl border transition-all ${darkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'}`}>
                                <div className="flex items-start justify-between gap-2">
                                    <p className={`text-xs leading-relaxed flex-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{note.summary}</p>
                                    <button onClick={() => handleDelete(note._id)} disabled={deletingId === note._id} className={`p-0.5 rounded flex-shrink-0 transition-all ${darkMode ? 'text-slate-600 hover:text-red-400' : 'text-slate-300 hover:text-red-500'}`}>
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                                {note.tags?.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                        {note.tags.map((tag, i) => (
                                            <span key={i} className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${darkMode ? 'bg-slate-700/60 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>{tag}</span>
                                        ))}
                                    </div>
                                )}
                                <p className={`text-[9px] mt-1 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                                    {new Date(note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function RightPanel({
    code,
    selectedLanguage,
    onCodeChange,
    onLanguageChange,
    onRun,
    onSubmit,
    loading,
    runResult,
    submitResult,
    customTestcases,
    setCustomTestcases,
    darkMode,
    activeRightTab,
    setActiveRightTab,
    problemId,
    battleMode = false,
    previewMode = false,
}) {
    const availableTabs = battleMode ? RIGHT_TABS.filter((tab) => tab.key !== 'notes') : RIGHT_TABS;

    return (
        <div className="flex-1 flex flex-col min-h-0">
            <div className={`flex items-center gap-1 px-2 sm:px-3 py-2 border-b overflow-x-auto scrollbar-none
                ${darkMode
                    ? 'bg-slate-900/60 border-slate-700/60'
                    : 'bg-slate-50/60 border-slate-200/60'
                }`}
            >
                {availableTabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveRightTab(tab.key)}
                        className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-semibold whitespace-nowrap transition-all duration-200
                            ${activeRightTab === tab.key
                                ? (darkMode
                                    ? 'bg-indigo-500/15 text-indigo-400 shadow-sm'
                                    : 'bg-indigo-50 text-indigo-700 shadow-sm')
                                : (darkMode
                                    ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/80'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100')
                            }`}
                    >
                        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                        </svg>
                        {tab.label}
                        {tab.key === 'test_result' && runResult && (
                            <span className={`w-1.5 h-1.5 rounded-full ${runResult.success ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        )}
                        {tab.key === 'submit_result' && submitResult && (
                            <span className={`w-1.5 h-1.5 rounded-full ${submitResult.passed ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        )}
                    </button>
                ))}
            </div>

            <div className="flex-1 flex flex-col min-h-0">
                {activeRightTab === 'code' && (
                    <CodeEditor
                        code={code}
                        selectedLanguage={selectedLanguage}
                        onCodeChange={onCodeChange}
                        onLanguageChange={onLanguageChange}
                        darkMode={darkMode}
                        previewMode={previewMode}
                    />
                )}

                {activeRightTab === 'testcases' && (
                    previewMode ? (
                        <LockedFeaturePanel
                            darkMode={darkMode}
                            title="Custom testcases are available after login"
                            description="Sign in to try your own inputs and use the console/testing workflow."
                        />
                    ) : (
                        <CustomTestcasePanel
                            testcases={customTestcases}
                            setTestcases={setCustomTestcases}
                            darkMode={darkMode}
                        />
                    )
                )}

                {activeRightTab === 'test_result' && (
                    previewMode ? (
                        <LockedFeaturePanel
                            darkMode={darkMode}
                            title="Run results are available after login"
                            description="Run the code and inspect testcase output after signing in."
                        />
                    ) : (
                        <div className="flex-1 overflow-y-auto p-3 sm:p-5">
                            <TestResultPanel runResult={runResult} testCases={customTestcases} darkMode={darkMode} />
                        </div>
                    )
                )}

                {activeRightTab === 'submit_result' && (
                    previewMode ? (
                        <LockedFeaturePanel
                            darkMode={darkMode}
                            title="Submission results are available after login"
                            description="Sign in to submit your code and view verdicts, runtime, and memory stats."
                        />
                    ) : (
                        <div className="flex-1 overflow-y-auto p-3 sm:p-5">
                            <SubmitResultPanel submitResult={submitResult} darkMode={darkMode} />
                        </div>
                    )
                )}

                {activeRightTab === 'notes' && (
                    previewMode ? (
                        <LockedFeaturePanel
                            darkMode={darkMode}
                            title="Notes are available after login"
                            description="Save revision notes and keep problem-specific reminders after signing in."
                        />
                    ) : (
                        <NotesPanel problemId={problemId} darkMode={darkMode} />
                    )
                )}
            </div>

            <ActionBar
                onRun={onRun}
                onSubmit={onSubmit}
                onConsole={() => setActiveRightTab('testcases')}
                loading={loading}
                darkMode={darkMode}
                previewMode={previewMode}
            />
        </div>
    );
}

export default RightPanel;
