import { executeBatch } from "./execute.js";
import { combineExpected } from "./inputBuilder/combineExpected.js";
import { compareOutput } from "./outputComparator/compare.js";

export const runJudge = async ({ language, code, testCases, problemSignature, judgeConfig = {} }) => {
    try {
        const execution = await executeBatch({ language, code, testCases, problemSignature });


        if (!execution.success) {

            let verdict = "Runtime Error";
            if (execution.error.includes("Time Limit")) verdict = "Time Limit Exceeded";
            else if (execution.error.includes("Compilation")) verdict = "Compilation Error";

            return {
                verdict: verdict,
                passed: false,
                details: execution.error,
                rawResponse: execution.rawResponse
            };
        }

        const actualOutput = execution.output;

        //  Prepare Expected Output
        const expectedOutputs = testCases.map(tc => tc.output);
        const expectedOutput = combineExpected(expectedOutputs);

        // Compare Output
        const comparisonResult = compareOutput(actualOutput, expectedOutput, {
            mode: judgeConfig.outputMode || "token",
            floatTolerance: judgeConfig.floatTolerance ?? 0.000001
        });

        let passed = comparisonResult.passed;
        let details = comparisonResult;

        // Map failedIndex 
        const inputs = testCases.map(tc => tc.input);
        if (!passed && details.failedIndex !== undefined && details.failedIndex !== -1) {
            if (details.failedIndex < inputs.length) {
                details.input = inputs[details.failedIndex];
            }
        }

        return {
            verdict: passed ? "Accepted" : "Wrong Answer",
            passed: passed,
            details: details,
            actualOutput: actualOutput,
            expectedOutput: expectedOutput,
            rawResponse: execution.rawResponse
        };

    } catch (error) {
        throw new Error(`Judge execution failed: ${error.message}`);
    }
};
