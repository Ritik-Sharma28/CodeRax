import crypto from "crypto";
import Match from "../models/match.js";
import Problem from "../models/problem.js";
import { redisClient } from "../config/redis.js";
import { buildLeaderboard, completeMatch, shouldAutoCompleteMatch } from "../utils/matchLifecycle.js";

const generateMatchId = () => crypto.randomBytes(3).toString("hex").toUpperCase();

export const createMatch = async (req, res) => {
  try {
    const userId = req.result._id;
    const { type = 'Custom', settings, problems = [], randomProblemsDoc = false } = req.body;

    let finalProblems = [...problems];

    if (randomProblemsDoc && settings.randomProblemsCount > 0) {
        const randoms = await Problem.aggregate([{ $sample: { size: settings.randomProblemsCount } }]);
        finalProblems = [...finalProblems, ...randoms.map(r => r._id)];
    }

    const newMatch = new Match({
      matchId: generateMatchId(),
      type,
      hostId: userId,
      status: 'Waiting',
      settings,
      problems: finalProblems,
      participants: [{
        userId,
        status: 'Joined',
        totalScore: 0,
        totalTimeMinutes: 0,
        problemStats: finalProblems.map(p => ({
            problemId: p,
            solved: false,
            failedAttempts: 0,
            timeTakenMinutes: 0
        }))
      }]
    });

    await newMatch.save();

    const populatedMatch = await Match.findById(newMatch._id).populate("participants.userId", "firstName lastName profilePicture rating rank");
    res.status(201).json(populatedMatch);
  } catch (err) {
    console.error("Create Match Error:", err);
    res.status(500).json({ error: "Server error creating match" });
  }
};

export const joinMatch = async (req, res) => {
  try {
    const { matchId } = req.body;
    const userId = req.result._id;

    if (!matchId) return res.status(400).json({ error: "matchId is required" });

    const match = await Match.findOne({ matchId }).populate("participants.userId", "firstName lastName profilePicture rating rank");
    if (!match) return res.status(404).json({ error: "Match not found" });

    let participant = match.participants.find(p => p.userId._id.toString() === userId.toString());

    if (!participant) {
      if (match.status !== 'Waiting') {
          return res.status(400).json({ error: "Match is already ongoing or completed" });
      }

      if (match.participants.length >= match.settings.maxPlayers) {
          return res.status(400).json({ error: "Match is full" });
      }
      match.participants.push({
        userId,
        status: 'Joined',
        totalScore: 0,
        totalTimeMinutes: 0,
        problemStats: match.problems.map(p => ({
            problemId: p,
            solved: false,
            failedAttempts: 0,
            timeTakenMinutes: 0
        }))
      });
      await match.save();
      
      await match.populate("participants.userId", "firstName lastName profilePicture rating rank");
      
      participant = match.participants.find(p => p.userId._id.toString() === userId.toString());

      if (req.io) {
        req.io.to(matchId).emit("playerJoined", { participant, participants: match.participants });
      }
    }

    res.json(match);
  } catch (err) {
    console.error("Join Match Error:", err);
    res.status(500).json({ error: "Server error joining match" });
  }
};

export const queueMatch = async (req, res) => {
  try {
    const userId = req.result._id;
    const { rating = 1200 } = req.body;

    if (!redisClient.isReady) {
      return res.status(503).json({ error: "Matchmaking is temporarily unavailable. Please try again in a moment." });
    }
    
    // Clear any existing entry for this user first
    const existingQueue = await redisClient.zRange("ranked_queue", 0, -1);
    const existingStr = existingQueue.find(str => {
        try {
            const parsed = JSON.parse(str);
            return parsed.userId === userId.toString();
        } catch { return str === userId.toString(); }
    });
    
    if (existingStr) {
        await redisClient.zRem("ranked_queue", [existingStr]);
    }

    const payload = JSON.stringify({ userId: userId.toString(), timestamp: Date.now() });
    await redisClient.zAdd("ranked_queue", [{ score: rating, value: payload }]);
    
    res.json({ message: "Successfully joined Ranked Queue", userId });
  } catch (err) {
    console.error("Matchmaking Queue Error:", err);
    res.status(500).json({ error: "Server error joining queue" });
  }
};

export const cancelQueue = async (req, res) => {
    try {
        const userId = req.result._id;

        if (!redisClient.isReady) {
            return res.status(200).json({ message: "Queue already unavailable" });
        }

        const existingQueue = await redisClient.zRange("ranked_queue", 0, -1);
        const existingStr = existingQueue.find(str => {
            try {
                const parsed = JSON.parse(str);
                return parsed.userId === userId.toString();
            } catch { return str === userId.toString(); }
        });
        
        if (existingStr) {
            await redisClient.zRem("ranked_queue", [existingStr]);
        }
        res.json({ message: "Removed from queue" });
    } catch (err) {
        console.error("Cancel Queue Error:", err);
        res.status(500).json({ error: "Server error cancelling queue" });
    }
};

export const getMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    if (!matchId) return res.status(400).json({ error: "matchId is required" });

    let match = await Match.findOne({ matchId }).populate("participants.userId", "firstName lastName profilePicture rating rank");
    if (!match) return res.status(404).json({ error: "Match not found" });

    // Recovery guard: if timer expired but game is still marked Ongoing, finalize now.
    if (match.status === "Ongoing" && match.endTime && new Date(match.endTime).getTime() <= Date.now()) {
      const completed = await completeMatch(matchId);
      if (completed) {
        match = completed;
      }
    }

    res.json({
      ...match.toObject(),
      leaderboard: buildLeaderboard(match),
    });
  } catch (err) {
    console.error("Get Match Error:", err);
    res.status(500).json({ error: "Server error fetching match" });
  }
};

export const submitFinal = async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.result._id;

    const match = await Match.findOne({ matchId }).populate(
      "participants.userId",
      "firstName lastName profilePicture rating rank"
    );
    if (!match) return res.status(404).json({ error: "Match not found" });
    if (match.status !== "Ongoing") return res.status(400).json({ error: "Battle is not active" });

    const participant = match.participants.find((p) => p.userId._id.toString() === userId.toString());
    if (!participant) return res.status(403).json({ error: "You are not part of this battle" });

    participant.status = "Finished";
    participant.finalSubmittedAt = participant.finalSubmittedAt || new Date();
    await match.save();

    if (shouldAutoCompleteMatch(match)) {
      const completed = await completeMatch(matchId);
      if (completed) {
        req.io?.to(matchId).emit("gameEnded", {
          participants: completed.participants,
          leaderboard: buildLeaderboard(completed),
        });
        return res.json({ message: "Battle completed successfully" });
      }
    }

    req.io?.to(matchId).emit("leaderboardUpdate", {
      participants: match.participants,
      leaderboard: buildLeaderboard(match),
    });

    return res.json({ message: "Final submission recorded" });
  } catch (err) {
    console.error("Submit Final Error:", err);
    return res.status(500).json({ error: "Server error submitting final battle" });
  }
};

export const finishMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.result._id;

    const match = await Match.findOne({ matchId });
    if (!match) return res.status(404).json({ error: "Match not found" });
    if (match.hostId.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Only host can finish this battle" });
    }
    if (match.type !== "Custom") {
      return res.status(400).json({ error: "Manual finish is only allowed in custom rooms" });
    }
    if (match.status !== "Ongoing") {
      return res.status(400).json({ error: "Battle is not active" });
    }

    const completedMatch = await completeMatch(matchId);
    if (!completedMatch) return res.status(404).json({ error: "Match not found" });

    req.io?.to(matchId).emit("gameEnded", {
      participants: completedMatch.participants,
      leaderboard: buildLeaderboard(completedMatch),
    });

    return res.json({ message: "Battle finished successfully" });
  } catch (err) {
    console.error("Finish Match Error:", err);
    return res.status(500).json({ error: "Server error finishing battle" });
  }
};
