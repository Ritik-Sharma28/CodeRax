import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import matchService from '../../services/matchService';
import problemService from '../../services/problemService';
import submissionService from '../../services/submissionService';
import { disconnectSocketSession, socket, syncSocketSession } from '../../services/socket.js';
import LeftPanel from '../../components/problem/LeftPanel';
import RightPanel from '../../components/problem/RightPanel';

const BattleArena = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Core state
  const [matchData, setMatchData] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');

  // Problem state
  const [activeIndex, setActiveIndex] = useState(0);
  const [problems, setProblems] = useState([]);       // array of fetched problem objects

  // Editor state (per-problem)
  const [codeMap, setCodeMap] = useState({});         // Cache code: { "Q1_cpp": "...", "Q1_java": "..." }
  const [code, setCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('cpp');
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [customTestcases, setCustomTestcases] = useState([]);
  const [activeRightTab, setActiveRightTab] = useState('code');

  // Leaderboard
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  // Timer
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);
  const pollTimerRef = useRef(null);
  const isExitingRef = useRef(false);
  const matchSettingsRef = useRef(null); // Used to avoid stale closures in socket events

  // Mobile panel toggle
  const [mobilePanel, setMobilePanel] = useState('description');

  // Dark mode
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // ───── Socket + Match Fetch ─────
  useEffect(() => {
    if (!user) return; // Null Guard

    let isMounted = true; // Async cleanup guard

    syncSocketSession({ userId: user._id, roomId: matchId });

    const handleConnect = () => {
      // If socket auto-reconnects, re-auth and re-join room
      syncSocketSession({ userId: user._id, roomId: matchId });
    };

    socket.on('connect', handleConnect);

    const initMatch = async () => {
      try {
        const data = await matchService.getMatch(matchId);
        if (!isMounted) return;

        setMatchData(data);
        matchSettingsRef.current = data.settings; // Safe ref for closures

        if (data.status === 'Completed') {
          navigate(`/battle-results/${matchId}`);
          return;
        }

        // Setup polling if stuck in Waiting state (recovery for missed WS events)
        if (data.status === 'Waiting') {
           if (pollTimerRef.current) clearInterval(pollTimerRef.current);
           pollTimerRef.current = setInterval(async () => {
             try {
                if (!isMounted) return;
                const pollData = await matchService.getMatch(matchId);
                if (pollData && pollData.status !== 'Waiting') {
                  if (pollTimerRef.current) clearInterval(pollTimerRef.current);
                  setMatchData(pollData);
                  matchSettingsRef.current = pollData.settings;
                  
                  if (pollData.status === 'Completed') {
                     navigate(`/battle-results/${matchId}`);
                     return;
                  }
                  
                  if (pollData.status === 'Ongoing' && pollData.settings?.durationMinutes) {
                     const endT = pollData.endTime ? new Date(pollData.endTime).getTime() : new Date().getTime() + (pollData.settings.durationMinutes * 60 * 1000);
                     startTimer(endT);
                  }
                }
             } catch (err) {
                // Ignore transient network errors during polling
             }
           }, 3000);
        }

        // Load problems
        const ids = data.problems || [];

        if (ids.length > 0) {
          const fetched = await Promise.all(
            ids.map(id => problemService.getProblemById(id).catch(() => null))
          );
          if (!isMounted) return;

          setProblems(fetched.filter(Boolean));

          // Set initial code for first problem
          if (fetched[0]) {
            const startCode = fetched[0].startCode?.find(sc => sc.language === 'cpp');
            if (startCode) {
               setCode(startCode.initialCode);
               setCodeMap(prev => ({ ...prev, [`0_cpp`]: startCode.initialCode }));
            }
            if (fetched[0].visibleTestCases) {
              setCustomTestcases(fetched[0].visibleTestCases.map(tc => ({ input: tc.input })));
            }
          }
        }

        // Start timer if ongoing
        if (data.status === 'Ongoing' && data.settings?.durationMinutes) {
          // Calculate using DB endTime if available, otherwise fallback
          const endTime = data.endTime ? new Date(data.endTime).getTime() : new Date(data.startTime || data.updatedAt).getTime() + (data.settings.durationMinutes * 60 * 1000);
          startTimer(endTime);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error(err);
        setError('Failed to load match data');
      } finally {
        if (isMounted) setPageLoading(false);
      }
    };
    initMatch();

    const handleRoomSnapshot = (data) => {
      if (!isMounted || data?.match?.matchId !== matchId) return;

      const snapshotMatch = data.match;
      setMatchData(snapshotMatch);
      matchSettingsRef.current = snapshotMatch.settings;

      if (snapshotMatch.status === 'Completed') {
        if (timerRef.current) clearInterval(timerRef.current);
        navigate(`/battle-results/${matchId}`);
        return;
      }

      if (snapshotMatch.status === 'Ongoing') {
        const duration = snapshotMatch.settings?.durationMinutes || matchSettingsRef.current?.durationMinutes || 60;
        const endTime = snapshotMatch.endTime
          ? new Date(snapshotMatch.endTime).getTime()
          : Date.now() + (duration * 60 * 1000);
        startTimer(endTime);
      }
    };

    const handleGameStarted = (data) => {
      if (!isMounted) return;
      const serverMatch = data?.match || null;
      if (serverMatch?.matchId === matchId) {
        setMatchData(serverMatch);
        matchSettingsRef.current = serverMatch.settings;
      } else {
        setMatchData(prev => prev ? { ...prev, status: 'Ongoing' } : prev);
      }

      const duration = serverMatch?.settings?.durationMinutes || matchSettingsRef.current?.durationMinutes || 60;
      const endTime = serverMatch?.endTime ? new Date(serverMatch.endTime).getTime() : Date.now() + (duration * 60 * 1000);
      startTimer(endTime);
    };

    const handleLeaderboardUpdate = (data) => {
      if (!isMounted) return;
      setMatchData(prev => prev ? { ...prev, participants: data.participants, leaderboard: data.leaderboard || prev.leaderboard } : prev);
    };

    const handleGameEnded = () => {
      if (!isMounted) return;
      if (timerRef.current) clearInterval(timerRef.current);
      navigate(`/battle-results/${matchId}`);
    };

    socket.on('roomSnapshot', handleRoomSnapshot);
    socket.on('gameStarted', handleGameStarted);
    socket.on('leaderboardUpdate', handleLeaderboardUpdate);
    socket.on('gameEnded', handleGameEnded);

    return () => {
      isMounted = false;
      socket.off('connect', handleConnect);
      socket.off('roomSnapshot', handleRoomSnapshot);
      socket.off('gameStarted', handleGameStarted);
      socket.off('leaderboardUpdate', handleLeaderboardUpdate);
      socket.off('gameEnded', handleGameEnded);
      if (timerRef.current) clearInterval(timerRef.current);
      disconnectSocketSession();
    };
  }, [matchId, user, navigate]);

  const startTimer = (endTime) => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const remaining = Math.max(0, endTime - Date.now());
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timerRef.current);
      }
    }, 1000);
  };

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // ───── Problem Navigation ─────
  const switchProblem = (index) => {
    if (index < 0 || index >= problems.length) return;
    setActiveIndex(index);
    setRunResult(null);
    setSubmitResult(null);
    setActiveRightTab('code');

    const prob = problems[index];
    if (prob) {
      const cacheKey = `${index}_${selectedLanguage}`;
      if (codeMap[cacheKey]) {
          setCode(codeMap[cacheKey]);
      } else {
          const startCode = prob.startCode?.find(sc => sc.language === selectedLanguage);
          const initial = startCode?.initialCode || '';
          setCode(initial);
          setCodeMap(prev => ({ ...prev, [cacheKey]: initial }));
      }
      setCustomTestcases(prob.visibleTestCases?.map(tc => ({ input: tc.input })) || []);
    }
  };

  // Update code when language changes
  useEffect(() => {
    const prob = problems[activeIndex];
    if (prob) {
      const cacheKey = `${activeIndex}_${selectedLanguage}`;
      if (codeMap[cacheKey]) {
          setCode(codeMap[cacheKey]);
      } else {
          const startCode = prob.startCode?.find(sc => sc.language === selectedLanguage);
          const initial = startCode?.initialCode || '';
          setCode(initial);
          setCodeMap(prev => ({ ...prev, [cacheKey]: initial }));
      }
    }
  }, [selectedLanguage, activeIndex, problems, codeMap]);

  // Keep codeMap synced when user types
  useEffect(() => {
     if (code) {
         setCodeMap(prev => ({ ...prev, [`${activeIndex}_${selectedLanguage}`]: code }));
     }
  }, [code, selectedLanguage, activeIndex]);

  // ───── Submission Handlers ─────
  const handleRun = async () => {
    const prob = problems[activeIndex];
    if (!prob) return;
    setLoading(true);
    setRunResult(null);
    try {
      const data = await submissionService.runCode(prob._id, {
        code,
        language: selectedLanguage,
        input: customTestcases,
      });
      setRunResult(data);
      setActiveRightTab('test_result');
    } catch (error) {
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
    const prob = problems[activeIndex];
    if (!prob) return;
    setLoading(true);
    setSubmitResult(null);
    try {
      const data = await submissionService.submitCode(prob._id, {
        code,
        language: selectedLanguage,
        matchId, // Pass matchId so backend applies ICPC penalty logic
      });
      setSubmitResult(data);
      setActiveRightTab('submit_result');
    } catch (error) {
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

  // ───── Exit ─────
  const handleExit = async () => {
    if (!window.confirm('Are you sure you want to leave the battle? You will forfeit the match.')) return;
    try {
      const socketResponse = await new Promise((resolve) => {
        socket.timeout(5000).emit('forfeitMatch', { matchId, userId: user._id }, (err, ack) => {
          if (err) resolve({ ok: false, error: 'timeout' });
          else resolve(ack);
        });
      });

      if (!socketResponse?.ok) {
        await matchService.forfeitMatch(matchId);
      }
      
      // Navigate only if the server successfully registers the forfeit
      navigate(`/battle-results/${matchId}`);
    } catch (err) {
       console.error("Forfeit failed:", err);
       alert("Failed to leave battle properly. Please check your connection and try again.");
    }
  };

  const handleSubmitContest = async () => {
    try {
      setFinalizing(true);
      const socketResponse = await new Promise((resolve) => {
        socket.timeout(5000).emit('submitContest', { matchId, userId: user._id }, (err, ack) => {
          if (err) resolve({ ok: false, error: 'timeout' });
          else resolve(ack);
        });
      });

      if (socketResponse?.ok) {
        setActionMessage('✅ Contest submitted! Waiting for opponent to finish...');
        return;
      }

      // Socket failed — try REST fallback
      await matchService.submitFinal(matchId);
      setActionMessage('✅ Contest submitted! Waiting for opponent to finish...');
    } catch (err) {
      setActionMessage(err?.response?.data?.error || 'Failed to submit contest');
      setTimeout(() => setActionMessage(''), 3000);
    } finally {
      setFinalizing(false);
    }
  };

  const handleFinishBattle = async () => {
    try {
      setFinalizing(true);
      await matchService.finishMatch(matchId);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to finish battle');
    } finally {
      setFinalizing(false);
    }
  };

  // ───── Loading / Error States ─────
  if (pageLoading) {
    return (
      <div className={`h-screen flex items-center justify-center ${darkMode ? 'bg-slate-950' : 'bg-white'}`}>
        <div className="flex flex-col items-center gap-3">
          <div className={`w-10 h-10 border-3 border-t-indigo-500 rounded-full animate-spin ${darkMode ? 'border-slate-700' : 'border-slate-200'}`} />
          <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Loading battle...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`h-screen flex items-center justify-center ${darkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'}`}>
        <div className="text-center">
          <p className="text-red-500 font-bold text-lg mb-4">{error}</p>
          <button onClick={() => navigate('/battle-lobby')} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg">Back to Lobby</button>
        </div>
      </div>
    );
  }

  if (matchData?.status === 'Waiting') {
    return (
      <div className={`h-screen flex flex-col items-center justify-center ${darkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'}`}>
        <div className={`w-12 h-12 border-3 border-t-purple-500 rounded-full animate-spin mb-4 ${darkMode ? 'border-slate-700' : 'border-slate-200'}`} />
        <h2 className="text-xl font-bold mb-2">
          {(matchData?.participants?.length || 0) < 2
            ? "Waiting for players..."
            : matchData?.type === 'Ranked'
              ? "Starting battle..."
              : "Waiting for host to start..."}
        </h2>
        <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Room: {matchId}</p>
      </div>
    );
  }

  // Sorted leaderboard
  const sortedParticipants = matchData?.leaderboard?.length
    ? matchData.leaderboard
    : matchData?.participants
    ? [...matchData.participants].sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      return a.totalTimeMinutes - b.totalTimeMinutes;
    }).map((p, idx) => ({
      ...p,
      rank: idx + 1,
      solvedCount: p.problemStats?.filter((x) => x.solved).length || 0
    }))
    : [];

  const currentProblem = problems[activeIndex] || null;

  // ───── Main Battle UI ─────
  return (
    <div className={`h-screen w-full overflow-hidden flex flex-col transition-colors duration-300 ${darkMode ? 'bg-slate-950' : 'bg-white'}`}>

      {/* ── Top Bar (replaces Navbar) ── */}
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-2.5 sm:px-4 py-2 border-b flex-shrink-0
        ${darkMode ? 'bg-slate-900 border-slate-700/60' : 'bg-slate-50 border-slate-200/60'}`}>

        {/* Left: Problem Tabs + Arrows */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none w-full sm:w-auto min-w-0">
          <button onClick={() => switchProblem(activeIndex - 1)} disabled={activeIndex === 0}
            className={`p-1.5 rounded-lg flex-shrink-0 transition-colors ${activeIndex === 0 ? 'opacity-30 cursor-not-allowed' : (darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-200 text-slate-600')}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>

          {problems.map((_, i) => (
            <button key={i} onClick={() => switchProblem(i)}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex-shrink-0
                ${activeIndex === i
                  ? (darkMode ? 'bg-indigo-500/20 text-indigo-400 shadow-sm' : 'bg-indigo-50 text-indigo-700 shadow-sm')
                  : (darkMode ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100')
                }`}>
              Q{i + 1}
            </button>
          ))}

          <button onClick={() => switchProblem(activeIndex + 1)} disabled={activeIndex >= problems.length - 1}
            className={`p-1.5 rounded-lg flex-shrink-0 transition-colors ${activeIndex >= problems.length - 1 ? 'opacity-30 cursor-not-allowed' : (darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-200 text-slate-600')}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>

          {problems.length === 0 && (
            <span className={`text-xs font-bold ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>No problems assigned</span>
          )}
        </div>

        {/* Center: Timer */}
        <div className={`hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-xl font-mono text-sm font-black flex-shrink-0
          ${timeLeft < 60000
            ? 'bg-red-500/15 text-red-500'
            : (darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700')
          }`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {formatTime(timeLeft)}
        </div>

        {/* Right: Leaderboard Toggle + Dark Mode + Exit */}
        <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2 w-full sm:w-auto flex-shrink-0">
          <span className={`sm:hidden text-[11px] font-mono font-black px-2 py-1 rounded-lg
            ${timeLeft < 60000 ? 'text-red-500 bg-red-500/10' : (darkMode ? 'text-slate-300 bg-slate-800' : 'text-slate-600 bg-slate-100')}`}>
            {formatTime(timeLeft)}
          </span>
          <button
            onClick={handleSubmitContest}
            disabled={finalizing}
            className={`inline-flex px-2 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-colors ${darkMode ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
            title="Submit Contest">
            Submit Contest
          </button>
          {matchData?.type === 'Custom' && String(matchData?.hostId?._id || matchData?.hostId) === String(user?._id) && (
            <button
              onClick={handleFinishBattle}
              disabled={finalizing}
              className={`inline-flex px-2 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-colors ${darkMode ? 'bg-orange-500/20 text-orange-300 hover:bg-orange-500/30' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'}`}
              title="Finish Battle">
              End (Host)
            </button>
          )}

          <button onClick={() => setShowLeaderboard(!showLeaderboard)}
            className={`p-2 rounded-lg transition-colors ${showLeaderboard ? (darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600') : (darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-200 text-slate-600')}`}
            title="Toggle Leaderboard">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" /></svg>
          </button>

          <button onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-800 text-yellow-400' : 'hover:bg-slate-200 text-slate-600'}`}>
            {darkMode ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
          </button>

          <button onClick={handleExit}
            className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors" title="Exit Battle">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>
      {actionMessage && (
        <div className={`px-3 sm:px-4 py-2 text-xs font-semibold border-b ${darkMode ? 'bg-slate-900/90 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>
          {actionMessage}
        </div>
      )}

      {/* ── Mobile Panel Switcher ── */}
      <div className={`flex md:hidden border-b ${darkMode ? 'bg-slate-900 border-slate-700/60' : 'bg-slate-50 border-slate-200/60'}`}>
        <button onClick={() => setMobilePanel('description')}
          className={`flex-1 py-2.5 text-xs font-bold text-center transition-colors
            ${mobilePanel === 'description'
              ? (darkMode ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-indigo-600 border-b-2 border-indigo-600')
              : (darkMode ? 'text-slate-500' : 'text-slate-500')
            }`}>
          📄 Description
        </button>
        <button onClick={() => setMobilePanel('code')}
          className={`flex-1 py-2.5 text-xs font-bold text-center transition-colors
            ${mobilePanel === 'code'
              ? (darkMode ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-indigo-600 border-b-2 border-indigo-600')
              : (darkMode ? 'text-slate-500' : 'text-slate-500')
            }`}>
          💻 Code Editor
        </button>
      </div>

      {/* ── Main Split Content ── */}
      <div className="flex-1 flex min-h-0 min-w-0 w-full relative">

        {/* Left Panel: Problem Description */}
        <div className={`flex flex-col min-h-0 min-w-0 overflow-hidden border-r
          ${darkMode ? 'border-slate-700/60' : 'border-slate-200/60'}
          ${showLeaderboard ? 'w-full md:w-[35%]' : 'w-full md:w-1/2'}
          ${mobilePanel === 'description' ? 'flex' : 'hidden md:flex'}
        `}>
          {currentProblem ? (
            <LeftPanel
              problem={currentProblem}
              code={code}
              problemId={currentProblem._id}
              darkMode={darkMode}
              setSubmitResult={setSubmitResult}
              battleMode
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className={`text-sm font-medium ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>No problem loaded</p>
            </div>
          )}
        </div>

        {/* Right Panel: Code Editor */}
        <div className={`flex flex-col min-h-0 min-w-0 overflow-hidden
          ${showLeaderboard ? 'w-full md:w-[40%]' : 'w-full md:w-1/2'}
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
            problemId={currentProblem?._id}
            battleMode
          />
        </div>

        {/* Leaderboard Side Panel */}
        {showLeaderboard && (
          <div className={`absolute md:relative right-0 top-0 bottom-0 z-20 w-full sm:w-[320px] md:w-[25%] flex flex-col border-l shadow-xl
            ${darkMode ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200/60'}`}>

            <div className={`flex items-center justify-between px-4 py-3 border-b flex-shrink-0
              ${darkMode ? 'border-slate-700/60' : 'border-slate-200/60'}`}>
              <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-500">
                Live Leaderboard
              </h3>
              <button onClick={() => setShowLeaderboard(false)} className="md:hidden p-1 rounded-lg hover:bg-slate-800 text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {sortedParticipants.map((p, index) => (
                <div key={p.userId?._id || p.userId || index}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all
                    ${index === 0
                      ? (darkMode ? 'bg-indigo-900/30 border-indigo-500/40' : 'bg-indigo-50 border-indigo-200')
                      : (darkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50 border-slate-200')
                    }`}>
                  <div className={`w-6 text-center text-xs font-black ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-slate-400' : index === 2 ? 'text-amber-600' : (darkMode ? 'text-slate-500' : 'text-slate-400')}`}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${p.rank || index + 1}`}
                  </div>
                  <img src={p.userId?.profilePicture || 'https://via.placeholder.com/32'} className={`w-8 h-8 rounded-full border flex-shrink-0 ${darkMode ? 'border-slate-600' : 'border-slate-300'}`} alt="" />
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-xs truncate ${darkMode ? 'text-white' : 'text-slate-900'}`}>{p.userId?.firstName || 'Player'}</p>
                    <p className="text-[10px] text-indigo-500 font-semibold">Score: {p.totalScore} • Solved: {p.solvedCount ?? 0} • {p.totalTimeMinutes}m</p>
                  </div>
                </div>
              ))}
              {sortedParticipants.length === 0 && (
                <p className={`text-xs text-center py-4 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>No participants yet</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BattleArena;
