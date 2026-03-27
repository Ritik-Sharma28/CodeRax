import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllProblems, selectProblemIndex } from '../../services/slices/problemsSlice';
import { useNavigate } from 'react-router';
import matchService from '../../services/matchService';
import { socket } from '../../services/socket.js';
import Navbar from '../../components/Navbar';

const BattleLobby = () => {
  const { user } = useSelector((state) => state.auth);
  const problemIndex = useSelector(selectProblemIndex);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [matchData, setMatchData] = useState(null);
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Ranked');

  const [maxPlayers, setMaxPlayers] = useState(2);
  const [duration, setDuration] = useState(60);
  const [useRandomProblems, setUseRandomProblems] = useState(true);
  const [randomProblemsCount, setRandomProblemsCount] = useState(1);
  const [selectedProblems, setSelectedProblems] = useState([]);

  const toggleProblemSelection = (problemId) => {
    setSelectedProblems(prev => {
       if (prev.includes(problemId)) return prev.filter(id => id !== problemId);
       if (prev.length >= 5) return prev;
       return [...prev, problemId];
    });
  };

  const [darkMode, setDarkMode] = useState(() => {
      return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
      localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const matchDataRef = useRef(null);
  useEffect(() => {
      matchDataRef.current = matchData;
  }, [matchData]);

  useEffect(() => {
    if (!user) return; // Null Guard

    dispatch(fetchAllProblems());

    socket.connect();
    
    // Initial emit
    socket.emit("authenticate", user._id);
    if (matchDataRef.current) {
        socket.emit("joinRoom", matchDataRef.current.matchId);
    }

    // Reconnection strategy
    const onConnect = () => {
        socket.emit("authenticate", user._id);
        if (matchDataRef.current) {
            socket.emit('joinRoom', matchDataRef.current.matchId);
        }
    };
    socket.on('connect', onConnect);
    
    socket.on('playerJoined', (data) => {
      setMatchData(prev => {
        if (!prev) return prev;
        return { ...prev, participants: data.participants };
      });
    });

    socket.on('matchFound', (data) => {
        navigate(`/battle/${data.matchId}`);
    });

    socket.on('gameStarted', (data) => {
      const startedMatchId = data?.match?.matchId || matchDataRef.current?.matchId;
      if (startedMatchId) {
        navigate(`/battle/${startedMatchId}`);
      }
    });

    return () => {
      socket.off('connect', onConnect);
      socket.off('playerJoined');
      socket.off('matchFound');
      socket.off('gameStarted');
      socket.disconnect();
    };
  }, [user, navigate, dispatch]);

  const createMatch = async () => {
    setLoading(true);
    setError('');
    
    let safePlayers = Math.max(2, Math.min(10, maxPlayers || 2));
    let safeDuration = Math.max(5, Math.min(120, duration || 60));

    try {
      const data = await matchService.createMatch({
        type: 'Custom',
        settings: { 
            maxPlayers: safePlayers, 
            durationMinutes: safeDuration,
            randomProblemsCount: useRandomProblems ? Math.max(1, Math.min(5, randomProblemsCount)) : 0
        },
        randomProblemsDoc: useRandomProblems,
        problems: useRandomProblems ? [] : selectedProblems 
      });
      
      setMatchData(data);
      socket.emit('joinRoom', data.matchId);
    } catch (err) {
      setError('Failed to create match');
    } finally {
      setLoading(false);
    }
  };

  const joinRankedQueue = async () => {
    setLoading(true);
    setError('');
    try {
      await matchService.queueMatch(user?.rating || 1200);
    } catch (err) {
      setError('Failed to join queue');
      setLoading(false);
    }
  };

  const cancelQueue = async () => {
    try {
      await matchService.cancelQueue();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const joinMatch = async (e) => {
    e?.preventDefault();
    if (!joinCode) return;
    setLoading(true);
    setError('');
    try {
      const data = await matchService.joinMatch(joinCode.trim().toUpperCase());
      setMatchData(data);
      socket.emit('joinRoom', data.matchId);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to join match');
    } finally {
      setLoading(false);
    }
  };

  const startGame = () => {
    if (!matchData) return;
    socket.emit('startGame', matchData.matchId);
    // Removed direct navigate() so all clients wait for 'gameStarted' confirm
  };

  // ---- WAITING ROOM ----
  if (matchData) {
    const isHost = matchData.hostId === user._id;

    return (
      <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
        <div className="flex-1 flex justify-center pt-6 sm:pt-10 px-4 pb-10">
          <div className="max-w-4xl w-full">
            <div className={`rounded-2xl shadow-xl overflow-hidden border p-6 sm:p-8 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <h1 className="text-2xl sm:text-3xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500 text-center">
                Battle Waiting Room
              </h1>
              
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
                  Participants ({matchData.participants.length}/{matchData.settings.maxPlayers})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {matchData.participants.map(p => (
                    <div key={p.userId._id} className={`flex items-center gap-3 p-3 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                      <img src={p.userId.profilePicture || 'https://via.placeholder.com/40'} alt="avatar" className="w-10 h-10 flex-shrink-0 rounded-full border-2 border-indigo-400" />
                      <div className="min-w-0">
                        <p className="font-bold text-sm truncate">{p.userId.firstName}</p>
                        <p className="text-xs font-semibold text-indigo-500 truncate">{p.userId.rank} &bull; {p.userId.rating}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center">
                {isHost ? (
                  <button onClick={startGame} className="px-8 py-3 w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-lg font-bold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25">
                    Start Game
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

  // ---- MAIN LOBBY ----
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

          {/* TABS */}
          <div className={`flex p-1 rounded-xl mb-8 ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
             <button 
                onClick={() => setActiveTab('Ranked')} 
                className={`flex-1 py-2.5 sm:py-3 text-xs sm:text-sm font-bold rounded-lg transition-all ${activeTab === 'Ranked' ? 'bg-indigo-600 text-white shadow' : (darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900')}`}
             >
                 🏆 Ranked Match
             </button>
             <button 
                onClick={() => setActiveTab('Custom')} 
                className={`flex-1 py-2.5 sm:py-3 text-xs sm:text-sm font-bold rounded-lg transition-all ${activeTab === 'Custom' ? 'bg-indigo-600 text-white shadow' : (darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900')}`}
             >
                 🤝 Custom Room
             </button>
          </div>

          {/* TAB 1: RANKED */}
          {activeTab === 'Ranked' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className={`p-6 sm:p-8 rounded-xl border text-center ${darkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-pink-500/30">
                     <span className="text-2xl">⚔️</span>
                  </div>
                  <h2 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>1v1 Ranked Matchmaking</h2>
                  <p className={`text-sm mb-8 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Queue up against players of similar skill level. Win to increase your Elo rating.</p>
                  
                  <button onClick={joinRankedQueue} disabled={loading} className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-black text-lg py-4 px-6 rounded-xl transition duration-200 shadow-lg shadow-pink-600/30 flex items-center justify-center">
                    {loading ? (
                        <>
                           <span className="loading loading-spinner text-white h-5 w-5 mr-3"></span> 
                           Searching...
                        </>
                    ) : 'Find Match'}
                  </button>

                  {loading && (
                      <button onClick={cancelQueue} className="mt-4 text-sm font-bold opacity-70 hover:opacity-100 hover:text-red-400 decoration-red-400 px-4 py-2 border border-slate-700/50 rounded-lg w-full transition">
                          Cancel Search
                      </button>
                  )}
               </div>
            </div>
          )}

          {/* TAB 2: CUSTOM */}
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
                             {problemIndex.map(p => {
                                const isSelected = selectedProblems.includes(p._id);
                                const isDisabled = !isSelected && selectedProblems.length >= 5;
                                return (
                                    <label key={p._id} className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${isSelected ? (darkMode ? 'bg-indigo-500/20 shadow-sm' : 'bg-indigo-50 shadow-sm') : (darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100')} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                       <input type="checkbox" checked={isSelected} disabled={isDisabled} onChange={() => toggleProblemSelection(p._id)} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-white border-slate-300" />
                                       <div className="min-w-0 flex-1 flex justify-between items-center">
                                          <span className={`text-sm font-bold truncate ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{p.title}</span>
                                          <span className={`text-[10px] uppercase font-black px-1.5 py-0.5 rounded ${p.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-600' : p.difficulty === 'Medium' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'}`}>{p.difficulty}</span>
                                       </div>
                                    </label>
                                );
                             })}
                             {problemIndex.length === 0 && <p className="text-center text-xs opacity-50 p-4">No problems loaded.</p>}
                          </div>
                       </div>
                   )}
                 </div>

                <button onClick={createMatch} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl transition duration-200 shadow-md shadow-indigo-600/30 flex justify-center">
                  {loading ? <span className="loading loading-spinner text-white h-5 w-5"></span> : 'Create Custom Room'}
                </button>
              </div>

              <form onSubmit={joinMatch} className={`p-6 rounded-xl border block ${darkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}>
                <h2 className="text-purple-500 font-bold mb-4 uppercase text-sm tracking-wider">Join via Code</h2>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input type="text" placeholder="ENTER 6-CHAR CODE" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} maxLength={6} className={`flex-1 border uppercase rounded-xl p-3 text-center text-lg font-mono tracking-widest font-black placeholder-slate-500 outline-none transition-colors ${darkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-purple-500' : 'bg-white border-slate-300 text-slate-900 focus:border-purple-500'}`} />
                  <button disabled={loading || joinCode.length < 6} type="submit" className="bg-purple-600 hover:bg-purple-500 disabled:bg-slate-600 disabled:text-slate-400 text-white font-black px-6 py-3 rounded-xl transition duration-200 flex-shrink-0 shadow-md shadow-purple-600/30">
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
