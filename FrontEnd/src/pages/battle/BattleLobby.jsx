import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import Navbar from '../../components/Navbar';
import matchService from '../../services/matchService';
import { disconnectSocketSession, socket, syncSocketSession, updateSocketSession } from '../../services/socket.js';
import { fetchAllProblems, selectProblemIndex } from '../../services/slices/problemsSlice';

const SEARCH_TIMEOUT_MS = 60_000; // 60 seconds

const BattleLobby = () => {
  const { user } = useSelector((state) => state.auth);
  const problemIndex = useSelector(selectProblemIndex);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [matchData, setMatchData] = useState(null);
  const [joinCode, setJoinCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearchingRanked, setIsSearchingRanked] = useState(false);
  const [searchTimedOut, setSearchTimedOut] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Ranked');

  const [maxPlayers, setMaxPlayers] = useState(2);
  const [duration, setDuration] = useState(60);
  const [useRandomProblems, setUseRandomProblems] = useState(true);
  const [randomProblemsCount, setRandomProblemsCount] = useState(1);
  const [selectedProblems, setSelectedProblems] = useState([]);

  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const matchDataRef = useRef(null);

  // ── Refs to break stale-closure issues in socket handlers ──
  const isSearchingRankedRef = useRef(false);
  const queueConfirmedRef = useRef(false);
  const hasActiveMatchRef = useRef(false);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    matchDataRef.current = matchData;
    hasActiveMatchRef.current = Boolean(matchData?.matchId);
  }, [matchData]);

  // Keep ref in sync with state
  useEffect(() => {
    isSearchingRankedRef.current = isSearchingRanked;
  }, [isSearchingRanked]);

  const toggleProblemSelection = (problemId) => {
    setSelectedProblems((prev) => {
      if (prev.includes(problemId)) return prev.filter((id) => id !== problemId);
      if (prev.length >= 5) return prev;
      return [...prev, problemId];
    });
  };

  // ── Fix 5: On-mount recovery — check for pending match / queued status ──
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const recoverSession = async () => {
      try {
        const status = await matchService.getQueueStatus();
        if (cancelled) return;

        if (status?.matchId) {
          // User has a pending match from a previous session
          navigate(`/battle/${status.matchId}`);
          return;
        }

        if (status?.status === 'queued') {
          // User was still in queue — resume search
          queueConfirmedRef.current = true;
          setIsSearchingRanked(true);
        }
      } catch {
        // Ignore — fresh session, nothing to recover
      }
    };

    recoverSession();
    return () => { cancelled = true; };
  }, [user, navigate]);

  // ── Socket lifecycle ──
  useEffect(() => {
    if (!user) return;

    dispatch(fetchAllProblems());
    syncSocketSession({ userId: user._id, roomId: matchDataRef.current?.matchId || null });

    const handleRoomSnapshot = (data) => {
      const nextMatch = data?.match;
      if (!nextMatch) return;

      const currentMatchId = matchDataRef.current?.matchId;

      // Fix 3: Only accept snapshots for OUR match. If the user hasn't
      // created/joined a match, ignore ALL incoming snapshots.
      if (!hasActiveMatchRef.current) return;
      if (currentMatchId && nextMatch.matchId !== currentMatchId) return;

      setMatchData(nextMatch);

      if (nextMatch.status === 'Ongoing') {
        navigate(`/battle/${nextMatch.matchId}`);
      } else if (nextMatch.status === 'Completed') {
        navigate(`/battle-results/${nextMatch.matchId}`);
      }
    };

    // Fix 2: Guard matchFound — only navigate if the user is actively searching
    const handleMatchFound = (data) => {
      if (!data?.matchId) return;

      if (!isSearchingRankedRef.current) {
        // Stale event (e.g. from a previous queue entry that survived a
        // page refresh). Clean up so it doesn't fire again.
        matchService.cancelQueue().catch(() => {});
        return;
      }

      setIsSearchingRanked(false);
      queueConfirmedRef.current = false;
      navigate(`/battle/${data.matchId}`);
    };

    const handleGameStarted = (data) => {
      const startedMatchId = data?.match?.matchId || matchDataRef.current?.matchId;
      if (!startedMatchId) return;
      setIsSearchingRanked(false);
      navigate(`/battle/${startedMatchId}`);
    };

    socket.on('roomSnapshot', handleRoomSnapshot);
    socket.on('matchFound', handleMatchFound);
    socket.on('gameStarted', handleGameStarted);

    return () => {
      socket.off('roomSnapshot', handleRoomSnapshot);
      socket.off('matchFound', handleMatchFound);
      socket.off('gameStarted', handleGameStarted);
      disconnectSocketSession();
    };
  }, [dispatch, navigate, user]);

  // Keep socket room in sync when matchData changes
  useEffect(() => {
    if (!user) return;
    updateSocketSession({ userId: user._id, roomId: matchData?.matchId || null });
  }, [matchData?.matchId, user]);

  // ── Fix 1: Queue-status polling (only after API confirms queue join) ──
  useEffect(() => {
    if (!user || !isSearchingRanked) return;

    let isActive = true;

    const pollQueueStatus = async () => {
      try {
        const status = await matchService.getQueueStatus();
        if (!isActive) return;

        if (status?.matchId) {
          setIsSearchingRanked(false);
          queueConfirmedRef.current = false;
          navigate(`/battle/${status.matchId}`);
          return;
        }

        // Only act on 'idle' if we know the queue-join API already completed.
        // This prevents the poll from killing the search before the API responds.
        if (status?.status === 'idle' && queueConfirmedRef.current) {
          setIsSearchingRanked(false);
          queueConfirmedRef.current = false;
        }
      } catch {
        // Let the socket path continue working even if an individual poll fails.
      }
    };

    pollQueueStatus();
    const intervalId = setInterval(pollQueueStatus, 2500);

    return () => {
      isActive = false;
      clearInterval(intervalId);
    };
  }, [isSearchingRanked, navigate, user]);

  // ── Waiting-room poll (custom rooms) ──
  useEffect(() => {
    if (!matchData?.matchId || matchData.status !== 'Waiting') return;

    let isActive = true;

    const pollMatch = async () => {
      try {
        const latestMatch = await matchService.getMatch(matchData.matchId);
        if (!isActive) return;

        setMatchData(latestMatch);

        if (latestMatch.status === 'Ongoing') {
          navigate(`/battle/${latestMatch.matchId}`);
        } else if (latestMatch.status === 'Completed') {
          navigate(`/battle-results/${latestMatch.matchId}`);
        }
      } catch {
        // Ignore transient failures and let the next poll or socket snapshot recover.
      }
    };

    pollMatch();
    const intervalId = setInterval(pollMatch, 2500);

    return () => {
      isActive = false;
      clearInterval(intervalId);
    };
  }, [matchData?.matchId, matchData?.status, navigate]);

  // ── Fix 4: Search timeout — auto-cancel after 60s with no match ──
  useEffect(() => {
    if (!isSearchingRanked) {
      setSearchTimedOut(false);
      return;
    }

    const timer = setTimeout(async () => {
      if (!isSearchingRankedRef.current) return;

      try {
        await matchService.cancelQueue();
      } catch { /* ignored */ }

      setIsSearchingRanked(false);
      queueConfirmedRef.current = false;
      setSearchTimedOut(true);
    }, SEARCH_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [isSearchingRanked]);

  // ── Actions ──
  const createMatch = async () => {
    setIsSubmitting(true);
    setError('');

    const safePlayers = Math.max(2, Math.min(10, maxPlayers || 2));
    const safeDuration = Math.max(5, Math.min(120, duration || 60));

    try {
      const data = await matchService.createMatch({
        type: 'Custom',
        settings: {
          maxPlayers: safePlayers,
          durationMinutes: safeDuration,
          randomProblemsCount: useRandomProblems ? Math.max(1, Math.min(5, randomProblemsCount)) : 0,
        },
        randomProblemsDoc: useRandomProblems,
        problems: useRandomProblems ? [] : selectedProblems,
      });

      setMatchData(data);
    } catch (err) {
      setError(err.message || 'Failed to create match');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fix 1: Set isSearchingRanked AFTER the API confirms, and mark queueConfirmed
  const joinRankedQueue = async () => {
    setError('');
    setSearchTimedOut(false);

    try {
      setIsSearchingRanked(true); // Show spinner immediately for UX
      await matchService.queueMatch(user?.rating || 1200);
      // NOW the queue entry exists in Redis — safe for polling to check
      queueConfirmedRef.current = true;
    } catch (err) {
      setError(err.message || 'Failed to join queue');
      setIsSearchingRanked(false);
      queueConfirmedRef.current = false;
    }
  };

  const cancelQueue = async () => {
    try {
      await matchService.cancelQueue();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearchingRanked(false);
      queueConfirmedRef.current = false;
      setSearchTimedOut(false);
    }
  };

  const joinMatch = async (e) => {
    e?.preventDefault();
    if (!joinCode) return;

    setIsSubmitting(true);
    setError('');

    try {
      const data = await matchService.joinMatch(joinCode.trim().toUpperCase());
      setMatchData(data);
    } catch (err) {
      setError(err.message || err.response?.data?.error || 'Failed to join match');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startGame = async () => {
    if (!matchData || !user) return;

    setError('');
    const ack = await new Promise((resolve) => {
       socket.timeout(5000).emit('startGame', { matchId: matchData.matchId, userId: user._id }, (err, response) => {
         if (err) resolve({ ok: false, error: 'Connection timeout. Please try again.' });
         else resolve(response);
       });
    });

    if (!ack?.ok) {
      setError(ack?.error || 'Failed to start match');
    }
  };

  // ── RENDER: Waiting Room ──
  if (matchData) {
    const participants = matchData.participants || [];
    const isHost = String(matchData.hostId?._id || matchData.hostId) === String(user?._id);
    const canStart = participants.length >= 2;

    return (
      <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
        <div className="flex-1 flex justify-center pt-6 sm:pt-10 px-4 pb-10">
          <div className="max-w-4xl w-full">
            <div className={`rounded-2xl shadow-xl overflow-hidden border p-6 sm:p-8 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <h1 className="text-2xl sm:text-3xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500 text-center">
                Battle Waiting Room
              </h1>

              {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm font-bold p-3 rounded-lg text-center mb-6">{error}</div>}

              <div className={`flex flex-col sm:flex-row gap-4 sm:gap-8 justify-between items-center mb-8 p-4 sm:p-6 rounded-xl border ${darkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-100 border-slate-200'}`}>
                <div className="text-center sm:text-left">
                  <p className="text-xs font-bold uppercase tracking-wider mb-1 opacity-70">Room Code</p>
                  <div className="text-4xl sm:text-5xl font-mono tracking-widest font-black">
                    {matchData.matchId}
                  </div>
                </div>
                <div className="text-center sm:text-right">
                  <p className="text-xs font-bold uppercase tracking-wider mb-1 opacity-70">Settings</p>
                  <p className="text-base font-bold">Max Players: <span className="text-blue-500">{matchData.settings.maxPlayers}</span></p>
                  <p className="text-base font-bold">Duration: <span className="text-purple-500">{matchData.settings.durationMinutes}m</span></p>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-lg font-bold mb-4 pb-2 border-b opacity-80">
                  Participants ({participants.length}/{matchData.settings.maxPlayers})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {participants.map((participant) => (
                    <div key={participant.userId._id} className={`flex items-center gap-3 p-3 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                      <img src={participant.userId.profilePicture || 'https://via.placeholder.com/40'} alt="avatar" className="w-10 h-10 flex-shrink-0 rounded-full border-2 border-indigo-400" />
                      <div className="min-w-0">
                        <p className="font-bold text-sm truncate">{participant.userId.firstName}</p>
                        <p className="text-xs font-semibold text-indigo-500 truncate">{participant.userId.rank} • {participant.userId.rating}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center">
                {isHost ? (
                  <button
                    disabled={!canStart}
                    onClick={startGame}
                    className="px-8 py-3 w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-300 text-white text-lg font-bold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 disabled:shadow-none disabled:cursor-not-allowed"
                  >
                    {canStart ? 'Start Game' : 'Need 2 Players To Start'}
                  </button>
                ) : (
                  <div className={`text-center w-full border p-4 rounded-xl ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="loading loading-dots loading-md text-indigo-500 mb-2 block mx-auto"></span>
                    <p className="font-bold opacity-80 text-sm">Waiting for Host to start the battle...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── RENDER: Lobby (no match yet) ──
  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

      <div className="flex-1 flex items-center justify-center p-4">
        <div className={`w-full max-w-xl p-4 sm:p-10 rounded-2xl shadow-xl border ${darkMode ? 'bg-slate-900 border-slate-800 shadow-[0_10px_40px_-10px_rgba(79,70,229,0.15)]' : 'bg-white border-slate-200'}`}>
          <div className="text-center mb-8">
            <h1 className={`text-2xl sm:text-5xl font-black mb-2 tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>DSA Arena</h1>
            <p className={`text-sm font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Dominate the leaderboards in real-time battles.</p>
          </div>

          {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm font-bold p-3 rounded-lg text-center mb-6">{error}</div>}

          {/* Fix 4: Search timeout feedback */}
          {searchTimedOut && (
            <div className="bg-amber-500/10 border border-amber-500/50 text-amber-500 text-sm font-bold p-3 rounded-lg text-center mb-6">
              No opponents found — please try again!
            </div>
          )}

          <div className={`flex p-1 rounded-xl mb-8 ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
            <button
              onClick={() => setActiveTab('Ranked')}
              className={`flex-1 py-2.5 sm:py-3 text-xs sm:text-sm font-bold rounded-lg transition-all ${activeTab === 'Ranked' ? 'bg-indigo-600 text-white shadow' : (darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900')}`}
            >
              Ranked Match
            </button>
            <button
              onClick={() => {
                if (isSearchingRanked) cancelQueue();
                setActiveTab('Custom');
              }}
              className={`flex-1 py-2.5 sm:py-3 text-xs sm:text-sm font-bold rounded-lg transition-all ${activeTab === 'Custom' ? 'bg-indigo-600 text-white shadow' : (darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900')}`}
            >
              Custom Room
            </button>
          </div>

          {activeTab === 'Ranked' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className={`p-6 sm:p-8 rounded-xl border text-center ${darkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}>
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-pink-500/30">
                  <span className="text-2xl">VS</span>
                </div>
                <h2 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>1v1 Ranked Matchmaking</h2>
                <p className={`text-sm mb-8 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Queue up against players of similar skill level. Win to increase your Elo rating.</p>

                <button
                  onClick={joinRankedQueue}
                  disabled={isSearchingRanked}
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 disabled:from-slate-700 disabled:to-slate-700 text-white font-black text-lg py-4 px-6 rounded-xl transition duration-200 shadow-lg shadow-pink-600/30 flex items-center justify-center"
                >
                  {isSearchingRanked ? (
                    <>
                      <span className="loading loading-spinner text-white h-5 w-5 mr-3"></span>
                      Searching...
                    </>
                  ) : 'Find Match'}
                </button>

                {isSearchingRanked && (
                  <button onClick={cancelQueue} className={`mt-4 text-sm font-bold opacity-70 hover:opacity-100 hover:text-red-400 decoration-red-400 px-4 py-2 border rounded-lg w-full transition ${darkMode ? 'text-slate-300 border-slate-700/50' : 'text-slate-600 border-slate-300'}`}>
                    Cancel Search
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'Custom' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className={`p-6 rounded-xl border ${darkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}>
                <h2 className="text-indigo-500 font-bold mb-4 uppercase text-sm tracking-wider">Host A Match</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className={`block text-xs font-bold mb-1.5 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Max Players (2-10)</label>
                    <input type="number" min="2" max="10" value={maxPlayers} onChange={(e) => setMaxPlayers(parseInt(e.target.value, 10))} className={`w-full border rounded-lg p-2.5 font-bold outline-none transition-colors ${darkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500' : 'bg-white border-slate-300 text-slate-900 focus:border-indigo-500'}`} />
                  </div>
                  <div>
                    <label className={`block text-xs font-bold mb-1.5 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Duration (5-120 min)</label>
                    <input type="number" min="5" max="120" value={duration} onChange={(e) => setDuration(parseInt(e.target.value, 10))} className={`w-full border rounded-lg p-2.5 font-bold outline-none transition-colors ${darkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500' : 'bg-white border-slate-300 text-slate-900 focus:border-indigo-500'}`} />
                  </div>
                </div>

                <div className={`mb-5 p-4 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <label className={`flex items-center gap-3 text-sm font-bold cursor-pointer ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    <input type="checkbox" checked={useRandomProblems} onChange={(e) => setUseRandomProblems(e.target.checked)} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-100 border-slate-300" />
                    Select Random Problems Automatically
                  </label>
                  {useRandomProblems ? (
                    <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50 animate-in fade-in slide-in-from-top-2">
                      <label className={`block text-xs font-bold mb-1.5 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Number of Questions (1-5)</label>
                      <input type="number" min="1" max="5" value={randomProblemsCount} onChange={(e) => setRandomProblemsCount(parseInt(e.target.value, 10) || 1)} className={`w-full border rounded-lg p-2.5 font-bold outline-none transition-colors ${darkMode ? 'bg-slate-900 border-slate-600 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-500'}`} />
                    </div>
                  ) : (
                    <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50 animate-in fade-in slide-in-from-top-2">
                      <div className="flex justify-between items-end mb-2">
                        <label className={`block text-xs font-bold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Manual Selection</label>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${selectedProblems.length === 5 ? 'bg-indigo-100 text-indigo-600' : (darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500')}`}>
                          {selectedProblems.length} / 5 Selected
                        </span>
                      </div>
                      <div className={`h-48 overflow-y-auto rounded-lg border p-2 space-y-1 ${darkMode ? 'border-slate-700 bg-slate-900/50 hover:scrollbar-thumb-slate-600 scrollbar-thumb-slate-700 scrollbar-track-transparent scrollbar-thin' : 'border-slate-200 bg-slate-50 hover:scrollbar-thumb-slate-400 scrollbar-thumb-slate-200 scrollbar-track-transparent scrollbar-thin'}`}>
                        {problemIndex.map((problem) => {
                          const isSelected = selectedProblems.includes(problem._id);
                          const isDisabled = !isSelected && selectedProblems.length >= 5;

                          return (
                            <label key={problem._id} className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${isSelected ? (darkMode ? 'bg-indigo-500/20 shadow-sm' : 'bg-indigo-50 shadow-sm') : (darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100')} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                              <input type="checkbox" checked={isSelected} disabled={isDisabled} onChange={() => toggleProblemSelection(problem._id)} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-white border-slate-300" />
                              <div className="min-w-0 flex-1 flex justify-between items-center">
                                <span className={`text-sm font-bold truncate ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{problem.title}</span>
                                <span className={`text-[10px] uppercase font-black px-1.5 py-0.5 rounded ${problem.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-600' : problem.difficulty === 'Medium' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'}`}>{problem.difficulty}</span>
                              </div>
                            </label>
                          );
                        })}
                        {problemIndex.length === 0 && <p className="text-center text-xs opacity-50 p-4">No problems loaded.</p>}
                      </div>
                    </div>
                  )}
                </div>

                <button onClick={createMatch} disabled={isSubmitting} className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-bold py-3.5 px-4 rounded-xl transition duration-200 shadow-md shadow-indigo-600/30 flex justify-center">
                  {isSubmitting ? <span className="loading loading-spinner text-white h-5 w-5"></span> : 'Create Custom Room'}
                </button>
              </div>

              <form onSubmit={joinMatch} className={`p-6 rounded-xl border block ${darkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}>
                <h2 className="text-purple-500 font-bold mb-4 uppercase text-sm tracking-wider">Join via Code</h2>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input type="text" placeholder="ENTER 6-CHAR CODE" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} maxLength={6} className={`flex-1 border uppercase rounded-xl p-3 text-center text-lg font-mono tracking-widest font-black placeholder-slate-500 outline-none transition-colors ${darkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-purple-500' : 'bg-white border-slate-300 text-slate-900 focus:border-purple-500'}`} />
                  <button disabled={isSubmitting || joinCode.length < 6} type="submit" className="bg-purple-600 hover:bg-purple-500 disabled:bg-slate-600 disabled:text-slate-400 text-white font-black px-6 py-3 rounded-xl transition duration-200 flex-shrink-0 shadow-md shadow-purple-600/30">
                    Join
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BattleLobby;
