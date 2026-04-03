import express from "express"
import { userMiddleware } from "../middleware/userMiddleware.js";
import { rateLimitMiddleware } from "../middleware/rateLimitMiddleware.js";
import { verifiedUserMiddleware } from "../middleware/verifiedUserMiddleware.js";
import solveDoubt from "../controllers/solveDoubt.js";
import { saveMemory, getMemories, deleteMemory, revisionChat, saveQuickNote, getMemoriesByProblem } from "../controllers/revisionController.js";
import {
  generateLiveToken,
  gradeInterview,
  saveInterviewSession,
} from "../controllers/mockInterviewController.js";

const AIRouter = express.Router();

// Existing AI chat (problem-solving doubt solver)
AIRouter.post('/chat', userMiddleware, verifiedUserMiddleware, rateLimitMiddleware('aiChat'), solveDoubt);

// Revision Memory CRUD
AIRouter.post('/memory', userMiddleware, verifiedUserMiddleware, saveMemory);
AIRouter.post('/quick-note', userMiddleware, verifiedUserMiddleware, saveQuickNote);
AIRouter.get('/memories', userMiddleware, verifiedUserMiddleware, getMemories);
AIRouter.get('/memories/:problemId', userMiddleware, verifiedUserMiddleware, getMemoriesByProblem);
AIRouter.delete('/memory/:id', userMiddleware, verifiedUserMiddleware, deleteMemory);

// Revision Mentor RAG chat
AIRouter.post('/revision-chat', userMiddleware, verifiedUserMiddleware, rateLimitMiddleware('revisionChat'), revisionChat);

// Mock interview
AIRouter.post('/interview/live-token', userMiddleware, verifiedUserMiddleware, rateLimitMiddleware('mockInterview'), generateLiveToken);
AIRouter.post('/interview/grade', userMiddleware, verifiedUserMiddleware, gradeInterview);
AIRouter.post('/interview/session', userMiddleware, verifiedUserMiddleware, saveInterviewSession);


export default AIRouter
