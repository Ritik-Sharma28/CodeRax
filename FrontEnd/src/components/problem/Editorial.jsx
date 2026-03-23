import { useState, useEffect } from 'react';
import problemService from '../../services/problemService';

function Editorial({ problemId, darkMode }) {
    const [videoData, setVideoData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                setLoading(true);
                setError('');
                const data = await problemService.getVideoData(problemId);
                setVideoData(data);
            } catch (err) {
                // Not found or network error
                setError(err?.response?.data?.error || 'No editorial video available for this problem yet.');
            } finally {
                setLoading(false);
            }
        };

        if (problemId) fetchVideo();
    }, [problemId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (error || !videoData) {
        return (
            <div className={`p-6 text-center rounded-xl border ${darkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50 border-slate-200/50'} animate-in fade-in zoom-in duration-300`}>
                <svg className={`w-12 h-12 mx-auto mb-3 ${darkMode ? 'text-slate-600' : 'text-slate-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className={`text-sm font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {error || 'No editorial video available.'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                    Video Solution
                </h2>
            </div>
            
            <div className={`relative w-full rounded-xl overflow-hidden shadow-xl border ${darkMode ? 'border-slate-700 bg-black' : 'border-slate-200 bg-slate-900'} group`} style={{ aspectRatio: '16/9' }}>
                <video 
                    src={videoData.secureUrl} 
                    poster={videoData.thumbnailUrl}
                    controls 
                    controlsList="nodownload"
                    className="w-full h-full object-cover transition-opacity duration-300"
                />
            </div>

            <div className={`flex items-center justify-between px-2 text-xs font-semibold ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    <span>Format: Cloudinary Accelerated MP4</span>
                </div>
                {videoData.duration > 0 && (
                    <span>~ {Math.ceil(videoData.duration)} sec</span>
                )}
            </div>
        </div>
    );
}

export default Editorial;
