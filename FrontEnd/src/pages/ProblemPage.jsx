import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import problemService from '../services/problemService';
import submissionService from '../services/submissionService';
import Navbar from '../components/Navbar';
import LeftPanel from '../components/problem/LeftPanel';
import RightPanel from '../components/problem/RightPanel';

const ProblemPage = () => {
    const [problem, setProblem] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState('cpp');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [runResult, setRunResult] = useState(null);
    const [submitResult, setSubmitResult] = useState(null);
    const [customTestcases, setCustomTestcases] = useState([]);
    const [activeRightTab, setActiveRightTab] = useState('code');
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('darkMode') === 'true';
    });

    // Mobile panel toggle: 'description' or 'code'
    const [mobilePanel, setMobilePanel] = useState('description');

    const { problemId } = useParams();

    // Persist dark mode
    useEffect(() => {
        localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);

    // Fetch problem on mount
    useEffect(() => {
        const fetchProblem = async () => {
            setPageLoading(true);
            try {
                const data = await problemService.getProblemById(problemId);
                setProblem(data);

                const startCode = data.startCode?.find(sc => sc.language === selectedLanguage);
                if (startCode) {
                    setCode(startCode.initialCode);
                }

                if (data.visibleTestCases) {
                    setCustomTestcases(data.visibleTestCases.map(tc => ({ input: tc.input })));
                }
            } catch (error) {
                console.error('Error fetching problem:', error);
            } finally {
                setPageLoading(false);
            }
        };

        fetchProblem();
    }, [problemId]);

    // Update code when language changes
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

    /**
     * Run Code
     * POST /submission/run/:id
     * Body: { code, language, input }
     */
    const handleRun = async () => {
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

    /**
     * Submit Code
     * POST /submission/submit/:id
     * Body: { code, language }
     */
    const handleSubmitCode = async () => {
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

    // Loading state
    if (pageLoading) {
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

    return (
        <div className={`h-screen flex flex-col transition-colors duration-300 ${darkMode ? 'bg-slate-950' : 'bg-white'}`}>
            {/* Navbar */}
            <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

            {/* Mobile Panel Switcher - visible only on small screens */}
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

            {/* Main Content - Split Panels (desktop) / Single Panel (mobile) */}
            <div className="flex-1 flex min-h-0">
                {/* Left Panel - always visible on md+, toggled on mobile */}
                <div className={`flex flex-col border-r
                    ${darkMode ? 'border-slate-700/60' : 'border-slate-200/60'}
                    w-full md:w-1/2
                    ${mobilePanel === 'description' ? 'flex' : 'hidden md:flex'}
                `}>
                    <LeftPanel
                        problem={problem}
                        code={code}
                        problemId={problemId}
                        darkMode={darkMode}
                        setSubmitResult={setSubmitResult}
                    />
                </div>

                {/* Right Panel - always visible on md+, toggled on mobile */}
                <div className={`flex flex-col
                    w-full md:w-1/2
                    ${mobilePanel === 'code' ? 'flex' : 'hidden md:flex'}
                `}>
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
                    />
                </div>
            </div>
        </div>
    );
};

export default ProblemPage;