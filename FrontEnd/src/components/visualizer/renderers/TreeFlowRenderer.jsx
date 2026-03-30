import { Background, Controls, ReactFlow } from '@xyflow/react';

function makeTreeGraph(step, darkMode) {
    const layout = step.state.layout || { nodes: [], edges: [] };

    const nodes = layout.nodes.map((node) => {
        let background = darkMode ? '#0f172a' : '#ffffff';
        let border = darkMode ? '#334155' : '#cbd5e1';
        let color = darkMode ? '#e2e8f0' : '#0f172a';

        if (node.id === step.state.current) {
            background = darkMode ? '#f59e0b' : '#fbbf24';
            border = darkMode ? '#fbbf24' : '#f59e0b';
            color = '#111827';
        } else if (step.state.visited?.includes(node.id)) {
            background = darkMode ? '#10b981' : '#34d399';
            border = darkMode ? '#34d399' : '#10b981';
            color = '#052e16';
        } else if (step.state.queued?.includes(node.id)) {
            background = darkMode ? '#8b5cf6' : '#c4b5fd';
            border = darkMode ? '#a78bfa' : '#8b5cf6';
            color = darkMode ? '#faf5ff' : '#4c1d95';
        }

        return {
            id: node.id,
            position: node.position,
            data: { label: node.label },
            draggable: false,
            selectable: false,
            style: {
                width: 64,
                height: 64,
                borderRadius: 9999,
                border: `3px solid ${border}`,
                background,
                color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                boxShadow: darkMode ? '0 22px 45px -28px rgba(15,23,42,0.9)' : '0 22px 45px -28px rgba(15,23,42,0.45)',
            },
        };
    });

    const edges = layout.edges.map((edge) => ({
        ...edge,
        animated: false,
        selectable: false,
        style: {
            stroke: darkMode ? '#475569' : '#94a3b8',
            strokeWidth: 2.5,
        },
    }));

    return { nodes, edges };
}

export default function TreeFlowRenderer({ step, darkMode }) {
    const { nodes, edges } = makeTreeGraph(step, darkMode);
    const visitedOrder = (step.state.visited || []).map((id) => {
        const node = nodes.find((entry) => entry.id === id);
        return node?.data?.label || id;
    });
    const queueOrder = (step.state.queued || []).map((id) => {
        const node = nodes.find((entry) => entry.id === id);
        return node?.data?.label || id;
    });

    return (
        <div className="grid h-full min-h-0 gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className={`min-h-0 rounded-[24px] border overflow-hidden ${darkMode ? 'border-slate-700/60 bg-slate-950/85' : 'border-slate-200/70 bg-white/95'}`}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    fitView
                    proOptions={{ hideAttribution: true }}
                    nodesDraggable={false}
                    nodesConnectable={false}
                    zoomOnDoubleClick={false}
                    panOnScroll
                >
                    <Background color={darkMode ? '#1e293b' : '#e2e8f0'} gap={24} />
                    <Controls showInteractive={false} />
                </ReactFlow>
            </div>

            <div className="grid gap-4">
                <div className={`rounded-[24px] border p-4 ${darkMode ? 'border-slate-700/60 bg-slate-950/80' : 'border-slate-200/70 bg-white/95'}`}>
                    <p className={`text-[11px] font-bold uppercase tracking-[0.24em] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Queue</p>
                    <p className={`mt-3 text-sm ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{queueOrder.length ? queueOrder.join(' -> ') : 'Empty'}</p>
                </div>
                <div className={`rounded-[24px] border p-4 ${darkMode ? 'border-slate-700/60 bg-slate-950/80' : 'border-slate-200/70 bg-white/95'}`}>
                    <p className={`text-[11px] font-bold uppercase tracking-[0.24em] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Traversal Output</p>
                    <p className={`mt-3 text-sm ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{visitedOrder.length ? visitedOrder.join(' -> ') : 'No nodes visited yet'}</p>
                </div>
            </div>
        </div>
    );
}
