import { redisClient } from "../config/redis.js";
import Match from "../models/match.js";
import Problem from "../models/problem.js";
import crypto from "crypto";
import { parseQueueEntryValue, RANKED_QUEUE_KEY, setPendingMatch } from "../utils/rankedQueue.js";
import { startMatchHelper } from "../utils/matchLifecycle.js";
// Need `io` reference, we can export it from server or pass it to a init function.
let io; 

export const initMatchmaker = (socketIo) => {
    io = socketIo;
    console.log("Matchmaker worker started...");
    
    setInterval(async () => {
        try {
            if (!redisClient.isReady) {
                return;
            }

            // Get all players in queue sorted by rating
            const queue = await redisClient.zRangeWithScores(RANKED_QUEUE_KEY, 0, -1);
            if (queue.length < 2) return;

            // Simple greedy matchmaking: check adjacent players
            for (let i = 0; i < queue.length - 1; i++) {
                const player1Str = queue[i].value;
                const player2Str = queue[i+1].value;
                
                const p1Data = parseQueueEntryValue(player1Str);
                const p2Data = parseQueueEntryValue(player2Str);

                // If difference is small enough (e.g. 200)
                if (p1Data?.userId && p2Data?.userId && Math.abs(queue[i].score - queue[i+1].score) <= 200) {
                    // Fetch 1 random problem
                    const randomProblems = await Problem.aggregate([{ $sample: { size: 1 } }]);
                    const selectedProblemId = randomProblems.length > 0 ? randomProblems[0]._id : null;

                    const matchId = crypto.randomBytes(3).toString("hex").toUpperCase();
                    
                    const newMatch = new Match({
                        matchId,
                        type: 'Ranked',
                        hostId: p1Data.userId, // Dummy host
                        status: 'Waiting', 
                        settings: { maxPlayers: 2, durationMinutes: 25 },
                        problems: selectedProblemId ? [selectedProblemId] : [],
                        participants: [
                            {
                                userId: p1Data.userId,
                                status: 'Joined',
                                problemStats: selectedProblemId ? [{ problemId: selectedProblemId }] : []
                            },
                            {
                                userId: p2Data.userId,
                                status: 'Joined',
                                problemStats: selectedProblemId ? [{ problemId: selectedProblemId }] : []
                            }
                        ]
                    });
                    
                    await newMatch.save();
                    await Promise.all([
                        setPendingMatch(redisClient, p1Data.userId, matchId),
                        setPendingMatch(redisClient, p2Data.userId, matchId),
                    ]);

                    // Automatically transition to Ongoing
                    await startMatchHelper(matchId, io);

                    // Remove them from queue using array syntax for v4
                    await redisClient.zRem(RANKED_QUEUE_KEY, [player1Str, player2Str]);

                    // Emit to their personal rooms
                    if (io) {
                        io.to(p1Data.userId).emit("matchFound", { matchId });
                        io.to(p2Data.userId).emit("matchFound", { matchId });
                    }

                    // Removing elements shifts array, so skip next
                    i++; 
                }
            }
        } catch (err) {
            console.error("Matchmaker Error:", err);
        }
    }, 2000); // run every 2 seconds
};
