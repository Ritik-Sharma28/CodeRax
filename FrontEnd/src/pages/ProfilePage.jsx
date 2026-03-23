import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import matchService from '../services/matchService';
import { checkAuth } from '../services/authSlice';
import Navbar from '../components/Navbar';

const ProfilePage = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [darkMode, setDarkMode] = useState(() => {
      return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
      localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (user?._id) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    try {
      const data = await matchService.getUserProfile(user._id);
      setProfileData(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const data = await matchService.uploadProfilePicture(formData);
      dispatch(checkAuth());
      setProfileData((prev) => ({ ...prev, profilePicture: data.profilePicture }));
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
        <span className="loading loading-spinner text-indigo-500 loading-lg"></span>
      </div>
    );
  }

  const { firstName, lastName, profilePicture, rating, matchesPlayed, matchesWon, rank } = profileData || user || {};
  const winRate = matchesPlayed > 0 ? ((matchesWon / matchesPlayed) * 100).toFixed(1) : 0;

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      
      <div className="flex-1 w-full pt-8 px-4 sm:px-8 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className={`rounded-3xl shadow-xl border overflow-hidden transition-colors ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
          
          {/* Header Section */}
          <div className="relative h-48 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800">
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
          
          {/* Profile Content */}
          <div className="relative px-6 pb-8 md:px-12">
            <div className="flex flex-col md:flex-row items-center md:items-end -mt-20 md:-mt-16 mb-8 gap-6">
              
              {/* Avatar Image & Upload */}
              <div className="relative group shrink-0">
                <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full border-4 overflow-hidden relative shadow-2xl ${darkMode ? 'border-slate-800 bg-slate-700' : 'border-white bg-slate-200'}`}>
                  {profilePicture ? (
                    <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl font-bold bg-indigo-500/10 text-indigo-500">
                      {firstName?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  
                  {/* Upload Overlay */}
                  <div 
                    onClick={() => fileInputRef.current.click()}
                    className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm"
                  >
                    {uploading ? (
                      <span className="loading loading-spinner text-white"></span>
                    ) : (
                      <span className="text-sm font-medium text-white flex flex-col items-center gap-1">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        Edit
                      </span>
                    )}
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    disabled={uploading}
                  />
                </div>
              </div>
              
              {/* User Identity Info */}
              <div className="text-center md:text-left flex-1 pb-2">
                <h1 className="text-3xl md:text-5xl font-black mb-1 truncate">
                  {firstName} {lastName}
                </h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3">
                  <span className="px-4 py-1.5 bg-indigo-500/10 text-indigo-500 rounded-full text-sm font-bold border border-indigo-500/20">
                    {rank || 'Bronze'}
                  </span>
                  <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${darkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                    Elo Rating: <strong className={darkMode ? 'text-white' : 'text-slate-900'}>{rating || 1200}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Battle Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`rounded-2xl p-6 border transition-colors ${darkMode ? 'bg-slate-800/80 border-slate-700 hover:border-indigo-500/50' : 'bg-slate-50 border-slate-200 hover:border-indigo-300'}`}>
                <h3 className={`text-sm font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Total Matches</h3>
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">
                  {matchesPlayed || 0}
                </div>
              </div>
              
              <div className={`rounded-2xl p-6 border transition-colors ${darkMode ? 'bg-slate-800/80 border-slate-700 hover:border-green-500/50' : 'bg-slate-50 border-slate-200 hover:border-green-400'}`}>
                <h3 className={`text-sm font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Matches Won</h3>
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500">
                  {matchesWon || 0}
                </div>
              </div>
              
              <div className={`rounded-2xl p-6 border transition-colors ${darkMode ? 'bg-slate-800/80 border-slate-700 hover:border-purple-500/50' : 'bg-slate-50 border-slate-200 hover:border-purple-300'}`}>
                <h3 className={`text-sm font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Win Rate</h3>
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
                  {winRate}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default ProfilePage;
