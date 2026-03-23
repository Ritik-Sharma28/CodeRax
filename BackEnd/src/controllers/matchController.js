import crypto from "crypto";
import Match from "../models/match.js";
import Problem from "../models/problem.js";
import { redisClient } from "../config/redis.js";

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

    const match = await Match.findOne({ matchId }).populate("participants.userId", "firstName lastName profilePicture rating rank");
    if (!match) return res.status(404).json({ error: "Match not found" });

    res.json(match);
  } catch (err) {
    console.error("Get Match Error:", err);
    res.status(500).json({ error: "Server error fetching match" });
  }
};
