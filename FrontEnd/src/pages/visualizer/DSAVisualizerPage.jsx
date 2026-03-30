import { useEffect, useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Allotment } from 'allotment';
import 'allotment/dist/style.css';
import Navbar from '../../components/Navbar';
import AlgorithmSidebar from '../../components/visualizer/AlgorithmSidebar';
import ControlBar from '../../components/visualizer/ControlBar';
import ExplanationPanel from '../../components/visualizer/ExplanationPanel';
import SortingRenderer from '../../components/visualizer/renderers/SortingRenderer';
import MergeSortRenderer from '../../components/visualizer/renderers/MergeSortRenderer';
import HanoiRenderer from '../../components/visualizer/renderers/HanoiRenderer';
import TreeFlowRenderer from '../../components/visualizer/renderers/TreeFlowRenderer';
import GraphFlowRenderer from '../../components/visualizer/renderers/GraphFlowRenderer';
import { algorithmRegistry } from '../../utils/visualizer/algorithms';

/* ── allotment sash styling ── */
const sashCSS = `
  .split-view-view { overflow: hidden !important; }
  .sash-container .sash {
    background: transparent !important;
    transition: background 0.2s;
  }
  .sash-container .sash::before {
    content: '';
    position: absolute;
    inset: 8px 0;
    width: 3px;
    margin: 0 auto;
    border-radius: 999px;
    background: var(--sash-idle, rgba(148,163,184,0.25));
    transition: background 0.2s, width 0.2s;
  }
  .sash-container .sash:hover::before,
  .sash-container .sash.active::before {
    width: 5px;
    background: var(--sash-hover, rgba(245,158,11,0.55));
  }
  [data-dark="true"] { --sash-idle: rgba(100,116,139,0.25); --sash-hover: rgba(251,191,36,0.5); }
  [data-dark="false"] { --sash-idle: rgba(148,163,184,0.3); --sash-hover: rgba(245,158,11,0.5); }
`;

function VisualizerCanvas({ algorithm, step, darkMode }) {
    if (!step) return null;

    if (algorithm.renderer === 'sorting') return <SortingRenderer step={step} darkMode={darkMode} />;
    if (algorithm.renderer === 'merge') return <MergeSortRenderer step={step} darkMode={darkMode} />;
    if (algorithm.renderer === 'hanoi') return <HanoiRenderer step={step} darkMode={darkMode} />;
    if (algorithm.renderer === 'tree') return <TreeFlowRenderer step={step} darkMode={darkMode} />;
    if (algorithm.renderer === 'graph') return <GraphFlowRenderer step={step} darkMode={darkMode} directed={algorithm.directed} />;

    return null;
}

export default function DSAVisualizerPage() {
    const initialAlgorithm = algorithmRegistry[0];
    const initialSteps = initialAlgorithm.buildSteps(initialAlgorithm.parseInput(initialAlgorithm.defaultInput));
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
    const [selectedAlgorithmId, setSelectedAlgorithmId] = useState(initialAlgorithm.id);
    const [rawInput, setRawInput] = useState(initialAlgorithm.defaultInput);
    const [steps, setSteps] = useState(initialSteps);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(1);
    const [inputError, setInputError] = useState('');

    const selectedAlgorithm = algorithmRegistry.find((algorithm) => algorithm.id === selectedAlgorithmId) || algorithmRegistry[0];
    const currentStep = steps[currentStepIndex];

    useEffect(() => {
        localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);

    useEffect(() => {
        if (!isPlaying || steps.length <= 1) return undefined;
        if (currentStepIndex >= steps.length - 1) return undefined;

        const timeout = window.setTimeout(() => {
            setCurrentStepIndex((previous) => {
                const next = Math.min(previous + 1, steps.length - 1);
                if (next >= steps.length - 1) setIsPlaying(false);
                return next;
            });
        }, Math.max(180, 900 / speed));

        return () => window.clearTimeout(timeout);
    }, [isPlaying, currentStepIndex, steps, speed]);

    const applyInput = () => {
        try {
            const parsed = selectedAlgorithm.parseInput(rawInput);
            const builtSteps = selectedAlgorithm.buildSteps(parsed);
            setSteps(builtSteps);
            setCurrentStepIndex(0);
            setInputError('');
            setIsPlaying(false);
        } catch (error) {
            setInputError(error.message || 'Please correct the input format.');
            setIsPlaying(false);
        }
    };

    const selectAlgorithm = (algorithmId) => {
        const nextAlgorithm = algorithmRegistry.find((algorithm) => algorithm.id === algorithmId);
        if (!nextAlgorithm) return;

        try {
            const parsed = nextAlgorithm.parseInput(nextAlgorithm.defaultInput);
            const builtSteps = nextAlgorithm.buildSteps(parsed);
            setSelectedAlgorithmId(nextAlgorithm.id);
            setRawInput(nextAlgorithm.defaultInput);
            setSteps(builtSteps);
            setCurrentStepIndex(0);
            setInputError('');
            setIsPlaying(false);
        } catch (error) {
            setInputError(error.message || 'Unable to parse the default input.');
            setIsPlaying(false);
        }
    };

    const randomizeInput = () => {
        const generated = selectedAlgorithm.randomizeInput();
        setRawInput(generated);
        try {
            const parsed = selectedAlgorithm.parseInput(generated);
            const builtSteps = selectedAlgorithm.buildSteps(parsed);
            setSteps(builtSteps);
            setCurrentStepIndex(0);
            setInputError('');
            setIsPlaying(false);
        } catch (error) {
            setInputError(error.message || 'Unable to generate valid input.');
        }
    };

    if (!selectedAlgorithm) return null;

    return (
        <ReactFlowProvider>
            <div data-dark={darkMode} className={`h-screen overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-white' : 'bg-[linear-gradient(135deg,_#fffdf5_0%,_#fff_42%,_#eef6ff_100%)] text-slate-900'}`}>
                <style>{sashCSS}</style>
                <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

                <div className={`fixed left-[-10%] top-[10%] h-[260px] w-[260px] rounded-full blur-[110px] pointer-events-none ${darkMode ? 'bg-amber-500/8' : 'bg-amber-300/18'}`} />
                <div className={`fixed bottom-[-10%] right-[-10%] h-[320px] w-[320px] rounded-full blur-[120px] pointer-events-none ${darkMode ? 'bg-cyan-500/8' : 'bg-sky-300/16'}`} />

                <div className="relative z-10 h-[calc(100vh-4rem)] px-2 py-2">
                    <Allotment proportionalLayout={false}>
                        {/* ── Left Sidebar ── */}
                        <Allotment.Pane minSize={180} preferredSize={260}>
                            <div className="h-full p-1">
                                <AlgorithmSidebar
                                    algorithms={algorithmRegistry}
                                    selectedId={selectedAlgorithmId}
                                    onSelect={selectAlgorithm}
                                    darkMode={darkMode}
                                />
                            </div>
                        </Allotment.Pane>

                        {/* ── Main Visualization Panel ── */}
                        <Allotment.Pane minSize={400}>
                            <div className="h-full p-1">
                                <section className={`flex h-full min-h-0 flex-col rounded-[24px] border p-3 ${darkMode ? 'border-slate-700/60 bg-slate-900/82' : 'border-slate-200/70 bg-white/90 shadow-[0_25px_80px_-48px_rgba(15,23,42,0.35)]'}`}>
                                    {/* Header */}
                                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                        <div>
                                            <p className={`text-[10px] font-bold uppercase tracking-[0.24em] ${darkMode ? 'text-amber-300' : 'text-amber-700'}`}>DSA Visualizer</p>
                                            <h1 className={`mt-0.5 text-xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{selectedAlgorithm.name}</h1>
                                        </div>
                                        <div className={`rounded-xl border px-2.5 py-1.5 ${darkMode ? 'border-slate-700 bg-slate-950 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.22em]">Input</p>
                                            <p className="mt-0.5 text-xs font-semibold">{selectedAlgorithm.badge}</p>
                                        </div>
                                    </div>

                                    {/* Controls + Input */}
                                    <div className="mb-2 grid gap-3 xl:grid-cols-[minmax(0,1fr)_250px]">
                                        <ControlBar
                                            darkMode={darkMode}
                                            isPlaying={isPlaying}
                                            canStepBack={currentStepIndex > 0}
                                            canStepForward={currentStepIndex < steps.length - 1}
                                            speed={speed}
                                            onPlayPause={() => setIsPlaying((previous) => !previous)}
                                            onStepBack={() => {
                                                setIsPlaying(false);
                                                setCurrentStepIndex((previous) => Math.max(previous - 1, 0));
                                            }}
                                            onStepForward={() => {
                                                setIsPlaying(false);
                                                setCurrentStepIndex((previous) => Math.min(previous + 1, steps.length - 1));
                                            }}
                                            onReset={() => {
                                                setIsPlaying(false);
                                                setCurrentStepIndex(0);
                                            }}
                                            onRandomize={randomizeInput}
                                            onApplyInput={applyInput}
                                            onSpeedChange={setSpeed}
                                        />

                                        <div className={`rounded-[20px] border p-3 ${darkMode ? 'border-slate-700/60 bg-slate-950/80' : 'border-slate-200/70 bg-white/95'}`}>
                                            <label className={`text-[10px] font-bold uppercase tracking-[0.24em] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                                {selectedAlgorithm.inputLabel}
                                            </label>
                                            <textarea
                                                value={rawInput}
                                                onChange={(event) => setRawInput(event.target.value)}
                                                rows={selectedAlgorithm.renderer === 'graph' ? 4 : 2}
                                                className={`mt-2 w-full rounded-[16px] border px-3 py-2 text-xs leading-5 outline-none transition-colors ${darkMode
                                                    ? 'border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-500 focus:border-amber-400'
                                                    : 'border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:border-amber-400'
                                                    }`}
                                                placeholder={selectedAlgorithm.defaultInput}
                                            />
                                            <p className={`mt-1 text-[10px] ${inputError ? 'text-rose-500' : (darkMode ? 'text-slate-400' : 'text-slate-500')}`}>
                                                {inputError || selectedAlgorithm.inputHelper}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Visualization Canvas */}
                                    <div className={`min-h-0 flex-1 overflow-y-auto rounded-[20px] border ${darkMode ? 'border-slate-700/60 bg-slate-950/70' : 'border-slate-200/70 bg-slate-50/60'}`}>
                                        {currentStep ? <VisualizerCanvas algorithm={selectedAlgorithm} step={currentStep} darkMode={darkMode} /> : null}
                                    </div>
                                </section>
                            </div>
                        </Allotment.Pane>

                        {/* ── Right Explanation Panel ── */}
                        <Allotment.Pane minSize={260} preferredSize={330}>
                            <div className="h-full p-1">
                                <ExplanationPanel
                                    algorithm={selectedAlgorithm}
                                    step={currentStep}
                                    stepIndex={currentStepIndex}
                                    totalSteps={steps.length}
                                    darkMode={darkMode}
                                />
                            </div>
                        </Allotment.Pane>
                    </Allotment>
                </div>
            </div>
        </ReactFlowProvider>
    );
}
