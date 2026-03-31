import { useState } from 'react';

// ─── Inline parser (bold, italic, inline code) ────────────────────────────────
export function parseInline(text, darkMode) {
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

// ─── Text block — headings, lists, paragraphs ────────────────────────────────
export function TextBlock({ text, darkMode }) {
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

// ─── Code block with working copy button ──────────────────────────────────────
export function CodeBlock({ code, lang, darkMode }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
        } catch {
            // Fallback for older browsers / non-HTTPS
            const textarea = document.createElement('textarea');
            textarea.value = code;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }
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

// ─── Top-level render function ────────────────────────────────────────────────
export function renderMarkdown(text, darkMode) {
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
