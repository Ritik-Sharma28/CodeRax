import { useState, useEffect, useRef } from 'react';
import axiosClient from '../../services/axiosClient';

// ─── Shared Markdown Renderer (lightweight) ──────────────────────────────────
function renderMarkdown(text, darkMode) {
    if (!text) return null;
    const blocks = [];
    const lines = text.split('\n');
    let i = 0;

    while (i < lines.length) {
        if (lines[i].startsWith('```')) {
            const lang = lines[i].slice(3).trim();
            const codeLines = [];
            i++;
            while (i < lines.length && !lines[i].startsWith('```')) {
                codeLines.push(lines[i]);
                i++;
            }
            i++;
            blocks.push({ type: 'code', lang, content: codeLines.join('\n') });
        } else {
            const textLines = [];
            while (i < lines.length && !lines[i].startsWith('```')) {
                textLines.push(lines[i]);
                i++;
            }
            blocks.push({ type: 'text', content: textLines.join('\n') });
        }
    }

    return blocks.map((block, idx) => {
        if (block.type === 'code') {
            return (
                <pre key={idx} className={`my-2 p-3 rounded-lg text-[11px] font-mono overflow-x-auto ${darkMode ? 'bg-slate-900/80 text-slate-300' : 'bg-slate-100 text-slate-800'}`}>
                    {block.content}
                </pre>
            );
        }
        return <TextBlock key={idx} text={block.content} darkMode={darkMode} />;
    });
}

function parseInline(text, darkMode) {
    const parts = [];
    const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_)/g;
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
        const m = match[0];
        if (m.startsWith('`')) {
            parts.push(<code key={match.index} className={`px-1 py-0.5 rounded text-[10px] font-mono font-semibold ${darkMode ? 'bg-slate-700/80 text-emerald-300' : 'bg-emerald-50 text-emerald-700'}`}>{m.slice(1, -1)}</code>);
        } else if (m.startsWith('**')) {
            parts.push(<strong key={match.index} className="font-bold">{m.slice(2, -2)}</strong>);
        } else {
            parts.push(<em key={match.index}>{m.slice(1, -1)}</em>);
        }
        lastIndex = match.index + m.length;
    }
    if (lastIndex < text.length) parts.push(text.slice(lastIndex));
    return parts.length > 0 ? parts : text;
}

function TextBlock({ text, darkMode }) {
    if (!text.trim()) return null;
    const lines = text.split('\n');
    const elements = [];
    lines.forEach((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return;
        if (trimmed.startsWith('### ')) {
            elements.push(<h4 key={idx} className={`text-xs font-bold mt-2 mb-0.5 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{parseInline(trimmed.slice(4), darkMode)}</h4>);
        } else if (trimmed.startsWith('## ')) {
            elements.push(<h3 key={idx} className={`text-sm font-bold mt-2 mb-0.5 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{parseInline(trimmed.slice(3), darkMode)}</h3>);
        } else if (/^[-*]\s/.test(trimmed)) {
            elements.push(<li key={idx} className={`text-xs leading-relaxed ml-3 list-disc ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{parseInline(trimmed.slice(2), darkMode)}</li>);
        } else {
            elements.push(<p key={idx} className={`text-xs leading-relaxed my-0.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{parseInline(trimmed, darkMode)}</p>);
        }
    });
    return <div>{elements}</div>;
}

function TypingDots({ darkMode }) {
    return (
        <div className="flex items-center gap-1 px-2 py-1">
            {[0, 1, 2].map(i => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full animate-bounce ${darkMode ? 'bg-emerald-400' : 'bg-emerald-500'}`} style={{ animationDelay: `${i * 150}ms`, animationDuration: '1s' }} />
            ))}
        </div>
    );
}


// ═══════════════════════════════════════════════════════════════════════════════
// ─── Revision Mentor Widget ──────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export default function RevisionMentor() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'notes'
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

    // Chat state
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Notes state
    const [notes, setNotes] = useState([]);
    const [notesLoading, setNotesLoading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const messagesEndRef = useRef(null);

    // Sync darkMode with localStorage
    useEffect(() => {
        const handler = () => setDarkMode(localStorage.getItem('darkMode') === 'true');
        window.addEventListener('storage', handler);
        return () => window.removeEventListener('storage', handler);
    }, []);

    // Auto scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    // Fetch notes when notes tab is opened
    useEffect(() => {
        if (activeTab === 'notes' && isOpen) fetchNotes();
    }, [activeTab, isOpen]);

    const fetchNotes = async () => {
        setNotesLoading(true);
        try {
            const res = await axiosClient.get('/ai/memories');
            setNotes(res.data.memories || []);
        } catch (err) {
            console.error('Failed to fetch notes:', err);
        } finally {
            setNotesLoading(false);
        }
    };

    const handleDeleteNote = async (id) => {
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

    const handleSend = async () => {
        const query = input.trim();
        if (!query || isLoading) return;

        setInput('');
        setError(null);

        const userMsg = { role: 'user', content: query, timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const res = await axiosClient.post('/ai/revision-chat', {
                query,
                history: messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
            });

            const aiMsg = {
                role: 'assistant',
                content: res.data.reply,
                timestamp: new Date().toISOString(),
                notesUsed: res.data.notesUsed,
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (err) {
            if (err.response?.status === 429) {
                setError("Whoa, slow down! I'm thinking about too many things at once. Give me 10 seconds and ask again.");
            } else {
                setError(err.response?.data?.error || err.response?.data?.message || 'Something went wrong.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!isOpen) {
        // ─── Floating trigger button ─────────────────────────────────
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-300 flex items-center justify-center"
                title="Revision Mentor"
            >
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
            </button>
        );
    }

    // ─── Expanded Panel ──────────────────────────────────────────────
    return (
        <div className={`fixed bottom-6 right-6 z-50 w-[400px] h-[560px] rounded-2xl border shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${darkMode ? 'bg-slate-900 border-slate-700/60 shadow-black/40' : 'bg-white border-slate-200 shadow-slate-300/50'}`}>
            {/* ─── Header ─────────────────────────────────────────── */}
            <div className={`flex-shrink-0 flex items-center justify-between px-4 py-3 border-b ${darkMode ? 'border-slate-700/60' : 'border-slate-200'}`}>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                        </svg>
                    </div>
                    <div>
                        <h3 className={`text-sm font-black ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Revision Mentor</h3>
                        <p className={`text-[10px] font-medium ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                            {isLoading ? 'Thinking...' : 'Your personalized DSA coach'}
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setIsOpen(false)}
                    className={`p-1.5 rounded-lg transition-all ${darkMode ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                </button>
            </div>

            {/* ─── Tab Switcher ────────────────────────────────────── */}
            <div className={`flex border-b ${darkMode ? 'border-slate-700/60' : 'border-slate-200'}`}>
                {[
                    { key: 'chat', label: '💬 Chat', icon: null },
                    { key: 'notes', label: '📝 My Notes', icon: null }
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 py-2 text-xs font-bold text-center transition-all ${
                            activeTab === tab.key
                                ? (darkMode ? 'text-emerald-400 border-b-2 border-emerald-500' : 'text-emerald-600 border-b-2 border-emerald-600')
                                : (darkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600')
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ─── Chat Tab ───────────────────────────────────────── */}
            {activeTab === 'chat' && (
                <>
                    <div className="flex-1 overflow-y-auto">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full px-6">
                                <div className={`w-14 h-14 rounded-2xl mb-4 flex items-center justify-center ${darkMode ? 'bg-emerald-500/15' : 'bg-emerald-50'}`}>
                                    <svg className={`w-7 h-7 ${darkMode ? 'text-emerald-400' : 'text-emerald-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                                    </svg>
                                </div>
                                <h4 className={`text-sm font-bold mb-1 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Hey! Ready to revise?</h4>
                                <p className={`text-[11px] text-center mb-5 max-w-[250px] leading-relaxed ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                    Ask me about any DSA topic. I'll reference your saved learning notes to give personalized advice.
                                </p>
                                <div className="flex flex-wrap gap-1.5 justify-center">
                                    {['What mistakes do I keep making?', 'Review my weak topics', 'Help me revise DP'].map((s, i) => (
                                        <button
                                            key={i}
                                            onClick={() => { setInput(s); }}
                                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border transition-all ${darkMode ? 'border-slate-700/50 text-slate-500 hover:text-emerald-400 hover:border-emerald-500/40' : 'border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-300'}`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3 p-3">
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${
                                            msg.role === 'user'
                                                ? (darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600')
                                                : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
                                        }`}>
                                            {msg.role === 'user' ? 'U' : 'M'}
                                        </div>
                                        <div className={`max-w-[80%] px-3 py-2 rounded-xl ${
                                            msg.role === 'user'
                                                ? (darkMode ? 'bg-emerald-600/80 text-white rounded-tr-sm' : 'bg-emerald-500 text-white rounded-tr-sm')
                                                : (darkMode ? 'bg-slate-800 border border-slate-700/50 rounded-tl-sm' : 'bg-slate-50 border border-slate-200 rounded-tl-sm')
                                        }`}>
                                            {msg.role === 'user' ? (
                                                <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                            ) : (
                                                <div className="min-w-0 overflow-hidden">{renderMarkdown(msg.content, darkMode)}</div>
                                            )}
                                            {msg.notesUsed > 0 && (
                                                <p className={`text-[9px] mt-1 font-medium ${darkMode ? 'text-emerald-400/60' : 'text-emerald-500/60'}`}>
                                                    📌 Based on {msg.notesUsed} saved note{msg.notesUsed > 1 ? 's' : ''}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex gap-2">
                                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-[10px] font-black text-white">M</div>
                                        <div className={`px-3 py-2 rounded-xl rounded-tl-sm ${darkMode ? 'bg-slate-800 border border-slate-700/50' : 'bg-slate-50 border border-slate-200'}`}>
                                            <TypingDots darkMode={darkMode} />
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Error */}
                    {error && (
                        <div className={`mx-3 mb-2 px-3 py-2 rounded-xl flex items-center gap-2 text-[10px] font-semibold ${darkMode ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                            <span className="flex-1">{error}</span>
                            <button onClick={() => setError(null)} className="hover:opacity-70 text-xs">✕</button>
                        </div>
                    )}

                    {/* Input */}
                    <div className={`flex-shrink-0 p-3 border-t ${darkMode ? 'border-slate-700/60' : 'border-slate-200'}`}>
                        <div className={`flex items-end gap-2 p-1.5 rounded-xl border transition-all ${darkMode ? 'bg-slate-800/80 border-slate-700/60 focus-within:border-emerald-500/50' : 'bg-slate-50 border-slate-200 focus-within:border-emerald-400'}`}>
                            <textarea
                                value={input}
                                onChange={(e) => {
                                    setInput(e.target.value);
                                    e.target.style.height = 'auto';
                                    e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px';
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask about your weak areas..."
                                rows={1}
                                disabled={isLoading}
                                className={`flex-1 resize-none bg-transparent border-0 outline-none text-xs px-2 py-1.5 max-h-[80px] ${darkMode ? 'text-slate-200 placeholder:text-slate-600' : 'text-slate-800 placeholder:text-slate-400'}`}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${input.trim() && !isLoading ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/20' : (darkMode ? 'bg-slate-700/50 text-slate-600' : 'bg-slate-200 text-slate-400')}`}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* ─── Notes Tab ──────────────────────────────────────── */}
            {activeTab === 'notes' && (
                <div className="flex-1 overflow-y-auto">
                    {notesLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className={`w-6 h-6 border-2 border-t-emerald-500 rounded-full animate-spin ${darkMode ? 'border-slate-700' : 'border-slate-200'}`} />
                        </div>
                    ) : notes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full px-6">
                            <div className={`w-12 h-12 rounded-xl mb-3 flex items-center justify-center ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                <svg className={`w-6 h-6 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                </svg>
                            </div>
                            <p className={`text-xs text-center font-medium ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                No saved notes yet. Pin helpful AI messages while solving problems!
                            </p>
                        </div>
                    ) : (
                        <div className="p-3 space-y-2">
                            {notes.map(note => (
                                <div key={note._id} className={`p-3 rounded-xl border transition-all ${darkMode ? 'bg-slate-800/60 border-slate-700/50 hover:border-slate-600' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
                                    {/* Problem title */}
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className={`text-[10px] font-bold uppercase tracking-wide ${darkMode ? 'text-emerald-400/70' : 'text-emerald-600/70'}`}>
                                                {note.problemId?.title || note.topic || 'Unknown Topic'}
                                        </span>
                                        <button
                                            onClick={() => handleDeleteNote(note._id)}
                                            disabled={deletingId === note._id}
                                            className={`p-1 rounded transition-all ${deletingId === note._id ? 'opacity-50' : ''} ${darkMode ? 'text-slate-600 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-300 hover:text-red-500 hover:bg-red-50'}`}
                                            title="Delete note"
                                        >
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                    {/* Summary */}
                                    <p className={`text-[11px] leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                        {note.summary}
                                    </p>
                                    {/* Tags */}
                                    {note.tags?.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1.5">
                                            {note.tags.map((tag, i) => (
                                                <span key={i} className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${darkMode ? 'bg-slate-700/60 text-slate-400' : 'bg-slate-200/80 text-slate-500'}`}>
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    {/* Date */}
                                    <p className={`text-[9px] mt-1.5 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                                        {new Date(note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
