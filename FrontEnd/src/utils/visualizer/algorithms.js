function cloneArray(values) {
    return values.map((value) => value);
}

function createSortableItems(values) {
    return values.map((value, index) => ({ id: `item-${index}-${value}`, value }));
}

function snapshotItems(items) {
    return items.map((item) => ({ ...item }));
}

function makeStatusMap(items, { compared = [], swapped = [], sorted = [], current = [], candidate = [], shifted = [] } = {}) {
    const statusMap = Object.fromEntries(items.map((item) => [item.id, 'default']));
    compared.forEach((id) => { statusMap[id] = 'compare'; });
    swapped.forEach((id) => { statusMap[id] = 'swap'; });
    sorted.forEach((id) => { statusMap[id] = 'sorted'; });
    current.forEach((id) => { statusMap[id] = 'current'; });
    candidate.forEach((id) => { statusMap[id] = 'candidate'; });
    shifted.forEach((id) => { statusMap[id] = 'shifted'; });
    return statusMap;
}

function parseNumberArray(rawInput, { min, max }) {
    const values = rawInput
        .split(',')
        .map((part) => Number(part.trim()))
        .filter((value) => !Number.isNaN(value));

    if (values.length < min || values.length > max) {
        throw new Error(`Use between ${min} and ${max} numbers.`);
    }

    return values;
}

function randomNumberArray(length) {
    const values = [];
    const used = new Set();

    while (values.length < length) {
        const candidate = Math.floor(Math.random() * 90) + 10;
        if (!used.has(candidate)) {
            used.add(candidate);
            values.push(candidate);
        }
    }

    return values.join(', ');
}

function makeStep(message, codeLine, state, details = []) {
    return { message, codeLine, state, details };
}

function buildBubbleSortSteps(values) {
    const items = createSortableItems(values);
    const steps = [
        makeStep('Starting Bubble Sort. We repeatedly compare adjacent values and push the largest unsorted value toward the right end.', 0, {
            items: snapshotItems(items),
            statusMap: makeStatusMap(items),
            sortedIds: [],
            comparedValues: null,
        }),
    ];

    const sorted = new Set();
    for (let end = items.length - 1; end > 0; end--) {
        for (let index = 0; index < end; index++) {
            const leftItem = items[index];
            const rightItem = items[index + 1];
            steps.push(makeStep(
                `Now comparing ${leftItem.value} and ${rightItem.value}. If the left value is greater, they need to swap.`,
                2,
                {
                    items: snapshotItems(items),
                    statusMap: makeStatusMap(items, { compared: [leftItem.id, rightItem.id], sorted: [...sorted] }),
                    sortedIds: [...sorted],
                    comparedValues: [leftItem.value, rightItem.value],
                },
                [
                    { label: 'Compared Pair', value: `${leftItem.value} vs ${rightItem.value}` },
                    { label: 'Sorted Tail', value: [...sorted].length ? items.filter((item) => sorted.has(item.id)).map((item) => item.value).join(', ') : 'None yet' },
                ],
            ));

            if (leftItem.value > rightItem.value) {
                [items[index], items[index + 1]] = [items[index + 1], items[index]];
                steps.push(makeStep(
                    `${leftItem.value} is greater than ${rightItem.value}, so the two cells slide across each other.`,
                    3,
                    {
                        items: snapshotItems(items),
                        statusMap: makeStatusMap(items, { swapped: [leftItem.id, rightItem.id], sorted: [...sorted] }),
                        sortedIds: [...sorted],
                        comparedValues: [leftItem.value, rightItem.value],
                    },
                    [
                        { label: 'Swap', value: `${leftItem.value} <-> ${rightItem.value}` },
                        { label: 'New Order', value: items.map((item) => item.value).join(', ') },
                    ],
                ));
            }
        }

        sorted.add(items[end].id);
        steps.push(makeStep(
            `${items[end].value} is now fixed in its final sorted position at index ${end}.`,
            4,
            {
                items: snapshotItems(items),
                statusMap: makeStatusMap(items, { sorted: [...sorted] }),
                sortedIds: [...sorted],
                comparedValues: null,
            },
            [
                { label: 'Locked Value', value: `${items[end].value} at index ${end}` },
            ],
        ));
    }

    sorted.add(items[0].id);
    steps.push(makeStep('Bubble Sort is complete. Every value is now in non-decreasing order.', 5, {
        items: snapshotItems(items),
        statusMap: makeStatusMap(items, { sorted: [...sorted] }),
        sortedIds: [...sorted],
        comparedValues: null,
    }));

    return steps;
}

function buildSelectionSortSteps(values) {
    const items = createSortableItems(values);
    const steps = [
        makeStep('Starting Selection Sort. For each index, we scan the unsorted suffix to find the smallest value.', 0, {
            items: snapshotItems(items),
            statusMap: makeStatusMap(items),
            sortedIds: [],
            comparedValues: null,
        }),
    ];

    const sorted = new Set();

    for (let start = 0; start < items.length; start++) {
        let minIndex = start;
        steps.push(makeStep(
            `Position ${start} is the next slot to fill. We currently assume ${items[minIndex].value} is the minimum.`,
            1,
            {
                items: snapshotItems(items),
                statusMap: makeStatusMap(items, { candidate: [items[minIndex].id], sorted: [...sorted] }),
                sortedIds: [...sorted],
                comparedValues: null,
            },
            [
                { label: 'Candidate Minimum', value: `${items[minIndex].value}` },
                { label: 'Scan Window', value: `${start} to ${items.length - 1}` },
            ],
        ));

        for (let index = start + 1; index < items.length; index++) {
            steps.push(makeStep(
                `Comparing current minimum ${items[minIndex].value} with ${items[index].value}.`,
                2,
                {
                    items: snapshotItems(items),
                    statusMap: makeStatusMap(items, { compared: [items[minIndex].id, items[index].id], candidate: [items[minIndex].id], sorted: [...sorted] }),
                    sortedIds: [...sorted],
                    comparedValues: [items[minIndex].value, items[index].value],
                },
                [
                    { label: 'Current Minimum', value: `${items[minIndex].value}` },
                    { label: 'Challenger', value: `${items[index].value}` },
                ],
            ));

            if (items[index].value < items[minIndex].value) {
                minIndex = index;
                steps.push(makeStep(
                    `${items[minIndex].value} is smaller, so it becomes the new minimum candidate.`,
                    3,
                    {
                        items: snapshotItems(items),
                        statusMap: makeStatusMap(items, { candidate: [items[minIndex].id], sorted: [...sorted] }),
                        sortedIds: [...sorted],
                        comparedValues: null,
                    },
                    [
                        { label: 'Updated Minimum', value: `${items[minIndex].value} at index ${minIndex}` },
                    ],
                ));
            }
        }

        if (minIndex !== start) {
            const left = items[start];
            const right = items[minIndex];
            [items[start], items[minIndex]] = [items[minIndex], items[start]];
            steps.push(makeStep(
                `We move ${right.value} into slot ${start} and push ${left.value} back into the unsorted region.`,
                4,
                {
                    items: snapshotItems(items),
                    statusMap: makeStatusMap(items, { swapped: [left.id, right.id], sorted: [...sorted] }),
                    sortedIds: [...sorted],
                    comparedValues: [left.value, right.value],
                },
                [
                    { label: 'Swap', value: `${left.value} <-> ${right.value}` },
                ],
            ));
        }

        sorted.add(items[start].id);
        steps.push(makeStep(
            `${items[start].value} is now fixed in the sorted prefix.`,
            5,
            {
                items: snapshotItems(items),
                statusMap: makeStatusMap(items, { sorted: [...sorted] }),
                sortedIds: [...sorted],
                comparedValues: null,
            },
            [
                { label: 'Sorted Prefix', value: items.filter((item) => sorted.has(item.id)).map((item) => item.value).join(', ') },
            ],
        ));
    }

    return steps;
}

function buildInsertionSortSteps(values) {
    const items = createSortableItems(values);
    const steps = [
        makeStep('Starting Insertion Sort. We grow a sorted prefix by inserting one value at a time.', 0, {
            items: snapshotItems(items),
            statusMap: makeStatusMap(items),
            sortedIds: [],
            keyId: null,
            comparedValues: null,
        }),
    ];

    const sorted = new Set([items[0].id]);
    steps.push(makeStep(`${items[0].value} starts as a sorted prefix of size 1.`, 1, {
        items: snapshotItems(items),
        statusMap: makeStatusMap(items, { sorted: [...sorted] }),
        sortedIds: [...sorted],
        keyId: null,
        comparedValues: null,
    }));

    for (let index = 1; index < items.length; index++) {
        const keyItem = items[index];
        let hole = index - 1;
        steps.push(makeStep(
            `Lift ${keyItem.value} out as the key and compare it backward through the sorted prefix.`,
            2,
            {
                items: snapshotItems(items),
                statusMap: makeStatusMap(items, { current: [keyItem.id], sorted: [...sorted] }),
                sortedIds: [...sorted],
                keyId: keyItem.id,
                comparedValues: null,
            },
            [
                { label: 'Key', value: `${keyItem.value}` },
                { label: 'Sorted Prefix', value: items.slice(0, index).map((item) => item.value).join(', ') },
            ],
        ));

        while (hole >= 0 && items[hole].value > keyItem.value) {
            steps.push(makeStep(
                `${items[hole].value} is greater than ${keyItem.value}, so it shifts one slot to the right.`,
                3,
                {
                    items: snapshotItems(items),
                    statusMap: makeStatusMap(items, { compared: [items[hole].id, keyItem.id], current: [keyItem.id], shifted: [items[hole].id], sorted: [...sorted] }),
                    sortedIds: [...sorted],
                    keyId: keyItem.id,
                    comparedValues: [items[hole].value, keyItem.value],
                },
                [
                    { label: 'Shifted Value', value: `${items[hole].value}` },
                ],
            ));

            items[hole + 1] = items[hole];
            hole--;
        }

        items[hole + 1] = keyItem;
        for (let sortedIndex = 0; sortedIndex <= index; sortedIndex++) {
            sorted.add(items[sortedIndex].id);
        }

        steps.push(makeStep(
            `${keyItem.value} drops into index ${hole + 1}, so the sorted prefix expands.`,
            4,
            {
                items: snapshotItems(items),
                statusMap: makeStatusMap(items, { sorted: [...sorted], current: [keyItem.id] }),
                sortedIds: [...sorted],
                keyId: keyItem.id,
                comparedValues: null,
            },
            [
                { label: 'Inserted Key', value: `${keyItem.value} at index ${hole + 1}` },
            ],
        ));
    }

    return steps;
}

function buildMergeSortSteps(values) {
    const splitRows = [];
    const mergeRows = [];

    function ensureRow(store, index) {
        if (!store[index]) store[index] = [];
        return store[index];
    }

    function buildSplitRows(segment, depth, startIndex) {
        ensureRow(splitRows, depth).push({
            id: `split-${depth}-${startIndex}-${segment.length}`,
            values: cloneArray(segment),
            startIndex,
        });

        if (segment.length > 1) {
            const mid = Math.floor(segment.length / 2);
            buildSplitRows(segment.slice(0, mid), depth + 1, startIndex);
            buildSplitRows(segment.slice(mid), depth + 1, startIndex + mid);
        }
    }

    function createMergeState({ activeSplit = null, mergeOutput = [], mergeDepth = null, comparePair = null, leftSegment = [], rightSegment = [] } = {}) {
        const renderedMergeRows = mergeRows.map((row, index) => row.map((segment) => ({
            ...segment,
            active: mergeDepth === index && segment.startIndex === (mergeOutput.startIndex ?? segment.startIndex),
        })));

        return {
            splitRows: splitRows.map((row, depth) => row.map((segment) => ({
                ...segment,
                active: activeSplit && activeSplit.depth === depth && activeSplit.startIndex === segment.startIndex && activeSplit.length === segment.values.length,
            }))),
            mergeRows: renderedMergeRows,
            mergeOutput: Array.isArray(mergeOutput) ? mergeOutput : mergeOutput.values,
            mergeDepth,
            comparePair,
            leftSegment,
            rightSegment,
        };
    }

    buildSplitRows(values, 0, 0);
    const steps = [
        makeStep('Merge Sort begins with the full array, then keeps splitting each segment into smaller halves.', 0, {
            ...createMergeState(),
        }),
    ];

    function recurse(segment, depth, startIndex) {
        if (segment.length === 1) {
            steps.push(makeStep(
                `${segment[0]} is a single element, so it is already sorted.`,
                1,
                {
                    ...createMergeState({
                        activeSplit: { depth, startIndex, length: segment.length },
                        mergeOutput: segment,
                        mergeDepth: depth,
                    }),
                },
                [
                    { label: 'Base Case', value: `${segment[0]}` },
                ],
            ));
            return segment;
        }

        const mid = Math.floor(segment.length / 2);
        const left = segment.slice(0, mid);
        const right = segment.slice(mid);

        steps.push(makeStep(
            `Split ${segment.join(', ')} into left half [${left.join(', ')}] and right half [${right.join(', ')}].`,
            2,
            {
                ...createMergeState({
                    activeSplit: { depth, startIndex, length: segment.length },
                    leftSegment: left,
                    rightSegment: right,
                }),
            },
        ));

        const sortedLeft = recurse(left, depth + 1, startIndex);
        const sortedRight = recurse(right, depth + 1, startIndex + mid);

        const merged = [];
        let leftIndex = 0;
        let rightIndex = 0;

        while (leftIndex < sortedLeft.length && rightIndex < sortedRight.length) {
            const leftValue = sortedLeft[leftIndex];
            const rightValue = sortedRight[rightIndex];
            const chosen = leftValue <= rightValue ? leftValue : rightValue;

            steps.push(makeStep(
                `Now comparing ${leftValue} and ${rightValue}. Since ${chosen} is smaller, it moves into the merged array first.`,
                3,
                {
                    ...createMergeState({
                        activeSplit: { depth, startIndex, length: segment.length },
                        mergeOutput: [...merged, chosen],
                        mergeDepth: depth,
                        comparePair: [leftValue, rightValue],
                        leftSegment: sortedLeft,
                        rightSegment: sortedRight,
                    }),
                },
                [
                    { label: 'Left Half', value: sortedLeft.join(', ') },
                    { label: 'Right Half', value: sortedRight.join(', ') },
                ],
            ));

            if (leftValue <= rightValue) {
                merged.push(leftValue);
                leftIndex++;
            } else {
                merged.push(rightValue);
                rightIndex++;
            }
        }

        while (leftIndex < sortedLeft.length) {
            merged.push(sortedLeft[leftIndex]);
            steps.push(makeStep(
                `${sortedLeft[leftIndex]} remains in the left half, so we append it directly.`,
                4,
                {
                    ...createMergeState({
                        activeSplit: { depth, startIndex, length: segment.length },
                        mergeOutput: cloneArray(merged),
                        mergeDepth: depth,
                        leftSegment: sortedLeft,
                        rightSegment: sortedRight,
                    }),
                },
            ));
            leftIndex++;
        }

        while (rightIndex < sortedRight.length) {
            merged.push(sortedRight[rightIndex]);
            steps.push(makeStep(
                `${sortedRight[rightIndex]} remains in the right half, so we append it directly.`,
                4,
                {
                    ...createMergeState({
                        activeSplit: { depth, startIndex, length: segment.length },
                        mergeOutput: cloneArray(merged),
                        mergeDepth: depth,
                        leftSegment: sortedLeft,
                        rightSegment: sortedRight,
                    }),
                },
            ));
            rightIndex++;
        }

        ensureRow(mergeRows, depth).push({
            id: `merge-${depth}-${startIndex}-${segment.length}`,
            values: cloneArray(merged),
            startIndex,
        });

        steps.push(makeStep(
            `Merged result for this segment is [${merged.join(', ')}].`,
            5,
            {
                ...createMergeState({
                    activeSplit: { depth, startIndex, length: segment.length },
                    mergeOutput: cloneArray(merged),
                    mergeDepth: depth,
                    leftSegment: sortedLeft,
                    rightSegment: sortedRight,
                }),
            },
            [
                { label: 'Merged Segment', value: merged.join(', ') },
            ],
        ));

        return merged;
    }

    const finalOutput = recurse(values, 0, 0);
    steps.push(makeStep('Merge Sort is complete. The final fully merged array is sorted.', 6, {
        ...createMergeState({
            mergeOutput: finalOutput,
            mergeDepth: 0,
        }),
    }));

    return steps;
}

function parseDiskCount(rawInput) {
    const disks = Number(rawInput.trim());
    if (!Number.isInteger(disks) || disks < 3 || disks > 6) {
        throw new Error('Use a disk count between 3 and 6.');
    }
    return disks;
}

function buildHanoiSteps(diskCount) {
    const pegs = [
        Array.from({ length: diskCount }, (_, index) => diskCount - index),
        [],
        [],
    ];
    const names = ['Source', 'Helper', 'Target'];
    const diskLabel = (d) => String.fromCharCode(64 + d); // 1→A, 2→B, 3→C …
    const diskLabelsAll = Array.from({ length: diskCount }, (_, i) => diskLabel(i + 1)).join(', ');
    const steps = [
        makeStep(`We begin with ${diskCount} disks (${diskLabelsAll}) stacked on the Source peg — ${diskLabel(1)} (smallest) on top, ${diskLabel(diskCount)} (largest) on the bottom.`, 0, {
            pegs: pegs.map((peg) => [...peg]),
            move: null,
        }),
    ];

    function move(n, from, helper, to) {
        if (n === 1) {
            const disk = pegs[from].pop();
            pegs[to].push(disk);
            steps.push(makeStep(
                `Move Disk ${diskLabel(disk)} from ${names[from]} to ${names[to]}.`,
                1,
                {
                    pegs: pegs.map((peg) => [...peg]),
                    move: { disk, from, to },
                },
                [
                    { label: 'Disk', value: `${diskLabel(disk)}` },
                    { label: 'Move', value: `${names[from]} → ${names[to]}` },
                ],
            ));
            return;
        }

        steps.push(makeStep(
            `To move the top ${n} disks, we first move ${n - 1} disks to the helper peg.`,
            2,
            {
                pegs: pegs.map((peg) => [...peg]),
                move: null,
            },
            [
                { label: 'Subproblem', value: `Move ${n - 1} disks away first` },
            ],
        ));
        move(n - 1, from, to, helper);
        move(1, from, helper, to);
        steps.push(makeStep(
            `Now we move the ${n - 1} disks from the helper peg onto the target peg.`,
            3,
            {
                pegs: pegs.map((peg) => [...peg]),
                move: null,
            },
            [
                { label: 'Subproblem', value: `Stack ${n - 1} disks on target` },
            ],
        ));
        move(n - 1, helper, from, to);
    }

    move(diskCount, 0, 1, 2);
    steps.push(makeStep(`Tower of Hanoi is complete! All ${diskCount} disks (${diskLabelsAll}) now sit on the Target peg in the correct order.`, 4, {
        pegs: pegs.map((peg) => [...peg]),
        move: null,
    }));
    return steps;
}

function parseTreeInput(rawInput) {
    const values = rawInput.split(',').map((part) => part.trim()).filter(Boolean);
    if (values.length < 7 || values.length > 15) {
        throw new Error('Use between 7 and 15 tree values.');
    }
    return values;
}

function makeTreeLayout(values) {
    const nodes = [];
    const edges = [];

    values.forEach((value, index) => {
        const level = Math.floor(Math.log2(index + 1));
        const levelStart = 2 ** level - 1;
        const positionInLevel = index - levelStart;
        const countInLevel = 2 ** level;

        nodes.push({
            id: `${index}`,
            label: `${value}`,
            position: {
                x: ((positionInLevel + 1) * 900) / (countInLevel + 1),
                y: 90 + level * 120,
            },
        });

        const left = index * 2 + 1;
        const right = index * 2 + 2;
        if (left < values.length) edges.push({ id: `e-${index}-${left}`, source: `${index}`, target: `${left}` });
        if (right < values.length) edges.push({ id: `e-${index}-${right}`, source: `${index}`, target: `${right}` });
    });

    return { nodes, edges };
}

function buildTreeBfsSteps(values) {
    const layout = makeTreeLayout(values);
    const queue = ['0'];
    const visited = [];
    const steps = [
        makeStep('Start level-order traversal by placing the root into the queue.', 0, {
            layout,
            current: null,
            queued: [...queue],
            visited: [...visited],
        }, [
            { label: 'Queue', value: values[0] },
        ]),
    ];

    while (queue.length) {
        const nodeId = queue.shift();
        const nodeValue = values[Number(nodeId)];
        visited.push(nodeId);

        steps.push(makeStep(
            `Visit node ${nodeValue}. This is the next node removed from the queue.`,
            2,
            {
                layout,
                current: nodeId,
                queued: [...queue],
                visited: [...visited],
            },
            [
                { label: 'Visited Order', value: visited.map((id) => values[Number(id)]).join(' → ') },
            ],
        ));

        const left = Number(nodeId) * 2 + 1;
        const right = Number(nodeId) * 2 + 2;
        [left, right].forEach((childIndex) => {
            if (childIndex < values.length) {
                queue.push(`${childIndex}`);
                steps.push(makeStep(
                    `Add child ${values[childIndex]} to the queue so it can be processed in the next layer.`,
                    3,
                    {
                        layout,
                        current: nodeId,
                        queued: [...queue],
                        visited: [...visited],
                    },
                    [
                        { label: 'Queue', value: queue.map((id) => values[Number(id)]).join(' → ') },
                    ],
                ));
            }
        });
    }

    steps.push(makeStep('The queue is empty, so level-order traversal is complete.', 4, {
        layout,
        current: null,
        queued: [],
        visited: [...visited],
    }));

    return steps;
}

function parseGraphInput(rawInput, directed = false) {
    const lines = rawInput.split('\n').map((line) => line.trim()).filter(Boolean);
    const edgeLines = [];
    let start = null;

    lines.forEach((line) => {
        if (line.toLowerCase().startsWith('start:')) {
            start = line.split(':')[1]?.trim();
        } else {
            edgeLines.push(line);
        }
    });

    const edges = edgeLines.map((line) => {
        if (directed) {
            const [source, target] = line.split('>').map((part) => part.trim());
            if (!source || !target) throw new Error(`Invalid edge "${line}". Use A>B format.`);
            return { source, target };
        }

        const [source, target] = line.split(/\s+/);
        if (!source || !target) throw new Error(`Invalid edge "${line}". Use A B format.`);
        return { source, target };
    });

    const nodeSet = new Set();
    edges.forEach(({ source, target }) => {
        nodeSet.add(source);
        nodeSet.add(target);
    });

    if (nodeSet.size < 5 || nodeSet.size > 8) {
        throw new Error('Use between 5 and 8 unique graph nodes.');
    }

    const nodes = [...nodeSet].sort();
    if (!directed) {
        start = start || nodes[0];
        if (!nodeSet.has(start)) throw new Error('Start node must exist in the graph.');
    }

    return { nodes, edges, start };
}

function makeCircularGraphLayout(nodes, edges) {
    const radius = 250;
    const centerX = 420;
    const centerY = 260;

    return {
        nodes: nodes.map((node, index) => {
            const angle = (index / nodes.length) * 2 * Math.PI - Math.PI / 2;
            return {
                id: node,
                label: node,
                position: {
                    x: centerX + radius * Math.cos(angle),
                    y: centerY + radius * Math.sin(angle),
                },
            };
        }),
        edges: edges.map((edge, index) => ({
            id: `edge-${index}-${edge.source}-${edge.target}`,
            source: edge.source,
            target: edge.target,
        })),
    };
}

function makeDirectedLayers(nodes, edges) {
    const indegree = Object.fromEntries(nodes.map((node) => [node, 0]));
    const adjacency = Object.fromEntries(nodes.map((node) => [node, []]));

    edges.forEach(({ source, target }) => {
        adjacency[source].push(target);
        indegree[target] += 1;
    });

    const queue = nodes.filter((node) => indegree[node] === 0);
    const depth = Object.fromEntries(nodes.map((node) => [node, 0]));

    while (queue.length) {
        const current = queue.shift();
        adjacency[current].forEach((neighbor) => {
            depth[neighbor] = Math.max(depth[neighbor], depth[current] + 1);
            indegree[neighbor] -= 1;
            if (indegree[neighbor] === 0) queue.push(neighbor);
        });
    }

    const levels = {};
    nodes.forEach((node) => {
        const level = depth[node];
        if (!levels[level]) levels[level] = [];
        levels[level].push(node);
    });

    return {
        nodes: nodes.map((node) => {
            const level = depth[node];
            const sameLevel = levels[level];
            const index = sameLevel.indexOf(node);
            return {
                id: node,
                label: node,
                position: {
                    x: 120 + level * 210,
                    y: 120 + index * 130,
                },
            };
        }),
        edges: edges.map((edge, index) => ({
            id: `edge-${index}-${edge.source}-${edge.target}`,
            source: edge.source,
            target: edge.target,
        })),
    };
}

function buildBfsSteps({ nodes, edges, start }) {
    const adjacency = Object.fromEntries(nodes.map((node) => [node, []]));
    edges.forEach(({ source, target }) => {
        adjacency[source].push(target);
        adjacency[target].push(source);
    });
    Object.values(adjacency).forEach((neighbors) => neighbors.sort());

    const layout = makeCircularGraphLayout(nodes, edges);
    const queue = [start];
    const seen = new Set([start]);
    const processed = [];
    const steps = [
        makeStep(`Start BFS from node ${start}. Put it into the queue first.`, 0, {
            layout,
            current: null,
            queued: [...queue],
            processed: [...processed],
            activeEdge: null,
        }, [
            { label: 'Queue', value: queue.join(' → ') },
        ]),
    ];

    while (queue.length) {
        const current = queue.shift();
        processed.push(current);

        steps.push(makeStep(
            `Visit ${current}. BFS always removes the oldest node in the queue first.`,
            2,
            {
                layout,
                current,
                queued: [...queue],
                processed: [...processed],
                activeEdge: null,
            },
            [
                { label: 'Visited Order', value: processed.join(' → ') },
            ],
        ));

        adjacency[current].forEach((neighbor) => {
            steps.push(makeStep(
                `Check edge ${current} → ${neighbor}. If the node has not been seen, enqueue it.`,
                3,
                {
                    layout,
                    current,
                    queued: [...queue],
                    processed: [...processed],
                    activeEdge: { source: current, target: neighbor },
                },
            ));

            if (!seen.has(neighbor)) {
                seen.add(neighbor);
                queue.push(neighbor);
                steps.push(makeStep(
                    `${neighbor} was unvisited, so it joins the queue behind the earlier nodes.`,
                    4,
                    {
                        layout,
                        current,
                        queued: [...queue],
                        processed: [...processed],
                        activeEdge: { source: current, target: neighbor },
                    },
                    [
                        { label: 'Queue', value: queue.join(' → ') },
                    ],
                ));
            }
        });
    }

    steps.push(makeStep('The queue is empty, so BFS traversal is finished.', 5, {
        layout,
        current: null,
        queued: [],
        processed: [...processed],
        activeEdge: null,
    }));

    return steps;
}

function buildDfsSteps({ nodes, edges, start }) {
    const adjacency = Object.fromEntries(nodes.map((node) => [node, []]));
    edges.forEach(({ source, target }) => {
        adjacency[source].push(target);
        adjacency[target].push(source);
    });
    Object.values(adjacency).forEach((neighbors) => neighbors.sort().reverse());

    const layout = makeCircularGraphLayout(nodes, edges);
    const stack = [start];
    const seen = new Set();
    const processed = [];
    const steps = [
        makeStep(`Start DFS from node ${start}. Push it onto the stack.`, 0, {
            layout,
            current: null,
            queued: [...stack],
            processed: [...processed],
            activeEdge: null,
        }, [
            { label: 'Stack', value: stack.join(' → ') },
        ]),
    ];

    while (stack.length) {
        const current = stack.pop();
        if (seen.has(current)) continue;
        seen.add(current);
        processed.push(current);

        steps.push(makeStep(
            `Pop ${current} from the stack and visit it. DFS dives as deep as possible before backtracking.`,
            2,
            {
                layout,
                current,
                queued: [...stack],
                processed: [...processed],
                activeEdge: null,
            },
            [
                { label: 'Visited Order', value: processed.join(' → ') },
            ],
        ));

        adjacency[current].forEach((neighbor) => {
            steps.push(makeStep(
                `Inspect edge ${current} → ${neighbor}. Unvisited neighbors are pushed onto the stack.`,
                3,
                {
                    layout,
                    current,
                    queued: [...stack],
                    processed: [...processed],
                    activeEdge: { source: current, target: neighbor },
                },
            ));

            if (!seen.has(neighbor)) {
                stack.push(neighbor);
                steps.push(makeStep(
                    `${neighbor} is now on the stack, ready for a deeper traversal branch.`,
                    4,
                    {
                        layout,
                        current,
                        queued: [...stack],
                        processed: [...processed],
                        activeEdge: { source: current, target: neighbor },
                    },
                    [
                        { label: 'Stack', value: [...stack].reverse().join(' → ') },
                    ],
                ));
            }
        });
    }

    steps.push(makeStep('The stack is empty, so DFS traversal is complete.', 5, {
        layout,
        current: null,
        queued: [],
        processed: [...processed],
        activeEdge: null,
    }));

    return steps;
}

function buildTopoSteps({ nodes, edges }) {
    const adjacency = Object.fromEntries(nodes.map((node) => [node, []]));
    const indegree = Object.fromEntries(nodes.map((node) => [node, 0]));

    edges.forEach(({ source, target }) => {
        adjacency[source].push(target);
        indegree[target] += 1;
    });

    const layout = makeDirectedLayers(nodes, edges);
    const queue = nodes.filter((node) => indegree[node] === 0).sort();
    const processed = [];
    const steps = [
        makeStep('Topological Sort starts by collecting every node whose indegree is 0.', 0, {
            layout,
            current: null,
            queued: [...queue],
            processed: [...processed],
            zeroIndegree: [...queue],
            activeEdge: null,
        }, [
            { label: 'Ready Nodes', value: queue.join(', ') },
        ]),
    ];

    while (queue.length) {
        const current = queue.shift();
        processed.push(current);

        steps.push(makeStep(
            `${current} has indegree 0, so it is safe to place next in the topological order.`,
            2,
            {
                layout,
                current,
                queued: [...queue],
                processed: [...processed],
                zeroIndegree: [...queue],
                activeEdge: null,
            },
            [
                { label: 'Topological Order', value: processed.join(' → ') },
            ],
        ));

        adjacency[current].forEach((neighbor) => {
            indegree[neighbor] -= 1;
            steps.push(makeStep(
                `Remove edge ${current} → ${neighbor}. That reduces indegree(${neighbor}) to ${indegree[neighbor]}.`,
                3,
                {
                    layout,
                    current,
                    queued: [...queue],
                    processed: [...processed],
                    zeroIndegree: nodes.filter((node) => indegree[node] === 0 && !processed.includes(node) && !queue.includes(node)),
                    activeEdge: { source: current, target: neighbor },
                },
                [
                    { label: 'Indegree', value: `${neighbor}: ${indegree[neighbor]}` },
                ],
            ));

            if (indegree[neighbor] === 0) {
                queue.push(neighbor);
                queue.sort();
                steps.push(makeStep(
                    `${neighbor} now has indegree 0, so it joins the ready queue.`,
                    4,
                    {
                        layout,
                        current,
                        queued: [...queue],
                        processed: [...processed],
                        zeroIndegree: [...queue],
                        activeEdge: { source: current, target: neighbor },
                    },
                    [
                        { label: 'Ready Queue', value: queue.join(' → ') },
                    ],
                ));
            }
        });
    }

    steps.push(makeStep('All nodes are processed, so the topological ordering is complete.', 5, {
        layout,
        current: null,
        queued: [],
        processed: [...processed],
        zeroIndegree: [],
        activeEdge: null,
    }));

    return steps;
}

export const algorithmRegistry = [
    {
        id: 'bubble-sort',
        name: 'Bubble Sort',
        badge: '10 nums',
        category: 'Sorting',
        renderer: 'sorting',
        shortDescription: 'Adjacent swaps bubble the largest value to the end each pass.',
        description: 'Compare neighboring values, swap when the left one is larger, and gradually grow a sorted suffix on the right.',
        inputLabel: 'Comma-separated numbers',
        inputHelper: 'Use exactly 10 numbers for a stable side-by-side animation.',
        defaultInput: '42, 17, 63, 8, 29, 55, 11, 91, 34, 26',
        randomizeInput: () => randomNumberArray(10),
        parseInput: (rawInput) => parseNumberArray(rawInput, { min: 10, max: 10 }),
        buildSteps: buildBubbleSortSteps,
        pseudocode: ['repeat for each pass', 'for i from 0 to end - 1', 'compare a[i] and a[i + 1]', 'if a[i] > a[i + 1], swap them', 'mark the last position as sorted', 'finish when every pass is done'],
        legend: [{ label: 'Comparing', color: '#f59e0b' }, { label: 'Swapping', color: '#f43f5e' }, { label: 'Sorted', color: '#10b981' }],
    },
    {
        id: 'selection-sort',
        name: 'Selection Sort',
        badge: '10 nums',
        category: 'Sorting',
        renderer: 'sorting',
        shortDescription: 'Each pass selects the smallest remaining value for the next slot.',
        description: 'Scan the unsorted suffix, find the minimum, and swap it into the next position of the sorted prefix.',
        inputLabel: 'Comma-separated numbers',
        inputHelper: 'Use exactly 10 numbers to keep the selection passes readable.',
        defaultInput: '58, 14, 73, 9, 41, 67, 22, 35, 88, 19',
        randomizeInput: () => randomNumberArray(10),
        parseInput: (rawInput) => parseNumberArray(rawInput, { min: 10, max: 10 }),
        buildSteps: buildSelectionSortSteps,
        pseudocode: ['for start from 0 to n - 1', 'set minIndex = start', 'scan the unsorted suffix', 'if a[j] is smaller, update minIndex', 'swap a[start] with a[minIndex]', 'grow the sorted prefix'],
        legend: [{ label: 'Scanning', color: '#f59e0b' }, { label: 'Swap', color: '#f43f5e' }, { label: 'Sorted Prefix', color: '#10b981' }],
    },
    {
        id: 'insertion-sort',
        name: 'Insertion Sort',
        badge: '10 nums',
        category: 'Sorting',
        renderer: 'sorting',
        shortDescription: 'Build a sorted prefix by sliding the key into the correct slot.',
        description: 'Treat the left side as sorted and insert each new key into its proper position by shifting larger values right.',
        inputLabel: 'Comma-separated numbers',
        inputHelper: 'Use exactly 10 numbers so the shift animation stays legible.',
        defaultInput: '33, 12, 70, 25, 18, 64, 9, 56, 41, 27',
        randomizeInput: () => randomNumberArray(10),
        parseInput: (rawInput) => parseNumberArray(rawInput, { min: 10, max: 10 }),
        buildSteps: buildInsertionSortSteps,
        pseudocode: ['start with the first value as sorted', 'pick the next key', 'compare key with values to its left', 'shift larger values right', 'insert the key into the gap'],
        legend: [{ label: 'Current Key', color: '#f59e0b' }, { label: 'Shifting', color: '#f43f5e' }, { label: 'Sorted Prefix', color: '#10b981' }],
    },
    {
        id: 'merge-sort',
        name: 'Merge Sort',
        badge: '8 nums',
        category: 'Sorting',
        renderer: 'merge',
        shortDescription: 'Split into halves, sort recursively, then merge in order.',
        description: 'Watch the full array split into smaller and smaller halves, then merge back upward into a fully sorted array.',
        inputLabel: 'Comma-separated numbers',
        inputHelper: 'Use exactly 8 numbers so the split tree remains clean and easy to follow.',
        defaultInput: '48, 12, 79, 31, 6, 54, 25, 63',
        randomizeInput: () => randomNumberArray(8),
        parseInput: (rawInput) => parseNumberArray(rawInput, { min: 8, max: 8 }),
        buildSteps: buildMergeSortSteps,
        pseudocode: ['start with the entire array', 'if size is 1, return', 'split array into left and right halves', 'compare front values while merging', 'append leftovers after one side finishes', 'return the merged sorted segment', 'repeat until the full array is merged'],
        legend: [{ label: 'Active Segment', color: '#f59e0b' }, { label: 'Merged Output', color: '#10b981' }],
    },
    {
        id: 'tower-of-hanoi',
        name: 'Tower Of Hanoi',
        badge: '3-6 disks',
        category: 'Recursion',
        renderer: 'hanoi',
        shortDescription: 'Recursive disk moves show how a big problem becomes smaller ones.',
        description: 'See recursive subproblems unfold as disks move between pegs while always keeping smaller disks above larger ones.',
        inputLabel: 'Disk count',
        inputHelper: 'Use a single number from 3 to 6.',
        defaultInput: '4',
        randomizeInput: () => `${Math.floor(Math.random() * 4) + 3}`,
        parseInput: parseDiskCount,
        buildSteps: buildHanoiSteps,
        pseudocode: ['if n == 1, move the disk', 'move n - 1 disks to helper', 'move the largest disk to target', 'move n - 1 disks from helper to target', 'finish when all disks reach target'],
        legend: [{ label: 'Active Move', color: '#f59e0b' }, { label: 'Stable Disk', color: '#8b5cf6' }],
    },
    {
        id: 'tree-bfs',
        name: 'Tree Level Order',
        badge: '7-15 nodes',
        category: 'Tree',
        renderer: 'tree',
        shortDescription: 'Traverse the tree layer by layer using a queue.',
        description: 'Nodes are visited breadth-first from top to bottom, with the queue making each next layer explicit.',
        inputLabel: 'Level-order values',
        inputHelper: 'Use 7 to 15 comma-separated values representing a complete tree style layout.',
        defaultInput: '10, 6, 15, 3, 8, 12, 18',
        randomizeInput: () => randomNumberArray(7),
        parseInput: parseTreeInput,
        buildSteps: buildTreeBfsSteps,
        pseudocode: ['enqueue the root', 'while the queue is not empty', 'dequeue and visit the front node', 'enqueue its left and right children', 'finish when the queue becomes empty'],
        legend: [{ label: 'Current Node', color: '#f59e0b' }, { label: 'Visited', color: '#10b981' }, { label: 'Queued', color: '#8b5cf6' }],
    },
    {
        id: 'graph-bfs',
        name: 'Graph BFS',
        badge: '5-8 nodes',
        category: 'Graph',
        renderer: 'graph',
        directed: false,
        shortDescription: 'A queue explores outward from the start node in layers.',
        description: 'Breadth-first search radiates across the graph one layer at a time, clearly showing queue growth and edge exploration.',
        inputLabel: 'Edge list + start node',
        inputHelper: 'Use one undirected edge per line like "A B", then add "start: A" on the last line.',
        defaultInput: 'A B\nA C\nB D\nB E\nC F\nE G\nF G\nstart: A',
        randomizeInput: () => 'A B\nA C\nB D\nC E\nD F\nE G\nF H\nstart: A',
        parseInput: (rawInput) => parseGraphInput(rawInput, false),
        buildSteps: buildBfsSteps,
        pseudocode: ['enqueue the start node', 'mark it as seen', 'dequeue and visit a node', 'inspect each neighbor', 'enqueue unseen neighbors', 'finish when the queue is empty'],
        legend: [{ label: 'Current Node', color: '#f59e0b' }, { label: 'Queued', color: '#8b5cf6' }, { label: 'Visited', color: '#10b981' }],
    },
    {
        id: 'graph-dfs',
        name: 'Graph DFS',
        badge: '5-8 nodes',
        category: 'Graph',
        renderer: 'graph',
        directed: false,
        shortDescription: 'A stack pushes the traversal deeper before it backtracks.',
        description: 'Depth-first search dives through one branch first, showing how the stack drives deep exploration and later backtracking.',
        inputLabel: 'Edge list + start node',
        inputHelper: 'Use one undirected edge per line like "A B", then add "start: A" on the last line.',
        defaultInput: 'A B\nA C\nB D\nB E\nC F\nE G\nF G\nstart: A',
        randomizeInput: () => 'A B\nA C\nB D\nC E\nD F\nE G\nF H\nstart: A',
        parseInput: (rawInput) => parseGraphInput(rawInput, false),
        buildSteps: buildDfsSteps,
        pseudocode: ['push the start node onto the stack', 'while the stack is not empty', 'pop and visit a node', 'inspect each neighbor', 'push unseen neighbors', 'finish when the stack is empty'],
        legend: [{ label: 'Current Node', color: '#f59e0b' }, { label: 'On Stack', color: '#8b5cf6' }, { label: 'Visited', color: '#10b981' }],
    },
    {
        id: 'topological-sort',
        name: 'Topological Sort',
        badge: '6-8 DAG nodes',
        category: 'Graph',
        renderer: 'graph',
        directed: true,
        shortDescription: 'Kahn’s algorithm repeatedly removes zero-indegree nodes.',
        description: 'Visualize how indegrees shrink in a DAG and how the valid linear ordering is built one zero-indegree node at a time.',
        inputLabel: 'Directed edges',
        inputHelper: 'Use one directed edge per line like "A>B". Keep it a DAG.',
        defaultInput: 'A>B\nA>C\nB>D\nC>D\nC>E\nD>F\nE>F',
        randomizeInput: () => 'A>B\nA>C\nB>E\nC>D\nD>F\nE>F',
        parseInput: (rawInput) => parseGraphInput(rawInput, true),
        buildSteps: buildTopoSteps,
        pseudocode: ['compute indegree of every node', 'enqueue all zero-indegree nodes', 'remove one zero-indegree node', 'append it to the answer', 'reduce indegree of its outgoing neighbors', 'enqueue any neighbor that becomes zero'],
        legend: [{ label: 'Current Node', color: '#f59e0b' }, { label: 'Ready (0 indegree)', color: '#38bdf8' }, { label: 'Output Order', color: '#10b981' }],
    },
];
