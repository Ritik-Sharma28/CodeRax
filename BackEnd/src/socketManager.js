import Match from './models/match.js';
import { redisClient } from './config/redis.js';
import { buildLeaderboard, completeMatch, shouldAutoCompleteMatch } from './utils/matchLifecycle.js';
import { removeUserFromRankedQueue } from './utils/rankedQueue.js';

const activeSocketsByUser = new Map();
const disconnectCleanupTimers = new Map();
const DISCONNECT_QUEUE_GRACE_MS = 15000;

const trackAuthenticatedSocket = (userId, socketId) => {
  const normalizedUserId = String(userId);
  const existingTimer = disconnectCleanupTimers.get(normalizedUserId);
  if (existingTimer) {
    clearTimeout(existingTimer);
    disconnectCleanupTimers.delete(normalizedUserId);
  }

  const socketIds = activeSocketsByUser.get(normalizedUserId) || new Set();
  socketIds.add(socketId);
  activeSocketsByUser.set(normalizedUserId, socketIds);
};

const untrackSocket = (userId, socketId) => {
  const normalizedUserId = String(userId);
  const socketIds = activeSocketsByUser.get(normalizedUserId);
  if (!socketIds) return true;

  socketIds.delete(socketId);
  if (socketIds.size === 0) {
    activeSocketsByUser.delete(normalizedUserId);
    return true;
  }

  activeSocketsByUser.set(normalizedUserId, socketIds);
  return false;
};

export const setupSocket = (io) => {
    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);
      
      socket.on("authenticate", (userId) => {
          if (socket.userId && socket.userId.toString() !== userId.toString()) {
            untrackSocket(socket.userId, socket.id);
          }
          socket.userId = userId;
          trackAuthenticatedSocket(userId, socket.id);
          socket.join(userId);
          console.log(`Socket ${socket.id} authenticated as ${userId}`);
      });
  
      socket.on("joinRoom", async (matchId) => {
        socket.join(matchId);
        console.log(`Socket ${socket.id} joined room ${matchId}`);

        try {
          const match = await Match.findOne({ matchId }).populate("participants.userId", "firstName lastName profilePicture rating rank");
          if (match) {
            const snapshot = {
              match: {
                ...match.toObject(),
                leaderboard: buildLeaderboard(match),
              },
            };
            // Broadcast to ALL sockets in the room (including host) so
            // everyone's participant list stays in sync without polling.
            io.to(matchId).emit("roomSnapshot", snapshot);
          }
        } catch (err) {
          console.error("joinRoom Socket Error:", err);
        }
      });
  
      socket.on("startGame", async (matchId, callback) => {
          try {
              if (!socket.userId) {
                  callback?.({ ok: false, error: "User not authenticated" });
                  return;
              }

              const existingMatch = await Match.findOne({ matchId }).populate("participants.userId", "firstName lastName profilePicture rating rank");
              if (!existingMatch) {
                  callback?.({ ok: false, error: "Match not found" });
                  return;
              }

              const isParticipant = existingMatch.participants.some(p => p.userId._id.toString() === socket.userId.toString() || p.userId.toString() === socket.userId.toString());
              if (!isParticipant) {
                  callback?.({ ok: false, error: "You are not a participant in this match" });
                  return;
              }

              if (existingMatch.type !== "Ranked" && existingMatch.hostId.toString() !== socket.userId.toString()) {
                  callback?.({ ok: false, error: "Only the host can start this match" });
                  return;
              }

              if (existingMatch.status !== "Waiting") {
                  callback?.({ ok: false, error: "Match has already started" });
                  return;
              }

              if ((existingMatch.participants?.length || 0) < 2) {
                  callback?.({ ok: false, error: "At least 2 players are required to start" });
                  return;
              }

              const query = { matchId, status: 'Waiting', "participants.1": { $exists: true } };
              if (existingMatch.type !== "Ranked") {
                  query.hostId = socket.userId;
              }

              const match = await Match.findOneAndUpdate(
                  query,
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
                   io.to(matchId).emit("roomSnapshot", {
                     match: {
                       ...match.toObject(),
                       leaderboard: buildLeaderboard(match),
                     },
                   });
                   callback?.({ ok: true });

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
                   return;
               }
               callback?.({ ok: false, error: "Failed to start match" });
          } catch (err) {
               console.error("startGame Socket Error:", err);
               callback?.({ ok: false, error: "Failed to start match" });
          }
      });

      socket.on("forfeitMatch", async ({ matchId, userId }, callback) => {
          try {
              const actingUserId = socket.userId || userId;
              if (!actingUserId) {
                  callback?.({ ok: false, error: "User not authenticated" });
                  return;
              }

              const match = await Match.findOne({ matchId, status: 'Ongoing' }).populate("participants.userId", "firstName lastName profilePicture rating rank");

              if (match) {
                  const participant = match.participants.find((p) => p.userId._id.toString() === actingUserId.toString());
                  if (!participant) {
                      callback?.({ ok: false, error: "Participant not found" });
                      return;
                  }
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
            const shouldScheduleCleanup = untrackSocket(socket.userId, socket.id);
            if (shouldScheduleCleanup && redisClient.isReady) {
                const normalizedUserId = String(socket.userId);
                const cleanupTimer = setTimeout(async () => {
                    disconnectCleanupTimers.delete(normalizedUserId);
                    if (activeSocketsByUser.has(normalizedUserId) || !redisClient.isReady) {
                        return;
                    }

                    try {
                        await removeUserFromRankedQueue(redisClient, normalizedUserId);
                    } catch (err) {
                        console.error("Redis queue cleanup error:", err);
                    }
                }, DISCONNECT_QUEUE_GRACE_MS);

                disconnectCleanupTimers.set(normalizedUserId, cleanupTimer);
            }
        }
      });
    });
};
