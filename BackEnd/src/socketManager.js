import Match from './models/match.js';
import { redisClient } from './config/redis.js';
import { buildLeaderboard, completeMatch, shouldAutoCompleteMatch } from './utils/matchLifecycle.js';

export const setupSocket = (io) => {
    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);
      
      socket.on("authenticate", (userId) => {
          socket.userId = userId;
          socket.join(userId);
          console.log(`Socket ${socket.id} authenticated as ${userId}`);
      });
  
      socket.on("joinRoom", (matchId) => {
        socket.join(matchId);
        console.log(`Socket ${socket.id} joined room ${matchId}`);
      });
  
      socket.on("startGame", async (matchId) => {
          try {
              if (!socket.userId) return; // Must be authenticated

              // Atomically start the game if not already ongoing, ensuring only one client triggers this
              const match = await Match.findOneAndUpdate(
                  { matchId, status: { $ne: 'Ongoing' }, hostId: socket.userId },
                  { 
                      status: 'Ongoing', 
                      startTime: new Date() 
                  },
                  { new: true }
              ).populate("participants.userId", "firstName lastName profilePicture rating rank");

              if (match) {
                  const durationMs = (match.settings.durationMinutes || 60) * 60 * 1000;
                  match.endTime = new Date(Date.now() + durationMs);
                  await match.save();
                  io.to(matchId).emit("gameStarted", { match });

                  setTimeout(async () => {
                     const checkMatch = await Match.findOne({ matchId });
                     if (checkMatch && checkMatch.status === 'Ongoing') {
                         const completed = await completeMatch(matchId);
                         if (completed) {
                            io.to(matchId).emit("gameEnded", {
                              participants: completed.participants,
                              leaderboard: buildLeaderboard(completed),
                            });
                         }
                     }
                  }, durationMs);
              }
          } catch (err) {
              console.error("startGame Socket Error:", err);
          }
      });

      socket.on("forfeitMatch", async ({ matchId }, callback) => {
          try {
              if (!socket.userId) return;

              const match = await Match.findOne({ matchId, status: 'Ongoing' }).populate("participants.userId", "firstName lastName profilePicture rating rank");

              if (match) {
                  const participant = match.participants.find((p) => p.userId._id.toString() === socket.userId.toString());
                  if (!participant) return;
                  participant.status = "Forfeited";
                  participant.finalSubmittedAt = new Date();
                  await match.save();

                  if (match.type === "Ranked" || shouldAutoCompleteMatch(match)) {
                    const completed = await completeMatch(matchId);
                    if (completed) {
                      io.to(matchId).emit("gameEnded", {
                        participants: completed.participants,
                        leaderboard: buildLeaderboard(completed),
                        forfeitedBy: socket.userId
                      });
                    }
                  } else {
                    io.to(matchId).emit("leaderboardUpdate", {
                      participants: match.participants,
                      leaderboard: buildLeaderboard(match),
                      forfeitedBy: socket.userId
                    });
                  }
                  callback?.({ ok: true });
                  return;
              }
              callback?.({ ok: false, error: "Match not found or not active" });
          } catch (err) {
              console.error("forfeitMatch Socket Error:", err);
              callback?.({ ok: false, error: "Failed to forfeit match" });
          }
      });

      socket.on("submitContest", async ({ matchId }, callback) => {
          try {
              if (!socket.userId) {
                  callback?.({ ok: false, error: "User not authenticated" });
                  return;
              }

              const match = await Match.findOne({ matchId }).populate("participants.userId", "firstName lastName profilePicture rating rank");
              if (!match) {
                  callback?.({ ok: false, error: "Match not found" });
                  return;
              }
              if (match.status !== "Ongoing") {
                  callback?.({ ok: false, error: "Battle is not active" });
                  return;
              }

              const participant = match.participants.find((p) => p.userId._id.toString() === socket.userId.toString());
              if (!participant) {
                  callback?.({ ok: false, error: "You are not part of this battle" });
                  return;
              }

              participant.status = "Finished";
              participant.finalSubmittedAt = participant.finalSubmittedAt || new Date();
              await match.save();

              if (shouldAutoCompleteMatch(match)) {
                  const completed = await completeMatch(matchId);
                  if (completed) {
                      io.to(matchId).emit("gameEnded", {
                          participants: completed.participants,
                          leaderboard: buildLeaderboard(completed),
                      });
                  }
                  callback?.({ ok: true, message: "Battle completed successfully" });
                  return;
              }

              io.to(matchId).emit("leaderboardUpdate", {
                  participants: match.participants,
                  leaderboard: buildLeaderboard(match),
              });
              callback?.({ ok: true, message: "Contest submitted successfully" });
          } catch (err) {
              console.error("submitContest Socket Error:", err);
              callback?.({ ok: false, error: "Failed to submit contest" });
          }
      });
  
      socket.on("disconnect", async () => {
        console.log("Client disconnected:", socket.id);
        if (socket.userId) {
            try {
                // Redis v4 array syntax for zRem
                await redisClient.zRem("ranked_queue", [socket.userId.toString()]);
            } catch (err) {
                console.error("Redis queue cleanup error:", err);
            }
        }
      });
    });
};
