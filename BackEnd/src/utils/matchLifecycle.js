import Match from "../models/match.js";
import { redisClient } from "../config/redis.js";
import { clearPendingMatch } from "./rankedQueue.js";

export const getSolvedCount = (participant) =>
  participant.problemStats.filter((p) => p.solved).length;

export const sortParticipants = (participants) =>
  [...participants].sort((a, b) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    const solvedDiff = getSolvedCount(b) - getSolvedCount(a);
    if (solvedDiff !== 0) return solvedDiff;
    if (a.totalTimeMinutes !== b.totalTimeMinutes) {
      return a.totalTimeMinutes - b.totalTimeMinutes;
    }
    const aFinal = a.finalSubmittedAt ? new Date(a.finalSubmittedAt).getTime() : Number.MAX_SAFE_INTEGER;
    const bFinal = b.finalSubmittedAt ? new Date(b.finalSubmittedAt).getTime() : Number.MAX_SAFE_INTEGER;
    return aFinal - bFinal;
  });

export const shouldAutoCompleteMatch = (match) => {
  if (match.status !== "Ongoing") return false;
  const participants = match.participants || [];
  if (participants.length === 0) return false;

  const everyoneSolvedAll = participants.every((participant) =>
    participant.problemStats.every((problem) => problem.solved)
  );
  const everyoneFinalSubmitted = participants.every(
    (participant) => participant.status === "Finished" || participant.status === "Forfeited"
  );

  return everyoneSolvedAll || everyoneFinalSubmitted;
};

export const buildLeaderboard = (match) =>
  sortParticipants(match.participants).map((participant, idx) => ({
    rank: idx + 1,
    userId: participant.userId,
    totalScore: participant.totalScore,
    totalTimeMinutes: participant.totalTimeMinutes,
    solvedCount: getSolvedCount(participant),
    status: participant.status,
    finalSubmittedAt: participant.finalSubmittedAt || null
  }));

export const completeMatch = async (matchId) => {
  const match = await Match.findOne({ matchId }).populate(
    "participants.userId",
    "firstName lastName profilePicture rating rank"
  );
  if (!match) return null;
  if (match.status === "Completed") return match;

  match.status = "Completed";
  match.endTime = new Date();
  await match.save();

  // Clear pending_match Redis keys for ALL participants so they
  // are never redirected back into a finished match.
  if (redisClient?.isReady) {
    for (const p of match.participants) {
      const uid = p.userId?._id || p.userId;
      if (uid) {
        clearPendingMatch(redisClient, uid).catch((err) =>
          console.error("clearPendingMatch error:", err)
        );
      }
    }
  }

  return match;
};

export const startMatchHelper = async (matchId, io, hostId = null) => {
  const existingMatch = await Match.findOne({ matchId }).populate("participants.userId", "firstName lastName profilePicture rating rank");
  if (!existingMatch) return { error: "Match not found" };
  if (existingMatch.status !== "Waiting") return { error: "Match has already started" };
  if ((existingMatch.participants?.length || 0) < 2) return { error: "At least 2 players are required to start" };

  const query = { matchId, status: 'Waiting', "participants.1": { $exists: true } };
  if (hostId && existingMatch.type !== "Ranked") {
      query.hostId = hostId;
  }

  const match = await Match.findOneAndUpdate(
      query,
      { 
          status: 'Ongoing', 
          startTime: new Date() 
      },
      { new: true }
  ).populate("participants.userId", "firstName lastName profilePicture rating rank");

  if (!match) return { error: "Failed to start or unauthorized" };

  const durationMs = (match.settings.durationMinutes || 60) * 60 * 1000;
  match.endTime = new Date(Date.now() + durationMs);
  await match.save();

  if (io) {
      io.to(matchId).emit("gameStarted", { match });
      io.to(matchId).emit("roomSnapshot", {
        match: {
          ...match.toObject(),
          leaderboard: buildLeaderboard(match),
        },
      });
  }

  setTimeout(async () => {
     const checkMatch = await Match.findOne({ matchId });
     if (checkMatch && checkMatch.status === 'Ongoing') {
         const completed = await completeMatch(matchId);
         if (completed && io) {
            io.to(matchId).emit("gameEnded", {
              participants: completed.participants,
              leaderboard: buildLeaderboard(completed),
            });
         }
     }
  }, durationMs);

  return { ok: true, match };
};
