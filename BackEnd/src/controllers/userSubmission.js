import Problem from "../models/problem.js";
import { runJudge } from "../judge1/submission.js";
import { Submission } from "../models/submission.js";
import { runTest } from "../judge1/run.js";
import Match from "../models/match.js";

export const submitCode = async (req, res) => {
    try {
        const userId = req.result._id
        const problemId = req.params.id

        const { code, language } = req.body;

        if (!userId || !code || !problemId || !language) {
            return res.status(400).send("Some field missing");
        }
        const problem = await Problem.findById(problemId);

        const problemSignature = problem.problemSignature
        const { visibleTestCases, hiddenTestCases } = problem


        const allTestCases = [...visibleTestCases, ...hiddenTestCases];

        const result = await runJudge({
            language,
            code: code,
            testCases: allTestCases,
            problemSignature: problemSignature
        });
        //console.log(result)
        const submittedResult = await Submission.create({
            userId,
            problemId,
            code,
            language,
            memory : result.rawResponse?.memory,
            runtime : result.rawResponse?.time ,
            status: result.verdict,
            testCasesTotal: result.details?.totalCases || 0,
            errorMessage: result.rawResponse?.error || null,
            testCasesPassed: result.details?.testCasesPassed || 0

        });

        // --- BATTLE ENGINE LOGIC ---
        try {
            const match = await Match.findOne({
                "participants.userId": userId,
                status: "Ongoing"
            }).populate("participants.userId", "firstName lastName profilePicture rating rank");

            if (match) {
                const participant = match.participants.find(p => p.userId._id.toString() === userId.toString());
                const problemStat = participant?.problemStats.find(p => p.problemId.toString() === problemId.toString());

                if (participant && problemStat && !problemStat.solved) {
                    if (result.verdict === 'Accepted') {
                        problemStat.solved = true;
                        
                        // Calculate time: duration from match.updatedAt when status went Ongoing
                        const startTime = match.startTime || match.updatedAt;
                        const timeTakenMinutes = Math.max(0, Math.floor((new Date() - new Date(startTime)) / 60000));
                        problemStat.timeTakenMinutes = timeTakenMinutes;
                        
                        // ICPC Penalty: actual time + (failedAttempts * 20 min)
                        const penalty = problemStat.failedAttempts * 20;
                        participant.totalTimeMinutes += (timeTakenMinutes + penalty);
                        participant.totalScore += 1;
                        
                        await match.save();
                        
                        // Check win condition
                        const allSolved = participant.problemStats.every(ps => ps.solved);
                        if (allSolved && match.type === 'Ranked') {
                            match.status = 'Completed';
                            match.endTime = new Date();
                            await match.save();
                            
                            if (req.io) {
                                req.io.to(match.matchId).emit('gameEnded', { 
                                    participants: match.participants, 
                                    winner: userId 
                                });
                            }
                        } else {
                            // Emit Live Leaderboard update if game hasn't ended
                            if (req.io) {
                                req.io.to(match.matchId).emit("leaderboardUpdate", { participants: match.participants });
                            }
                        }
                    } else {
                        // Wrong answer, TLE, RE, etc.
                        problemStat.failedAttempts += 1;
                        await match.save();
                    }
                }
            }
        } catch (matchErr) {
            console.error("Match stats update failed:", matchErr);
        }
        // ---------------------------

        res.send(result)

    } catch (err) {
        res.send("Error occured in submitting the problem " + err)
    }
}

export const runCode = async (req, res) => {
    try {
        const { code, language, input } = req.body;

        if (!code || !language || !input) {
            return res.status(400).send("Missing required fields: code, language, input");
        }
        const problemId = req.params.id
        let problem = null;
        if (problemId) {
            problem = await Problem.findById(problemId);
        }

        if (!problem) {
            return res.status(404).send("Problem not found");
        }

        const problemSignature = problem.problemSignature;

        const result = await runTest({
            language,
            code,
            input,
            problemSignature,
            referenceSolution: problem.referenceSolution
        });

        res.json(result);

    } catch (err) {
        res.status(500).send("Error in running code: " + err.message);
    }
}


export const getSubmissions = async (req, res) => {
    try {
        const userId = req.result._id;
        const problemId = req.params.id;

        if (!userId || !problemId) {
            return res.status(400).send("Missing userId or problemId");
        }

        const submissions = await Submission.find({ userId, problemId })
            .sort({ createdAt: -1 })
            .limit(20);

        res.json(submissions);
    } catch (err) {
        res.status(500).send("Error fetching submissions: " + err.message);
    }
};
