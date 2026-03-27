import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import matchService from '../../services/matchService';
import Navbar from '../../components/Navbar';

const BattleResults = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [darkMode, setDarkMode] = useState(() => {
      return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
      localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (!user) return; // Null Guard
    const fetchResults = async () => {
      try {
        const data = await matchService.getMatch(matchId);
        setMatchData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [matchId]);

  if (loading || !matchData) return <div className={`min-h-screen flex justify-center items-center ${darkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}><span className="loading loading-spinner text-indigo-500 loading-lg"></span></div>;

  const sortedParticipants = [...matchData.participants].sort((a, b) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    return a.totalTimeMinutes - b.totalTimeMinutes;
  });

  const getSolvedCount = (participant) => participant.problemStats?.filter((ps) => ps.solved).length || 0;

  const getPodiumColor = (index) => {
    if (index === 0) return 'from-yellow-400 to-yellow-600 border-yellow-500 shadow-yellow-500/50';
    if (index === 1) return 'from-gray-300 to-gray-500 border-gray-400 shadow-gray-400/50';
    if (index === 2) return 'from-amber-600 to-amber-800 border-amber-700 shadow-amber-700/50';
    return 'from-gray-700 to-gray-800 border-gray-600';
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <div className="flex-1 pt-8 sm:pt-12 px-3 sm:px-4 pb-10 sm:pb-12">
      <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600 mb-4 tracking-tight">
              Battle Complete
          </h1>
          <p className={`text-sm sm:text-lg font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Room: <span className="font-mono text-indigo-500">{matchId}</span></p>
      </div>

      <div className="hidden md:flex max-w-3xl mx-auto flex-col md:flex-row items-end justify-center gap-4 mb-16 h-80">
        {/* Render podium top 3 */}
        {[1, 0, 2].map((podiumIndex) => {
          const p = sortedParticipants[podiumIndex];
          if (!p) return null;
          
          const heightClass = podiumIndex === 0 ? 'h-64' : podiumIndex === 1 ? 'h-52' : 'h-40';
          const sizeClass = podiumIndex === 0 ? 'w-24 h-24' : 'w-20 h-20';
          
          return (
              <div key={p.userId._id} className="flex flex-col items-center flex-1 z-10 hover:-translate-y-2 transition-transform duration-300">
                  <div className="relative mb-4">
                    {podiumIndex === 0 && <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-3xl">👑</span>}
                    <img src={p.userId.profilePicture || 'https://via.placeholder.com/100'} alt="avatar" className={`${sizeClass} rounded-full object-cover border-4 shadow-2xl relative z-20 ${darkMode ? 'border-slate-800' : 'border-white'}`} />
                  </div>
                  <div className={`w-full ${heightClass} bg-gradient-to-t ${getPodiumColor(podiumIndex)} rounded-t-2xl border-t-2 border-l border-r relative shadow-[0_-5px_30px_-5px_rgba(0,0,0,0.3)] flex flex-col items-center pt-6`}>
                      <p className="font-bold text-white text-lg truncate px-2">{p.userId.firstName}</p>
                    <p className="text-sm font-semibold opacity-80 mb-2">Score: {p.totalScore}</p>
                    <p className="text-xs bg-black/30 px-2 py-1 rounded-md">{p.totalTimeMinutes}m</p>
                    
                    {/* Rating changes placeholder */}
                    {matchData.type === 'Ranked' && (
                       <p className={`mt-auto mb-4 font-black ${podiumIndex === 0 ? 'text-green-300' : 'text-red-300'}`}>
                           {podiumIndex === 0 ? '+15' : '-10'}
                       </p>
                    )}
                </div>
            </div>
          );
        })}
      </div>

      <div className="md:hidden max-w-xl mx-auto space-y-3 mb-8">
        {sortedParticipants.slice(0, 3).map((p, idx) => (
          <div key={p.userId?._id || idx} className={`rounded-xl border p-3 flex items-center gap-3 ${darkMode ? 'border-slate-700 bg-slate-900/60' : 'border-slate-200 bg-white'}`}>
            <div className="text-lg font-black w-8 text-center">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</div>
            <img src={p.userId?.profilePicture || 'https://via.placeholder.com/100'} alt="avatar" className="w-10 h-10 rounded-full object-cover border-2 border-indigo-400" />
            <div className="min-w-0">
              <p className="font-bold truncate">{p.userId?.firstName || 'Player'}</p>
              <p className="text-xs text-indigo-500 font-semibold">Score {p.totalScore} • {getSolvedCount(p)}/{matchData.problems?.length || 0} solved • {p.totalTimeMinutes}m</p>
            </div>
          </div>
        ))}
      </div>

      <div className={`max-w-4xl mx-auto rounded-2xl border overflow-x-auto mb-8 ${darkMode ? 'border-slate-700 bg-slate-900/60' : 'border-slate-200 bg-white'}`}>
        <div className="min-w-[520px]">
        <div className={`grid grid-cols-5 px-4 py-3 text-xs font-black uppercase tracking-wide ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
          <span>Rank</span>
          <span>Player</span>
          <span>Score</span>
          <span>Solved</span>
          <span>Time</span>
        </div>
        {sortedParticipants.map((p, idx) => (
          <div key={p.userId?._id || idx} className={`grid grid-cols-5 px-4 py-3 text-sm border-t ${darkMode ? 'border-slate-800 text-slate-200' : 'border-slate-100 text-slate-700'}`}>
            <span className="font-bold">#{idx + 1}</span>
            <span className="font-semibold truncate">{p.userId?.firstName || 'Player'}</span>
            <span>{p.totalScore}</span>
            <span>{getSolvedCount(p)}/{matchData.problems?.length || 0}</span>
            <span>{p.totalTimeMinutes}m</span>
          </div>
        ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <button onClick={() => navigate('/battle-lobby')} className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition shadow-lg shadow-indigo-600/30">
              Play Again
          </button>
          <button onClick={() => navigate('/profile')} className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold transition ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'}`}>
              Back to Profile
          </button>
      </div>
      </div>
    </div>
  );
};

export default BattleResults;
