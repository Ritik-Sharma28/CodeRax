import Match from './models/match.js';
import { redisClient } from './config/redis.js';

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
                  io.to(matchId).emit("gameStarted", { match });
                  
                  // Optional: calculate endTime and save it if needed, or rely on durationMinutes
                  const durationMs = (match.settings.durationMinutes || 60) * 60 * 1000;
                  match.endTime = new Date(Date.now() + durationMs);
                  await match.save();

                  setTimeout(async () => {
                     const checkMatch = await Match.findOne({ matchId });
                     if (checkMatch && checkMatch.status === 'Ongoing') {
                         checkMatch.status = 'Completed';
                         await checkMatch.save();
                         io.to(matchId).emit("gameEnded", { participants: checkMatch.participants });
                     }
                  }, durationMs);
              }
          } catch (err) {
              console.error("startGame Socket Error:", err);
          }
      });

      socket.on("forfeitMatch", async ({ matchId }) => {
          try {
              if (!socket.userId) return;
              
              const match = await Match.findOneAndUpdate(
                  { matchId, status: 'Ongoing' },
                  { status: 'Completed' },
                  { new: true }
              ).populate("participants.userId", "firstName lastName profilePicture rating rank");

              if (match) {
                  io.to(matchId).emit("gameEnded", { participants: match.participants, forfeitedBy: socket.userId });
              }
          } catch (err) {
              console.error("forfeitMatch Socket Error:", err);
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
