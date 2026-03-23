import { useState, useEffect, useRef } from 'react';
import axiosClient from '../services/axiosClient';
import Navbar from '../components/Navbar';

// ─── Shared Markdown Renderer ────────────────────────────────────────────────
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
            while (i < lines.length && !lines[i].startsWith('```')) { codeLines.push(lines[i]); i++; }
            i++;
            blocks.push({ type: 'code', lang, content: codeLines.join('\n') });
        } else {
            const textLines = [];
            while (i < lines.length && !lines[i].startsWith('```')) { textLines.push(lines[i]); i++; }
            blocks.push({ type: 'text', content: textLines.join('\n') });
        }
    }
    return blocks.map((block, idx) => {
        if (block.type === 'code') {
            return (
                <pre key={idx} className={`my-2 p-4 rounded-xl text-[12px] font-mono overflow-x-auto ${darkMode ? 'bg-slate-800/80 text-slate-300 border border-slate-700/50' : 'bg-slate-100 text-slate-800 border border-slate-200'}`}>
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
            parts.push(<code key={match.index} className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold ${darkMode ? 'bg-slate-700/80 text-emerald-300' : 'bg-emerald-50 text-emerald-700'}`}>{m.slice(1, -1)}</code>);
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
    let listBuffer = [];
    let listType = null;
    const flushList = () => {
        if (listBuffer.length === 0) return;
        const Tag = listType === 'ol' ? 'ol' : 'ul';
        elements.push(
            <Tag key={elements.length} className={`ml-4 my-1.5 space-y-0.5 text-sm leading-relaxed ${listType === 'ol' ? 'list-decimal' : 'list-disc'} ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {listBuffer.map((item, i) => <li key={i}>{parseInline(item, darkMode)}</li>)}
            </Tag>
        );
        listBuffer = [];
        listType = null;
    };
    lines.forEach((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) { flushList(); return; }
        if (trimmed.startsWith('### ')) { flushList(); elements.push(<h4 key={idx} className={`text-sm font-bold mt-3 mb-1 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{parseInline(trimmed.slice(4), darkMode)}</h4>); }
        else if (trimmed.startsWith('## ')) { flushList(); elements.push(<h3 key={idx} className={`text-base font-bold mt-3 mb-1 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{parseInline(trimmed.slice(3), darkMode)}</h3>); }
        else if (trimmed.startsWith('# ')) { flushList(); elements.push(<h2 key={idx} className={`text-lg font-black mt-3 mb-1.5 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{parseInline(trimmed.slice(2), darkMode)}</h2>); }
        else if (/^[-*]\s/.test(trimmed)) { if (listType && listType !== 'ul') flushList(); listType = 'ul'; listBuffer.push(trimmed.slice(2)); }
        else if (/^\d+\.\s/.test(trimmed)) { if (listType && listType !== 'ol') flushList(); listType = 'ol'; listBuffer.push(trimmed.replace(/^\d+\.\s/, '')); }
        else { flushList(); elements.push(<p key={idx} className={`text-sm leading-relaxed my-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{parseInline(trimmed, darkMode)}</p>); }
    });
    flushList();
    return <div>{elements}</div>;
}

function TypingDots({ darkMode }) {
    return (
        <div className="flex items-center gap-1.5 px-3 py-2">
            {[0, 1, 2].map(i => (
                <div key={i} className={`w-2 h-2 rounded-full animate-bounce ${darkMode ? 'bg-emerald-400' : 'bg-emerald-500'}`} style={{ animationDelay: `${i * 150}ms`, animationDuration: '1s' }} />
            ))}
        </div>
    );
}


// ═══════════════════════════════════════════════════════════════════════════════
// ─── RevisionMentorPage — Full page layout ───────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export default function RevisionMentorPage() {
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
    const [mobileView, setMobileView] = useState('chat'); // 'chat' | 'notes'

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

    useEffect(() => { localStorage.setItem('darkMode', darkMode); }, [darkMode]);
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading]);
    useEffect(() => { fetchNotes(); }, []);

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
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: res.data.reply,
                timestamp: new Date().toISOString(),
                notesUsed: res.data.notesUsed,
            }]);
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
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    const handleClearChat = () => { setMessages([]); setError(null); };

    return (
        <div className={`h-screen flex flex-col transition-colors duration-300 ${darkMode ? 'bg-slate-950' : 'bg-white'}`}>
            <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

            {/* Mobile View Toggle */}
            <div className={`flex lg:hidden items-center justify-center p-2 border-b ${darkMode ? 'bg-slate-900 border-slate-700/60' : 'bg-slate-50 border-slate-200/60'}`}>
                <div className={`flex p-1 rounded-xl w-full max-w-sm gap-1 ${darkMode ? 'bg-slate-800/80 shadow-inner' : 'bg-slate-200/80 shadow-inner'}`}>
                    <button
                        onClick={() => setMobileView('chat')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${mobileView === 'chat' ? (darkMode ? 'bg-emerald-500 text-white shadow-md' : 'bg-white text-emerald-700 shadow-sm') : (darkMode ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700')}`}
                    >
                        AI Chat
                    </button>
                    <button
                        onClick={() => setMobileView('notes')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${mobileView === 'notes' ? (darkMode ? 'bg-emerald-500 text-white shadow-md' : 'bg-white text-emerald-700 shadow-sm') : (darkMode ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700')}`}
                    >
                        Saved Notes
                        <span className={`px-1.5 py-0.5 rounded-md text-[9px] ${mobileView === 'notes' ? (darkMode ? 'bg-black/20' : 'bg-emerald-100') : (darkMode ? 'bg-slate-700' : 'bg-slate-300')}`}>
                            {notes.length}
                        </span>
                    </button>
                </div>
            </div>

            {/* Main Content — Two Panes */}
            <div className="flex-1 flex min-h-0">

                {/* ═══ LEFT: Chat Pane (60%) ═══ */}
                <div className={`w-full lg:w-[60%] border-r ${darkMode ? 'border-slate-700/60' : 'border-slate-200/60'} ${mobileView === 'chat' ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'}`}>
                    {/* Chat Header */}
                    <div className={`flex-shrink-0 flex items-center justify-between px-6 py-4 border-b ${darkMode ? 'bg-slate-900/80 border-slate-700/60' : 'bg-slate-50/80 border-slate-200/60'}`}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                                </svg>
                            </div>
                            <div>
                                <h2 className={`text-lg font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>Revision Mentor</h2>
                                <p className={`text-xs font-medium ${isLoading ? (darkMode ? 'text-emerald-400' : 'text-emerald-500') : (darkMode ? 'text-slate-500' : 'text-slate-400')}`}>
                                    {isLoading ? 'Thinking...' : 'Your personalized DSA coach'}
                                </p>
                            </div>
                        </div>
                        {messages.length > 0 && (
                            <button onClick={handleClearChat} title="Clear chat" className={`p-2 rounded-lg transition-all ${darkMode ? 'text-slate-600 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full px-8">
                                <div className={`w-20 h-20 rounded-3xl mb-6 flex items-center justify-center ${darkMode ? 'bg-gradient-to-br from-emerald-500/15 to-teal-500/15' : 'bg-gradient-to-br from-emerald-50 to-teal-50'}`}>
                                    <svg className={`w-10 h-10 ${darkMode ? 'text-emerald-400' : 'text-emerald-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                                    </svg>
                                </div>
                                <h3 className={`text-xl font-black mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Hey! Ready to revise?</h3>
                                <p className={`text-sm text-center mb-8 max-w-md leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Ask me about any DSA topic. I'll reference your saved learning notes to give personalized advice based on your past mistakes and breakthroughs.
                                </p>
                                <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                                    {['What mistakes do I keep making?', 'Review my weak topics', 'Help me revise dynamic programming', 'What should I focus on next?'].map((s, i) => (
                                        <button key={i} onClick={() => setInput(s)} className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${darkMode ? 'border-slate-700/50 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/40 hover:bg-slate-800/50' : 'border-slate-200 text-slate-500 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50/50'}`}>
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-5 p-6">
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black ${
                                            msg.role === 'user'
                                                ? (darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600')
                                                : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
                                        }`}>
                                            {msg.role === 'user' ? (
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347" /></svg>
                                            )}
                                        </div>
                                        <div className={`max-w-[80%] min-w-0`}>
                                            <div className={`px-5 py-4 rounded-2xl ${
                                                msg.role === 'user'
                                                    ? (darkMode ? 'bg-emerald-600 text-white rounded-tr-sm' : 'bg-emerald-500 text-white rounded-tr-sm')
                                                    : (darkMode ? 'bg-slate-800 border border-slate-700/60 rounded-tl-sm' : 'bg-white border border-slate-200 shadow-sm rounded-tl-sm')
                                            }`}>
                                                {msg.role === 'user' ? (
                                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                                ) : (
                                                    <div className="min-w-0 overflow-hidden">{renderMarkdown(msg.content, darkMode)}</div>
                                                )}
                                            </div>
                                            <div className={`flex items-center gap-2 mt-1 px-1 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                                {msg.notesUsed > 0 && (
                                                    <span className={`text-[10px] font-medium ${darkMode ? 'text-emerald-400/60' : 'text-emerald-500/60'}`}>
                                                        📌 Based on {msg.notesUsed} saved note{msg.notesUsed > 1 ? 's' : ''}
                                                    </span>
                                                )}
                                                {msg.timestamp && (
                                                    <span className={`text-[10px] ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904" /></svg>
                                        </div>
                                        <div className={`px-5 py-3 rounded-2xl rounded-tl-sm ${darkMode ? 'bg-slate-800 border border-slate-700/60' : 'bg-white border border-slate-200'}`}>
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
                        <div className={`mx-6 mb-3 px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-semibold ${darkMode ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span className="flex-1">{error}</span>
                            <button onClick={() => setError(null)} className="hover:opacity-70">✕</button>
                        </div>
                    )}

                    {/* Input */}
                    <div className={`flex-shrink-0 p-4 border-t ${darkMode ? 'bg-slate-900/80 border-slate-700/60' : 'bg-slate-50/80 border-slate-200/60'}`}>
                        <div className={`flex items-end gap-3 p-2 rounded-2xl border transition-all ${darkMode ? 'bg-slate-800/80 border-slate-700/60 focus-within:border-emerald-500/50 focus-within:bg-slate-800' : 'bg-white border-slate-200 focus-within:border-emerald-400 focus-within:shadow-sm'}`}>
                            <textarea
                                value={input}
                                onChange={(e) => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask about your weak areas, revision topics..."
                                rows={1}
                                disabled={isLoading}
                                className={`flex-1 resize-none bg-transparent border-0 outline-none text-sm px-3 py-2 max-h-[120px] ${darkMode ? 'text-slate-200 placeholder:text-slate-600' : 'text-slate-800 placeholder:text-slate-400'}`}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${input.trim() && !isLoading ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/25' : (darkMode ? 'bg-slate-700/50 text-slate-600' : 'bg-slate-200 text-slate-400')}`}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" />
                                </svg>
                            </button>
                        </div>
                        <p className={`text-[9px] text-center mt-2 font-medium ${darkMode ? 'text-slate-700' : 'text-slate-300'}`}>AI can make mistakes. Verify important information.</p>
                    </div>
                </div>

                {/* ═══ RIGHT: Saved Notes Pane (40%) ═══ */}
                <div className={`w-full lg:w-[40%] ${darkMode ? 'bg-slate-900/50' : 'bg-slate-50/50'} ${mobileView === 'notes' ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'}`}>
                    {/* Notes Header */}
                    <div className={`flex-shrink-0 flex items-center justify-between px-6 py-4 border-b ${darkMode ? 'border-slate-700/60' : 'border-slate-200/60'}`}>
                        <div className="flex items-center gap-2">
                            <svg className={`w-5 h-5 ${darkMode ? 'text-amber-400' : 'text-amber-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                            </svg>
                            <h3 className={`text-base font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>My Saved Notes</h3>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-500'}`}>{notes.length}</span>
                        </div>
                        <button onClick={fetchNotes} title="Refresh" className={`p-1.5 rounded-lg transition-all ${darkMode ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" /></svg>
                        </button>
                    </div>

                    {/* Notes List */}
                    <div className="flex-1 overflow-y-auto">
                        {notesLoading ? (
                            <div className="flex items-center justify-center h-32">
                                <div className={`w-7 h-7 border-2 border-t-emerald-500 rounded-full animate-spin ${darkMode ? 'border-slate-700' : 'border-slate-200'}`} />
                            </div>
                        ) : notes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full px-8">
                                <div className={`w-16 h-16 rounded-2xl mb-4 flex items-center justify-center ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                    <svg className={`w-8 h-8 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                    </svg>
                                </div>
                                <p className={`text-sm text-center font-medium ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>No saved notes yet</p>
                                <p className={`text-xs text-center mt-1 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>Pin helpful AI messages while solving problems!</p>
                            </div>
                        ) : (
                            <div className="p-4 space-y-3">
                                {notes.map(note => (
                                    <div key={note._id} className={`p-4 rounded-xl border transition-all hover:shadow-sm ${darkMode ? 'bg-slate-800/60 border-slate-700/50 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md ${darkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                                                {note.problemId?.title || 'Unknown Problem'}
                                            </span>
                                            <button onClick={() => handleDeleteNote(note._id)} disabled={deletingId === note._id} className={`p-1 rounded transition-all flex-shrink-0 ${deletingId === note._id ? 'opacity-50' : ''} ${darkMode ? 'text-slate-600 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-300 hover:text-red-500 hover:bg-red-50'}`}>
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                        <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{note.summary}</p>
                                        {note.tags?.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                {note.tags.map((tag, i) => (
                                                    <span key={i} className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${darkMode ? 'bg-slate-700/60 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>{tag}</span>
                                                ))}
                                            </div>
                                        )}
                                        <p className={`text-[10px] mt-2 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                                            {new Date(note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
