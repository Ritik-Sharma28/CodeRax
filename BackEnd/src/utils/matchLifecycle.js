import Match from "../models/match.js";

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
  return match;
};
