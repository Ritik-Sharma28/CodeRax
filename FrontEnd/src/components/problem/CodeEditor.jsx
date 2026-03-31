import { useRef } from 'react';
import Editor from '@monaco-editor/react';

const LANGUAGES = [
    { key: 'cpp', label: 'C++' },
    { key: 'java', label: 'Java' },
    { key: 'python', label: 'Python' },
];

function CodeEditor({ code, selectedLanguage, onCodeChange, onLanguageChange, darkMode, previewMode = false }) {
    const editorRef = useRef(null);

    const handleEditorDidMount = (editor) => {
        editorRef.current = editor;
    };

    const getMonacoLanguage = (lang) => {
        switch (lang) {
            case 'python': return 'python';
            case 'java': return 'java';
            case 'cpp': return 'cpp';
            default: return 'cpp';
        }
    };

    return (
        <div className="flex-1 flex flex-col min-h-0">
            <div className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 border-b overflow-x-auto scrollbar-none
                ${darkMode
                    ? 'bg-slate-800/80 border-slate-700/60'
                    : 'bg-slate-50/80 border-slate-200/60'
                }`}
            >
                {LANGUAGES.map((lang) => (
                    <button
                        key={lang.key}
                        onClick={() => onLanguageChange(lang.key)}
                        className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all duration-200
                            ${selectedLanguage === lang.key
                                ? (darkMode
                                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-sm'
                                    : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20')
                                : (darkMode
                                    ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/80 border border-transparent'
                                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100 border border-transparent')
                            }`}
                    >
                        {lang.label}
                    </button>
                ))}
            </div>

            <div className="flex-1 min-h-0">
                <Editor
                    height="100%"
                    language={getMonacoLanguage(selectedLanguage)}
                    value={code}
                    onChange={(value) => onCodeChange(value || '')}
                    onMount={handleEditorDidMount}
                    theme={darkMode ? 'vs-dark' : 'light'}
                    options={{
                        fontSize: window.innerWidth < 640 ? 12 : 14,
                        fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', Consolas, monospace",
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 2,
                        insertSpaces: true,
                        wordWrap: 'on',
                        lineNumbers: 'on',
                        glyphMargin: false,
                        folding: true,
                        lineDecorationsWidth: 10,
                        lineNumbersMinChars: 3,
                        renderLineHighlight: 'line',
                        selectOnLineNumbers: true,
                        roundedSelection: false,
                        readOnly: previewMode,
                        cursorStyle: 'line',
                        mouseWheelZoom: true,
                        padding: { top: 12, bottom: 12 },
                        smoothScrolling: true,
                        cursorBlinking: 'smooth',
                        cursorSmoothCaretAnimation: 'on',
                    }}
                />
            </div>
        </div>
    );
}

export default CodeEditor;
