import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { Group, Panel, Separator } from 'react-resizable-panels';
import problemService from '../../services/problemService';
import submissionService from '../../services/submissionService';
import Navbar from '../../components/Navbar';
import LeftPanel from '../../components/problem/LeftPanel';
import RightPanel from '../../components/problem/RightPanel';
import ErrorState from '../../components/ui/ErrorState';

function ResizeHandle({ darkMode }) {
    return (
        <Separator className="group relative hidden md:flex w-[6px] items-center justify-center">
            {/* Visible bar */}
            <div className={`absolute inset-y-0 w-[6px] transition-colors duration-150 ${
                darkMode
                    ? 'bg-slate-800 group-hover:bg-indigo-500/40 group-active:bg-indigo-500/60'
                    : 'bg-slate-200 group-hover:bg-indigo-300/60 group-active:bg-indigo-400/70'
            }`} />
            {/* Grab dots */}
            <div className="relative z-10 flex flex-col gap-[3px] opacity-0 transition-opacity group-hover:opacity-100">
                {[0, 1, 2].map((i) => (
                    <div key={i} className={`h-[3px] w-[3px] rounded-full ${darkMode ? 'bg-slate-500' : 'bg-slate-400'}`} />
                ))}
            </div>
        </Separator>
    );
}

const ProblemPage = () => {
    const { isAuthenticated, authChecked } = useSelector((state) => state.auth);
    const [problem, setProblem] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState('cpp');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [pageError, setPageError] = useState('');
    const [runResult, setRunResult] = useState(null);
    const [submitResult, setSubmitResult] = useState(null);
    const [customTestcases, setCustomTestcases] = useState([]);
    const [activeRightTab, setActiveRightTab] = useState('code');
    
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('darkMode') !== 'false';
    });
    const [mobilePanel, setMobilePanel] = useState('description');

    const { problemId } = useParams();
    const previewMode = authChecked && !isAuthenticated;

    useEffect(() => {
        localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);

    useEffect(() => {
        if (!authChecked) {
            return;
        }

        const fetchProblem = async () => {
            setPageLoading(true);
            setPageError('');
            setProblem(null);
            try {
                const data = isAuthenticated
                    ? await problemService.getProblemById(problemId)
                    : await problemService.getPublicProblemById(problemId);

                setProblem(data);

                if (data.visibleTestCases) {
                    setCustomTestcases(data.visibleTestCases.map(tc => ({ input: tc.input })));
                } else {
                    setCustomTestcases([]);
                }
            } catch (error) {
                console.error('Error fetching problem:', error);
                setPageError(error.message || 'We could not load this problem.');
                setCode('');
                setCustomTestcases([]);
            } finally {
                setPageLoading(false);
            }
        };

        fetchProblem();
    }, [authChecked, isAuthenticated, problemId]);

    useEffect(() => {
        if (problem) {
            const startCode = problem.startCode?.find(sc => sc.language === selectedLanguage);
            if (startCode) {
                setCode(startCode.initialCode);
            } else {
                setCode('');
            }
        }
    }, [selectedLanguage, problem]);

    const handleRun = async () => {
        if (previewMode) {
            return;
        }

        setLoading(true);
        setRunResult(null);

        try {
            const data = await submissionService.runCode(problemId, {
                code,
                language: selectedLanguage,
                input: customTestcases,
            });

            setRunResult(data);
            setActiveRightTab('test_result');
        } catch (error) {
            console.error('Error running code:', error);
            setRunResult({
                success: false,
                userOutput: null,
                expectedOutput: null,
                userError: error.response?.data || 'Internal server error',
                compilationError: null,
            });
            setActiveRightTab('test_result');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitCode = async () => {
        if (previewMode) {
            return;
        }

        setLoading(true);
        setSubmitResult(null);

        try {
            const data = await submissionService.submitCode(problemId, {
                code,
                language: selectedLanguage,
            });

            setSubmitResult(data);
            setActiveRightTab('submit_result');
        } catch (error) {
            console.error('Error submitting code:', error);
            setSubmitResult({
                verdict: 'Error',
                passed: false,
                details: error.response?.data || 'Internal server error',
                rawResponse: {},
            });
            setActiveRightTab('submit_result');
        } finally {
            setLoading(false);
        }
    };

    if (!authChecked || pageLoading) {
        return (
            <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-slate-950' : 'bg-white'}`}>
                <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className={`w-10 h-10 border-3 border-t-indigo-500 rounded-full animate-spin
                            ${darkMode ? 'border-slate-700' : 'border-slate-200'}`} />
                        <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            Loading problem...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (pageError || !problem) {
        return (
            <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-slate-950' : 'bg-white'}`}>
                <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
                <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-5xl">
                        <ErrorState
                            title="Problem unavailable"
                            description={pageError || 'This problem could not be found.'}
                            darkMode={darkMode}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`h-screen flex flex-col transition-colors duration-300 ${darkMode ? 'bg-slate-950' : 'bg-white'}`}>
            <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

            {/* Mobile tab switcher */}
            <div className={`flex md:hidden border-b ${darkMode ? 'bg-slate-900 border-slate-700/60' : 'bg-slate-50 border-slate-200/60'}`}>
                <button
                    onClick={() => setMobilePanel('description')}
                    className={`flex-1 py-2.5 text-xs font-bold text-center transition-colors
                        ${mobilePanel === 'description'
                            ? (darkMode ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-indigo-600 border-b-2 border-indigo-600')
                            : (darkMode ? 'text-slate-500' : 'text-slate-500')
                        }`}
                >
                    📄 Description
                </button>
                <button
                    onClick={() => setMobilePanel('code')}
                    className={`flex-1 py-2.5 text-xs font-bold text-center transition-colors
                        ${mobilePanel === 'code'
                            ? (darkMode ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-indigo-600 border-b-2 border-indigo-600')
                            : (darkMode ? 'text-slate-500' : 'text-slate-500')
                        }`}
                >
                    💻 Code Editor
                </button>
            </div>

            {/* Desktop: resizable panels | Mobile: tab-based */}
            <div className="flex-1 flex min-h-0">
                {/* Mobile fallback — same tab layout as before */}
                <div className={`flex flex-col w-full md:hidden ${mobilePanel === 'description' ? 'flex' : 'hidden'}`}>
                    <LeftPanel
                        problem={problem}
                        code={code}
                        problemId={problemId}
                        darkMode={darkMode}
                        previewMode={previewMode}
                    />
                </div>
                <div className={`flex flex-col w-full md:hidden ${mobilePanel === 'code' ? 'flex' : 'hidden'}`}>
                        <RightPanel
                            code={code}
                            selectedLanguage={selectedLanguage}
                            onCodeChange={setCode}
                            onLanguageChange={setSelectedLanguage}
                            onRun={handleRun}
                            onSubmit={handleSubmitCode}
                            loading={loading}
                            runResult={runResult}
                            submitResult={submitResult}
                            customTestcases={customTestcases}
                            setCustomTestcases={setCustomTestcases}
                            darkMode={darkMode}
                            activeRightTab={activeRightTab}
                            setActiveRightTab={setActiveRightTab}
                            problemId={problem?._id}
                            previewMode={previewMode}
                        />
                </div>

                {/* Desktop: resizable panel group */}
                <div className="hidden md:flex flex-1 min-h-0">
                    <Group direction="horizontal" autoSaveId="problem-panels">
                        <Panel defaultSize={45} minSize={25} order={1}>
                            <div className={`flex flex-col h-full border-r ${darkMode ? 'border-slate-700/60' : 'border-slate-200/60'}`}>
                                <LeftPanel
                                    problem={problem}
                                    code={code}
                                    problemId={problemId}
                                    darkMode={darkMode}
                                    previewMode={previewMode}
                                />
                            </div>
                        </Panel>
                        <ResizeHandle darkMode={darkMode} />
                        <Panel defaultSize={55} minSize={25} order={2}>
                            <div className="flex flex-col h-full">
                                <RightPanel
                                    code={code}
                                    selectedLanguage={selectedLanguage}
                                    onCodeChange={setCode}
                                    onLanguageChange={setSelectedLanguage}
                                    onRun={handleRun}
                                    onSubmit={handleSubmitCode}
                                    loading={loading}
                                    runResult={runResult}
                                    submitResult={submitResult}
                                    customTestcases={customTestcases}
                                    setCustomTestcases={setCustomTestcases}
                                    darkMode={darkMode}
                                    activeRightTab={activeRightTab}
                                    setActiveRightTab={setActiveRightTab}
                                    problemId={problem?._id}
                                    previewMode={previewMode}
                                />
                            </div>
                        </Panel>
                    </Group>
                </div>
            </div>
        </div>
    );
};

export default ProblemPage;
