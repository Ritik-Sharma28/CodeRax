import { useState, useEffect, useRef, useCallback } from 'react';
import axiosClient from '../../services/axiosClient';

// ─── Markdown-lite renderer (no external deps) ───────────────────────────────
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
            return <CodeBlock key={idx} code={block.content} lang={block.lang} darkMode={darkMode} />;
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
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }
        const m = match[0];
        if (m.startsWith('`')) {
            parts.push(
                <code key={match.index} className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold ${darkMode ? 'bg-slate-700/80 text-indigo-300' : 'bg-indigo-50 text-indigo-700'}`}>
                    {m.slice(1, -1)}
                </code>
            );
        } else if (m.startsWith('**')) {
            parts.push(<strong key={match.index} className="font-bold">{m.slice(2, -2)}</strong>);
        } else if (m.startsWith('*') || m.startsWith('_')) {
            parts.push(<em key={match.index}>{m.slice(1, -1)}</em>);
        }
        lastIndex = match.index + m.length;
    }

    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

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
                {listBuffer.map((item, i) => (
                    <li key={i}>{parseInline(item, darkMode)}</li>
                ))}
            </Tag>
        );
        listBuffer = [];
        listType = null;
    };

    lines.forEach((line, idx) => {
        const trimmed = line.trim();

        if (trimmed.startsWith('### ')) {
            flushList();
            elements.push(<h4 key={idx} className={`text-sm font-bold mt-3 mb-1 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{parseInline(trimmed.slice(4), darkMode)}</h4>);
        } else if (trimmed.startsWith('## ')) {
            flushList();
            elements.push(<h3 key={idx} className={`text-base font-bold mt-3 mb-1 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{parseInline(trimmed.slice(3), darkMode)}</h3>);
        } else if (trimmed.startsWith('# ')) {
            flushList();
            elements.push(<h2 key={idx} className={`text-lg font-black mt-3 mb-1.5 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{parseInline(trimmed.slice(2), darkMode)}</h2>);
        } else if (/^[-*]\s/.test(trimmed)) {
            if (listType && listType !== 'ul') flushList();
            listType = 'ul';
            listBuffer.push(trimmed.slice(2));
        } else if (/^\d+\.\s/.test(trimmed)) {
            if (listType && listType !== 'ol') flushList();
            listType = 'ol';
            listBuffer.push(trimmed.replace(/^\d+\.\s/, ''));
        } else if (!trimmed) {
            flushList();
        } else {
            flushList();
            elements.push(<p key={idx} className={`text-sm leading-relaxed my-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{parseInline(trimmed, darkMode)}</p>);
        }
    });

    flushList();
    return <div>{elements}</div>;
}

function CodeBlock({ code, lang, darkMode }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
       // await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={`my-3 rounded-xl overflow-hidden border ${darkMode ? 'border-slate-700/60' : 'border-slate-200'}`}>
            <div className={`flex items-center justify-between px-4 py-2 ${darkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{lang || 'code'}</span>
                <button onClick={handleCopy} className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold transition-all ${copied ? (darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600') : (darkMode ? 'hover:bg-slate-800 text-slate-500 hover:text-slate-300' : 'hover:bg-slate-200 text-slate-400 hover:text-slate-600')}`}>
                    {copied ? (
                        <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Copied</>
                    ) : (
                        <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy</>
                    )}
                </button>
            </div>
            <pre className={`p-4 text-[12px] font-mono leading-relaxed overflow-x-auto ${darkMode ? 'bg-[#0d1117] text-slate-300' : 'bg-white text-slate-800'}`}>{code}</pre>
        </div>
    );
}

function TypingIndicator({ darkMode }) {
    return (
        <div className="flex items-center gap-1.5 px-3 py-2">
            {[0, 1, 2].map((i) => (
                <div key={i} className={`w-2 h-2 rounded-full animate-bounce ${darkMode ? 'bg-indigo-400' : 'bg-indigo-500'}`} style={{ animationDelay: `${i * 150}ms`, animationDuration: '1s' }} />
            ))}
        </div>
    );
}

function SuggestionChips({ suggestions, onSelect, darkMode }) {
    return (
        <div className="flex flex-wrap gap-2 mt-2">
            {suggestions.map((s, i) => (
                <button key={i} onClick={() => onSelect(s)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${darkMode ? 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-indigo-500/50 hover:text-indigo-400 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:shadow-sm'}`}>
                    {s}
                </button>
            ))}
        </div>
    );
}

// ─── Pin Button on Assistant Messages ─────────────────────────────────────────
function PinButton({ isPinned, onToggle, darkMode }) {
    return (
        <button
            onClick={onToggle}
            title={isPinned ? 'Unpin message' : 'Pin for revision'}
            className={`p-1 rounded-md transition-all duration-200 ${
                isPinned
                    ? (darkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-50 text-amber-600')
                    : (darkMode ? 'text-slate-600 hover:text-amber-400 hover:bg-slate-700/50' : 'text-slate-300 hover:text-amber-500 hover:bg-amber-50')
            }`}
        >
            <svg className="w-3.5 h-3.5" fill={isPinned ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
        </button>
    );
}

// ─── Save Memory Modal ────────────────────────────────────────────────────────
function SaveMemoryModal({ pinnedCount, onSave, onCancel, darkMode, saving }) {
    const [userNote, setUserNote] = useState('');
    const [tagsInput, setTagsInput] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
        onSave(userNote, tags);
    };

    return (
        <div className={`mx-4 mb-3 p-4 rounded-2xl border ${darkMode ? 'bg-slate-800/90 border-slate-700/60' : 'bg-white/95 border-slate-200 shadow-lg'}`}>
            <div className="flex items-center gap-2 mb-3">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${darkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                    </svg>
                </div>
                <div>
                    <h4 className={`text-sm font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Save to Revision Notes</h4>
                    <p className={`text-[10px] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{pinnedCount} message{pinnedCount > 1 ? 's' : ''} pinned</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2.5">
                <div>
                    <input
                        type="text"
                        value={userNote}
                        onChange={(e) => setUserNote(e.target.value)}
                        placeholder='e.g. "Forgot the base case for recursion"'
                        className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition-all ${darkMode ? 'bg-slate-900/80 border-slate-700/60 text-slate-200 placeholder:text-slate-600 focus:border-amber-500/50' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-amber-400'}`}
                    />
                </div>
                <div>
                    <input
                        type="text"
                        value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                        placeholder="Tags (comma separated): dp, recursion, trees"
                        className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition-all ${darkMode ? 'bg-slate-900/80 border-slate-700/60 text-slate-200 placeholder:text-slate-600 focus:border-amber-500/50' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-amber-400'}`}
                    />
                </div>
                <div className="flex gap-2 pt-1">
                    <button
                        type="submit"
                        disabled={saving}
                        className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold transition-all ${saving ? 'opacity-50 cursor-not-allowed' : ''} ${darkMode ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' : 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm'}`}
                    >
                        {saving ? 'Saving...' : '📌 Save Note'}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${darkMode ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-700/50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

function ChatMessage({ message, darkMode, isPinned, onTogglePin, showPin }) {
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';

    if (isSystem) return null;

    return (
        <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} group`}>
            <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${isUser ? (darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600') : (darkMode ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white' : 'bg-gradient-to-br from-violet-500 to-indigo-500 text-white')}`}>
                {isUser ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-1.756-1.089a2.25 2.25 0 00-1.386-.361H8.142a2.25 2.25 0 00-1.386.361L5 14.5m14 0V17a2 2 0 01-2 2H7a2 2 0 01-2-2v-2.5" /></svg>
                )}
            </div>

            <div className={`max-w-[85%] min-w-0 ${isUser ? 'items-end' : 'items-start'}`}>
                <div className="relative">
                    <div className={`px-4 py-3 rounded-2xl ${isUser ? (darkMode ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-indigo-500 text-white rounded-tr-sm') : (darkMode ? 'bg-slate-800 border border-slate-700/60 rounded-tl-sm' : 'bg-white border border-slate-200 shadow-sm rounded-tl-sm')}`}>
                        {isUser ? (
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        ) : (
                            <div className="min-w-0 overflow-hidden">{renderMarkdown(message.content, darkMode)}</div>
                        )}
                    </div>
                    {/* Pin button — only on assistant messages */}
                    {showPin && !isUser && (
                        <div className={`absolute -top-1 -right-1 transition-opacity duration-200 ${isPinned ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                            <PinButton isPinned={isPinned} onToggle={onTogglePin} darkMode={darkMode} />
                        </div>
                    )}
                </div>
                {message.timestamp && (
                    <span className={`text-[10px] mt-1 px-1 block ${isUser ? 'text-right' : 'text-left'} ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                )}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Main ChatAI Component ───────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function ChatAI({ problemId, code, darkMode }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [contextAttached, setContextAttached] = useState(true);

    // Pin / Save state
    const [pinnedIndices, setPinnedIndices] = useState(new Set());
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [savingMemory, setSavingMemory] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(null);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const abortControllerRef = useRef(null);

    // Auto scroll on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    // Toggle pin on a message (max 5)
    const togglePin = (idx) => {
        setPinnedIndices(prev => {
            const next = new Set(prev);
            if (next.has(idx)) {
                next.delete(idx);
            } else {
                if (next.size >= 5) return prev; // max 5
                next.add(idx);
            }
            return next;
        });
    };

    // Save pinned messages as a revision memory
    const handleSaveMemory = async (userNote, tags) => {
        setSavingMemory(true);
        setSaveSuccess(null);

        const selectedMessages = [...pinnedIndices]
            .sort((a, b) => a - b)
            .map(idx => ({
                role: messages[idx].role,
                content: messages[idx].content,
            }));

        try {
            await axiosClient.post('/ai/memory', {
                selectedMessages,
                userNote,
                problemId,
                tags,
            });

            setSaveSuccess('✅ Saved to revision notes!');
            setPinnedIndices(new Set());
            setShowSaveModal(false);
            setTimeout(() => setSaveSuccess(null), 3000);
        } catch (err) {
            if (err.response?.status === 429) {
                setError("Whoa, slow down! I'm thinking about too many things at once. Give me 10 seconds and ask again.");
            } else {
                setError(err.response?.data?.error || 'Failed to save memory.');
            }
        } finally {
            setSavingMemory(false);
        }
    };

    // ──────────────────────────────────────────────────────────────────────────
    //  API CALL — sends chat history + context to backend
    // ──────────────────────────────────────────────────────────────────────────
    const sendMessageToAI = async (userMessage) => {
        abortControllerRef.current = new AbortController();

        const payload = {
            messages: messages
                .filter((m) => m.role !== 'system')
                .map((m) => ({ role: m.role, content: m.content })),
            userMessage,
            problemContext: {
                problemId,
                code: contextAttached ? code : null,
            },
        };

        const response = await axiosClient.post('/ai/chat', payload, {
            signal: abortControllerRef.current.signal,
        });

        return response.data;
    };

    // ──────────────────────────────────────────────────────────────────────────
    //  SEND handler — orchestrates the full send flow
    // ──────────────────────────────────────────────────────────────────────────
    const handleSend = async (text) => {
        const userMessage = (text || input).trim();
        if (!userMessage || isLoading) return;

        setInput('');
        setError(null);

        const userMsg = {
            role: 'user',
            content: userMessage,
            timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const data = await sendMessageToAI(userMessage);
            const assistantMsg = {
                role: 'assistant',
                content: data.reply,
                timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, assistantMsg]);
        } catch (err) {
            if (err.name === 'AbortError' || err.code === 'ERR_CANCELED') return;

            console.error('Chat error:', err);
            if (err.response?.status === 429) {
                setError("Whoa, slow down! I'm thinking about too many things at once. Give me 10 seconds and ask again.");
            } else {
                setError(
                    err.response?.data?.error ||
                    err.response?.data?.message ||
                    'Failed to get response. Please try again.'
                );
            }
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    };

    const handleStop = () => {
        abortControllerRef.current?.abort();
        setIsLoading(false);
    };

    const handleClearChat = () => {
        setMessages([]);
        setError(null);
        setPinnedIndices(new Set());
        setShowSaveModal(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const suggestions = [
        '🐛 Find bugs in my code',
        '💡 Give me a hint',
        '⏱️ Optimize time complexity',
        '📝 Explain the approach',
        '🧪 What edge cases am I missing?',
        '🔄 Suggest a different approach',
    ];

    const EmptyState = () => (
        <div className="flex flex-col items-center justify-center h-full px-6 py-12">
            <div className={`w-16 h-16 rounded-2xl mb-5 flex items-center justify-center ${darkMode ? 'bg-gradient-to-br from-violet-600/20 to-indigo-600/20' : 'bg-gradient-to-br from-violet-50 to-indigo-50'}`}>
                <svg className={`w-8 h-8 ${darkMode ? 'text-indigo-400' : 'text-indigo-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
            </div>
            <h3 className={`text-base font-black mb-1.5 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>AI Assistant</h3>
            <p className={`text-xs text-center mb-6 max-w-[260px] leading-relaxed ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                Ask about your code, get hints, debug errors, or explore different approaches. Pin helpful answers to save them for revision!
            </p>

            {( code) && (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl mb-5 text-[11px] ${darkMode ? 'bg-slate-800/60 border border-slate-700/50' : 'bg-slate-50 border border-slate-200'}`}>
                    <svg className={`w-3.5 h-3.5 ${darkMode ? 'text-emerald-400' : 'text-emerald-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <span className={`font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Context: { 'Current problem'} • {'code'}
                    </span>
                </div>
            )}

            <SuggestionChips suggestions={suggestions} onSelect={(s) => handleSend(s)} darkMode={darkMode} />
        </div>
    );

    return (
        <div className={`flex flex-col h-full ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
            {/* ─── Header ──────────────────────────────────────────────── */}
            <div className={`flex-shrink-0 flex items-center justify-between px-4 py-3 border-b ${darkMode ? 'bg-slate-900/95 border-slate-800 backdrop-blur-sm' : 'bg-white/95 border-slate-200 backdrop-blur-sm'}`}>
                <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${darkMode ? 'bg-gradient-to-br from-violet-600 to-indigo-600' : 'bg-gradient-to-br from-violet-500 to-indigo-500'}`}>
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5" />
                        </svg>
                    </div>
                    <div>
                        <h3 className={`text-sm font-black ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>AI Assistant</h3>
                        <p className={`text-[10px] font-medium ${isLoading ? (darkMode ? 'text-indigo-400' : 'text-indigo-500') : (darkMode ? 'text-slate-500' : 'text-slate-400')}`}>
                            {isLoading ? 'Thinking...' : 'Ready to help'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    {/* Pin count & save button */}
                    {pinnedIndices.size > 0 && (
                        <button
                            onClick={() => setShowSaveModal(true)}
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${darkMode ? 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/25' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}
                        >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                            </svg>
                            {pinnedIndices.size}/5 Save
                        </button>
                    )}

                    <button
                        onClick={() => setContextAttached(!contextAttached)}
                        title={contextAttached ? 'Code context attached' : 'Code context detached'}
                        className={`p-2 rounded-lg transition-all text-xs ${contextAttached ? (darkMode ? 'bg-indigo-500/15 text-indigo-400' : 'bg-indigo-50 text-indigo-600') : (darkMode ? 'text-slate-600 hover:text-slate-400 hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100')}`}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                    </button>

                    {messages.length > 0 && (
                        <button
                            onClick={handleClearChat}
                            title="Clear chat"
                            className={`p-2 rounded-lg transition-all ${darkMode ? 'text-slate-600 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* ─── Messages area ──────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto">
                {messages.filter((m) => m.role !== 'system').length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="flex flex-col gap-4 p-4">
                        {messages.map((msg, idx) => (
                            <ChatMessage
                                key={idx}
                                message={msg}
                                darkMode={darkMode}
                                isPinned={pinnedIndices.has(idx)}
                                onTogglePin={() => togglePin(idx)}
                                showPin={true}
                            />
                        ))}

                        {/* Typing indicator while waiting for backend */}
                        {isLoading && (
                            <div className="flex gap-3">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${darkMode ? 'bg-gradient-to-br from-violet-600 to-indigo-600' : 'bg-gradient-to-br from-violet-500 to-indigo-500'}`}>
                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5" />
                                    </svg>
                                </div>
                                <div className={`px-4 py-3 rounded-2xl rounded-tl-sm ${darkMode ? 'bg-slate-800 border border-slate-700/60' : 'bg-white border border-slate-200'}`}>
                                    <TypingIndicator darkMode={darkMode} />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* ─── Success toast ─────────────────────────────────────── */}
            {saveSuccess && (
                <div className={`mx-4 mb-2 px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold ${darkMode ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
                    <span className="flex-1">{saveSuccess}</span>
                    <button onClick={() => setSaveSuccess(null)} className="hover:opacity-70">✕</button>
                </div>
            )}

            {/* ─── Error banner ────────────────────────────────────────── */}
            {error && (
                <div className={`mx-4 mb-2 px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold ${darkMode ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="flex-1">{error}</span>
                    <button onClick={() => setError(null)} className="hover:opacity-70">✕</button>
                </div>
            )}

            {/* ─── Save memory modal ──────────────────────────────────── */}
            {showSaveModal && pinnedIndices.size > 0 && (
                <SaveMemoryModal
                    pinnedCount={pinnedIndices.size}
                    onSave={handleSaveMemory}
                    onCancel={() => setShowSaveModal(false)}
                    darkMode={darkMode}
                    saving={savingMemory}
                />
            )}

            {/* ─── Quick follow-ups ───────────────────────────────────── */}
            {messages.length > 0 && !isLoading && (
                <div className="flex-shrink-0 px-4 pb-1">
                    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                        {['Explain more', 'Show example', 'Any edge cases?', 'Optimize it'].map((s, i) => (
                            <button key={i} onClick={() => handleSend(s)} className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${darkMode ? 'border-slate-700/50 text-slate-500 hover:text-indigo-400 hover:border-indigo-500/40 hover:bg-slate-800' : 'border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50'}`}>
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ─── Input area ─────────────────────────────────────────── */}
            <div className={`flex-shrink-0 p-3 border-t ${darkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200'}`}>
                {contextAttached && code && (
                    <div className={`flex items-center gap-1.5 mb-2 px-2 text-[10px] font-semibold ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                        </svg>
                        Your code  is attached as context
                    </div>
                )}

                <div className={`flex items-end gap-2 p-1.5 rounded-2xl border transition-all ${darkMode ? 'bg-slate-800/80 border-slate-700/60 focus-within:border-indigo-500/50 focus-within:bg-slate-800' : 'bg-slate-50 border-slate-200 focus-within:border-indigo-400 focus-within:bg-white focus-within:shadow-sm'}`}>
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => {
                            setInput(e.target.value);
                            e.target.style.height = 'auto';
                            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about your code..."
                        disabled={isLoading}
                        rows={1}
                        className={`flex-1 resize-none bg-transparent border-0 outline-none text-sm px-2 py-1.5 max-h-[120px] ${darkMode ? 'text-slate-200 placeholder:text-slate-600' : 'text-slate-800 placeholder:text-slate-400'}`}
                    />

                    {isLoading ? (
                        <button
                            onClick={handleStop}
                            className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all ${darkMode ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <rect x="6" y="6" width="12" height="12" rx="2" />
                            </svg>
                        </button>
                    ) : (
                        <button
                            onClick={() => handleSend()}
                            disabled={!input.trim()}
                            className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all ${input.trim() ? 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/25' : (darkMode ? 'bg-slate-700/50 text-slate-600' : 'bg-slate-200 text-slate-400')}`}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 0l-7 7m7-7l7 7" />
                            </svg>
                        </button>
                    )}
                </div>

                <p className={`text-[9px] text-center mt-1.5 font-medium ${darkMode ? 'text-slate-700' : 'text-slate-300'}`}>
                    AI can make mistakes. Verify important information.
                </p>
            </div>
        </div>
    );
}

export default ChatAI;