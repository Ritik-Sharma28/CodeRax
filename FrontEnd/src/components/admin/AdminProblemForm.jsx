import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import problemService from '../../services/problemService';

const TABS = [
    { key: 'details', label: 'Details', icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z' },
    { key: 'signature', label: 'Signature', icon: 'M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l5.653-4.655m3.172 3.172l5.653-4.655a2.548 2.548 0 00-3.586-3.586l-4.655 5.653m3.172 3.172L11.42 15.17' },
    { key: 'testcases', label: 'Test Cases', icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z' },
    { key: 'code', label: 'Code', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
    { key: 'video', label: 'Video', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
];

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

function AdminProblemForm({ formData, setFormData, isEditMode, onSubmit, onDelete, loading, error, success, darkMode }) {
    const [activeTab, setActiveTab] = useState('details');
    const [videoFile, setVideoFile] = useState(null);
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [videoError, setVideoError] = useState('');
    const [videoSuccess, setVideoSuccess] = useState('');

    const data = formData || EMPTY_FORM;

    const updateField = (field, value) => {
        setFormData({ ...data, [field]: value });
    };

    // --- Helpers for dynamic arrays ---
    const addItem = (field, template) => {
        updateField(field, [...(data[field] || []), template]);
    };
    const removeItem = (field, index) => {
        updateField(field, data[field].filter((_, i) => i !== index));
    };
    const updateItem = (field, index, key, value) => {
        const arr = [...data[field]];
        arr[index] = { ...arr[index], [key]: value };
        updateField(field, arr);
    };

    // --- Signature helpers ---
    const updateSig = (key, value) => {
        updateField('problemSignature', { ...data.problemSignature, [key]: value });
    };
    const addArg = () => {
        const sig = { ...data.problemSignature };
        sig.args = [...(sig.args || []), { name: '', type: 'int' }];
        updateField('problemSignature', sig);
    };
    const removeArg = (i) => {
        const sig = { ...data.problemSignature };
        sig.args = sig.args.filter((_, idx) => idx !== i);
        updateField('problemSignature', sig);
    };
    const updateArg = (i, key, value) => {
        const sig = { ...data.problemSignature };
        sig.args = [...sig.args];
        sig.args[i] = { ...sig.args[i], [key]: value };
        updateField('problemSignature', sig);
    };

    // Shared input styling
    const inputClass = `w-full px-3 py-2 rounded-lg text-sm outline-none border transition-colors
        ${darkMode
            ? 'bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-600 focus:border-indigo-500/50'
            : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-indigo-400'}`;

    const labelClass = `block text-xs font-bold uppercase tracking-wider mb-1.5
        ${darkMode ? 'text-slate-400' : 'text-slate-500'}`;

    const cardClass = `rounded-xl border p-4 mb-3
        ${darkMode ? 'bg-slate-800/40 border-slate-700/60' : 'bg-white border-slate-200/80'}`;

    return (
        <div className="flex flex-col h-full">
            {/* Tab Navigation */}
            <div className={`flex items-center gap-1 px-2 sm:px-3 py-2 border-b overflow-x-auto scrollbar-none
                ${darkMode ? 'bg-slate-900/60 border-slate-700/60' : 'bg-slate-50/60 border-slate-200/60'}`}>
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-semibold whitespace-nowrap transition-all duration-200
                            ${activeTab === tab.key
                                ? (darkMode ? 'bg-indigo-500/15 text-indigo-400 shadow-sm' : 'bg-indigo-50 text-indigo-700 shadow-sm')
                                : (darkMode ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/80' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100')
                            }`}
                    >
                        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                        </svg>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-5">
                {/* ===== DETAILS TAB ===== */}
                {activeTab === 'details' && (
                    <div className="space-y-4 max-w-2xl">
                        <div>
                            <label className={labelClass}>Title</label>
                            <input type="text" value={data.title} onChange={(e) => updateField('title', e.target.value)}
                                placeholder="e.g. Two Sum" className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Description</label>
                            <textarea value={data.description} onChange={(e) => updateField('description', e.target.value)}
                                placeholder="Problem description..." rows={6}
                                className={`${inputClass} resize-none`} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Difficulty</label>
                                <select value={data.difficulty} onChange={(e) => updateField('difficulty', e.target.value)}
                                    className={inputClass}>
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Tags</label>
                                <select value={data.tags} onChange={(e) => updateField('tags', e.target.value)}
                                    className={inputClass}>
                                    <option value="array">Array</option>
                                    <option value="linkedList">Linked List</option>
                                    <option value="graph">Graph</option>
                                    <option value="dp">DP</option>
                                </select>
                            </div>
                        </div>

                        {/* Meta info */}
                        {isEditMode && data.problemCreator && (
                            <div className={`rounded-xl border p-4 ${darkMode ? 'bg-slate-800/30 border-slate-700/40' : 'bg-slate-50 border-slate-200/60'}`}>
                                <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                    Problem Info
                                </div>
                                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                    <div>
                                        <span className="font-semibold">Creator: </span>
                                        {data.problemCreator.firstName || data.problemCreator.emailId || '—'}
                                    </div>
                                    {data.createdAt && (
                                        <div>
                                            <span className="font-semibold">Created: </span>
                                            {new Date(data.createdAt).toLocaleString('en-IN')}
                                        </div>
                                    )}
                                    {data.updatedAt && (
                                        <div>
                                            <span className="font-semibold">Updated: </span>
                                            {new Date(data.updatedAt).toLocaleString('en-IN')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ===== SIGNATURE TAB ===== */}
                {activeTab === 'signature' && (
                    <div className="space-y-4 max-w-2xl">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Function Name</label>
                                <input type="text" value={data.problemSignature?.functionName || ''}
                                    onChange={(e) => updateSig('functionName', e.target.value)}
                                    placeholder="e.g. twoSum" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Return Type</label>
                                <input type="text" value={data.problemSignature?.returnType || ''}
                                    onChange={(e) => updateSig('returnType', e.target.value)}
                                    placeholder="e.g. int, vector<int>" className={inputClass} />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className={labelClass}>Arguments</label>
                                <button onClick={addArg}
                                    className="text-[10px] font-bold text-indigo-500 hover:text-indigo-400 transition-colors">
                                    + Add Arg
                                </button>
                            </div>
                            {(data.problemSignature?.args || []).map((arg, i) => (
                                <div key={i} className={`${cardClass} flex items-center gap-2`}>
                                    <input type="text" value={arg.name}
                                        onChange={(e) => updateArg(i, 'name', e.target.value)}
                                        placeholder="Arg name" className={`${inputClass} flex-1`} />
                                    <input type="text" value={arg.type}
                                        onChange={(e) => updateArg(i, 'type', e.target.value)}
                                        placeholder="Type" className={`${inputClass} flex-1`} />
                                    {(data.problemSignature.args.length > 1) && (
                                        <button onClick={() => removeArg(i)}
                                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ===== TEST CASES TAB ===== */}
                {activeTab === 'testcases' && (
                    <div className="space-y-6">
                        {/* Visible Test Cases */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className={labelClass}>Visible Test Cases</label>
                                <button onClick={() => addItem('visibleTestCases', { input: '', output: '', explanation: '' })}
                                    className="text-[10px] font-bold text-indigo-500 hover:text-indigo-400 transition-colors">
                                    + Add Visible
                                </button>
                            </div>
                            {(data.visibleTestCases || []).map((tc, i) => (
                                <div key={i} className={cardClass}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`text-[10px] font-bold uppercase ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                            Visible #{i + 1}
                                        </span>
                                        {data.visibleTestCases.length > 1 && (
                                            <button onClick={() => removeItem('visibleTestCases', i)}
                                                className="text-red-400 hover:text-red-300 text-xs font-bold">Remove</button>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <textarea value={tc.input} onChange={(e) => updateItem('visibleTestCases', i, 'input', e.target.value)}
                                            placeholder="Input" rows={2} className={`${inputClass} resize-none`} />
                                        <textarea value={tc.output} onChange={(e) => updateItem('visibleTestCases', i, 'output', e.target.value)}
                                            placeholder="Expected Output" rows={2} className={`${inputClass} resize-none`} />
                                        <input type="text" value={tc.explanation || ''}
                                            onChange={(e) => updateItem('visibleTestCases', i, 'explanation', e.target.value)}
                                            placeholder="Explanation" className={inputClass} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Hidden Test Cases */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className={labelClass}>Hidden Test Cases</label>
                                <button onClick={() => addItem('hiddenTestCases', { input: '', output: '' })}
                                    className="text-[10px] font-bold text-indigo-500 hover:text-indigo-400 transition-colors">
                                    + Add Hidden
                                </button>
                            </div>
                            {(data.hiddenTestCases || []).map((tc, i) => (
                                <div key={i} className={cardClass}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`text-[10px] font-bold uppercase ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                            Hidden #{i + 1}
                                        </span>
                                        {data.hiddenTestCases.length > 1 && (
                                            <button onClick={() => removeItem('hiddenTestCases', i)}
                                                className="text-red-400 hover:text-red-300 text-xs font-bold">Remove</button>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <textarea value={tc.input} onChange={(e) => updateItem('hiddenTestCases', i, 'input', e.target.value)}
                                            placeholder="Input" rows={2} className={`${inputClass} resize-none`} />
                                        <textarea value={tc.output} onChange={(e) => updateItem('hiddenTestCases', i, 'output', e.target.value)}
                                            placeholder="Expected Output" rows={2} className={`${inputClass} resize-none`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ===== CODE TAB ===== */}
                {activeTab === 'code' && (
                    <div className="space-y-6">
                        {/* Start Code */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className={labelClass}>Start Code (Initial Code shown to user)</label>
                                <button onClick={() => addItem('startCode', { language: 'cpp', initialCode: '' })}
                                    className="text-[10px] font-bold text-indigo-500 hover:text-indigo-400 transition-colors">
                                    + Add Language
                                </button>
                            </div>
                            {(data.startCode || []).map((sc, i) => (
                                <div key={i} className={cardClass}>
                                    <div className="flex items-center justify-between mb-2">
                                        <input type="text" value={sc.language}
                                            onChange={(e) => updateItem('startCode', i, 'language', e.target.value)}
                                            placeholder="Language (cpp, java, javascript)"
                                            className={`${inputClass} max-w-[200px]`} />
                                        {data.startCode.length > 1 && (
                                            <button onClick={() => removeItem('startCode', i)}
                                                className="text-red-400 hover:text-red-300 text-xs font-bold">Remove</button>
                                        )}
                                    </div>
                                    <div className={`rounded-lg overflow-hidden border ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                                        <Editor
                                            height="200px"
                                            language={sc.language === 'cpp' ? 'cpp' : sc.language}
                                            value={sc.initialCode}
                                            onChange={(v) => updateItem('startCode', i, 'initialCode', v || '')}
                                            theme={darkMode ? 'vs-dark' : 'light'}
                                            options={{ fontSize: 12, minimap: { enabled: false }, scrollBeyondLastLine: false, automaticLayout: true, lineNumbers: 'on', padding: { top: 8 } }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Reference Solutions */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className={labelClass}>Reference Solution (Complete working code)</label>
                                <button onClick={() => addItem('referenceSolution', { language: 'cpp', completeCode: '' })}
                                    className="text-[10px] font-bold text-indigo-500 hover:text-indigo-400 transition-colors">
                                    + Add Language
                                </button>
                            </div>
                            {(data.referenceSolution || []).map((rs, i) => (
                                <div key={i} className={cardClass}>
                                    <div className="flex items-center justify-between mb-2">
                                        <input type="text" value={rs.language}
                                            onChange={(e) => updateItem('referenceSolution', i, 'language', e.target.value)}
                                            placeholder="Language (cpp, java, javascript)"
                                            className={`${inputClass} max-w-[200px]`} />
                                        {data.referenceSolution.length > 1 && (
                                            <button onClick={() => removeItem('referenceSolution', i)}
                                                className="text-red-400 hover:text-red-300 text-xs font-bold">Remove</button>
                                        )}
                                    </div>
                                    <div className={`rounded-lg overflow-hidden border ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                                        <Editor
                                            height="250px"
                                            language={rs.language === 'cpp' ? 'cpp' : rs.language}
                                            value={rs.completeCode}
                                            onChange={(v) => updateItem('referenceSolution', i, 'completeCode', v || '')}
                                            theme={darkMode ? 'vs-dark' : 'light'}
                                            options={{ fontSize: 12, minimap: { enabled: false }, scrollBeyondLastLine: false, automaticLayout: true, lineNumbers: 'on', padding: { top: 8 } }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {/* ===== VIDEO TAB ===== */}
                {activeTab === 'video' && (
                    <div className="space-y-6 max-w-2xl">
                        {!isEditMode || !data._id ? (
                            <div className="p-6 text-center border-dashed border-2 rounded-xl border-slate-300 dark:border-slate-700">
                                <p className={`text-sm font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                    You must create and save the problem first before uploading a solution video.
                                </p>
                            </div>
                        ) : (
                            <div className={cardClass}>
                                <div className="mb-4">
                                    <label className={labelClass}>Upload Solution Video</label>
                                    <p className={`text-xs mb-3 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                        Select an MP4 video explaining the solution. We will automatically generate thumbnails and multiple resolutions.
                                    </p>
                                    <input 
                                        type="file" 
                                        accept="video/*"
                                        onChange={(e) => setVideoFile(e.target.files[0])}
                                        className={`block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold 
                                            ${darkMode 
                                                ? 'text-slate-300 file:bg-indigo-500/20 file:text-indigo-400 hover:file:bg-indigo-500/30' 
                                                : 'text-slate-600 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100'}`}
                                    />
                                </div>
                                
                                {videoError && <p className="text-xs text-red-500 mb-2">{videoError}</p>}
                                {videoSuccess && <p className="text-xs text-emerald-500 mb-2">{videoSuccess}</p>}

                                <div className="flex gap-3">
                                    <button 
                                        disabled={!videoFile || uploadingVideo}
                                        onClick={async () => {
                                            if(!videoFile) return;
                                            try {
                                                setUploadingVideo(true);
                                                setVideoError('');
                                                setVideoSuccess('');

                                                // 1. Get auth signature
                                                const sigData = await problemService.generateUploadSignature(data._id);
                                                
                                                // 2. Upload directly to Cloudinary
                                                const formData = new FormData();
                                                formData.append('file', videoFile);
                                                formData.append('api_key', sigData.api_key);
                                                formData.append('timestamp', sigData.timestamp);
                                                formData.append('signature', sigData.signature);
                                                formData.append('public_id', sigData.public_id);
                                                if (sigData.eager) formData.append('eager', sigData.eager);
                                                if (sigData.eager_async) formData.append('eager_async', sigData.eager_async);

                                                const uploadRes = await fetch(sigData.upload_url, {
                                                    method: 'POST',
                                                    body: formData
                                                });
                                                
                                                const cloudinaryResult = await uploadRes.json();
                                                if(cloudinaryResult.error) throw new Error(cloudinaryResult.error.message);

                                                // 3. Local fallback is optional and can be disabled in deployed environments.
                                                try {
                                                    await problemService.saveVideoLocalFallback({
                                                        problemId: data._id,
                                                        secureUrl: cloudinaryResult.secure_url,
                                                        duration: cloudinaryResult.duration,
                                                        publicId: cloudinaryResult.public_id,
                                                    });
                                                    setVideoSuccess('Video uploaded and saved successfully!');
                                                } catch (fallbackError) {
                                                    setVideoSuccess('Video uploaded successfully. Metadata will sync through the backend workflow.');
                                                }
                                                setVideoFile(null);
                                            } catch(err) {
                                                setVideoError(err.message || 'Error uploading video');
                                            } finally {
                                                setUploadingVideo(false);
                                            }
                                        }}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200
                                            ${uploadingVideo || !videoFile
                                                ? 'bg-slate-500/50 cursor-not-allowed text-white/70'
                                                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                                            }`}
                                    >
                                        {uploadingVideo ? 'Uploading...' : 'Upload Video'}
                                    </button>

                                    <button
                                        disabled={uploadingVideo}
                                        onClick={async () => {
                                            if(!window.confirm("Delete existing solution video?")) return;
                                            try {
                                                setUploadingVideo(true);
                                                await problemService.deleteVideo(data._id);
                                                setVideoSuccess("Video deleted from server");
                                                setVideoError('');
                                            } catch(err) {
                                                setVideoError(err.message || "Error deleting video");
                                            } finally {
                                                setUploadingVideo(false);
                                            }
                                        }}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors
                                            ${darkMode 
                                                ? 'bg-slate-800 text-red-500 hover:bg-slate-700' 
                                                : 'bg-slate-100 text-red-600 hover:bg-slate-200'}`}
                                    >
                                        Delete Current Video
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Action Bar */}
            <div className={`flex items-center justify-between px-3 sm:px-5 py-3 border-t
                ${darkMode ? 'bg-slate-800/80 border-slate-700/60' : 'bg-slate-50/80 border-slate-200/60'}`}>
                <div className="flex items-center gap-2">
                    {error && (
                        <span className="text-xs font-semibold text-red-500 max-w-[200px] sm:max-w-none truncate">{error}</span>
                    )}
                    {success && (
                        <span className="text-xs font-semibold text-emerald-500">{success}</span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {isEditMode && (
                        <button
                            onClick={onDelete}
                            disabled={loading}
                            className={`px-3 sm:px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold border transition-colors
                                ${darkMode
                                    ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                                    : 'border-red-200 text-red-600 hover:bg-red-50'
                                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Delete
                        </button>
                    )}
                    <button
                        onClick={onSubmit}
                        disabled={loading}
                        className={`px-4 sm:px-6 py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all duration-200
                            ${loading
                                ? 'bg-indigo-500/50 text-indigo-300 cursor-not-allowed'
                                : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/25'
                            }`}
                    >
                        {loading ? (
                            <span className="flex items-center gap-1.5">
                                <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                {isEditMode ? 'Updating...' : 'Creating...'}
                            </span>
                        ) : (
                            isEditMode ? 'Update Problem' : 'Create Problem'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AdminProblemForm;
