
import { normalizeOutput } from "./normalize.js";

const toTokens = (line) => line.split(/\s+/).filter(Boolean);

const isNumeric = (token) => /^-?\d+(\.\d+)?$/.test(token);

const compareTokenByToken = (actualLine, expectedLine, options = {}) => {
    const tokensActual = toTokens(actualLine);
    const tokensExpected = toTokens(expectedLine);
    const mode = options.mode || "token";
    const tol = options.floatTolerance ?? 0.000001;

    if (mode === "unorderedTokens") {
        const sortedActual = [...tokensActual].sort();
        const sortedExpected = [...tokensExpected].sort();
        if (sortedActual.length !== sortedExpected.length) return false;
        for (let i = 0; i < sortedExpected.length; i++) {
            if (sortedActual[i] !== sortedExpected[i]) return false;
        }
        return true;
    }

    if (tokensActual.length !== tokensExpected.length) return false;
    for (let i = 0; i < tokensExpected.length; i++) {
        const a = tokensActual[i];
        const e = tokensExpected[i];
        if (mode === "float" && isNumeric(a) && isNumeric(e)) {
            if (Math.abs(Number(a) - Number(e)) > tol) return false;
        } else if (a !== e) {
            return false;
        }
    }
    return true;
};

export const compareOutput = (actual, expected, options = {}) => {
    const cleanActual = normalizeOutput(actual);
    const cleanExpected = normalizeOutput(expected);
    const mode = options.mode || "token";

    if (mode === "exact") {
        const passed = cleanActual === cleanExpected;
        return {
            passed,
            totalCases: 1,
            testCasesPassed: passed ? 1 : 0,
            failedIndex: passed ? -1 : 0,
            userOutput: passed ? null : cleanActual,
            expectedOutput: passed ? null : cleanExpected
        };
    }

    const expectedLines = cleanExpected.length ? cleanExpected.split("\n") : [];
    const actualLines = cleanActual.length ? cleanActual.split("\n") : [];

    for (let i = 0; i < expectedLines.length; i++) {
        if (i >= actualLines.length) {
            return {
                passed: false,
                totalCases: expectedLines.length,
                testCasesPassed: i,
                failedIndex: i,
                userOutput: "End of Output",
                expectedOutput: expectedLines[i]
            };
        }

        const linePassed = compareTokenByToken(actualLines[i], expectedLines[i], options);
        if (!linePassed) {
            return {
                passed: false,
                totalCases: expectedLines.length,
                testCasesPassed: i,
                failedIndex: i,
                userOutput: actualLines[i],
                expectedOutput: expectedLines[i]
            };
        }
    }

    if (actualLines.length > expectedLines.length) {
        return {
            passed: false,
            totalCases: expectedLines.length,
            testCasesPassed: expectedLines.length,
            failedIndex: expectedLines.length,
            userOutput: actualLines[expectedLines.length],
            expectedOutput: "End of Output"
        };
    }

    return {
        passed: true,
        totalCases: expectedLines.length,
        testCasesPassed: expectedLines.length,
        failedIndex: -1,
        userOutput: null,
        expectedOutput: null
    };
};
