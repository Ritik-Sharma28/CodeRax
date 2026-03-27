import express from "express"
import { userMiddleware } from "../middleware/userMiddleware.js";
import solveDoubt from "../controllers/solveDoubt.js";
import { saveMemory, getMemories, deleteMemory, revisionChat, saveQuickNote, getMemoriesByProblem } from "../controllers/revisionController.js";
import {
  generateLiveToken,
  gradeInterview,
  saveInterviewSession,
} from "../controllers/mockInterviewController.js";

const AIRouter = express.Router();

// Existing AI chat (problem-solving doubt solver)
AIRouter.post('/chat', userMiddleware, solveDoubt);

// Revision Memory CRUD
AIRouter.post('/memory', userMiddleware, saveMemory);
AIRouter.post('/quick-note', userMiddleware, saveQuickNote);
AIRouter.get('/memories', userMiddleware, getMemories);
AIRouter.get('/memories/:problemId', userMiddleware, getMemoriesByProblem);
AIRouter.delete('/memory/:id', userMiddleware, deleteMemory);

// Revision Mentor RAG chat
AIRouter.post('/revision-chat', userMiddleware, revisionChat);

// Mock interview
AIRouter.post('/interview/live-token', userMiddleware, generateLiveToken);
AIRouter.post('/interview/grade', userMiddleware, gradeInterview);
AIRouter.post('/interview/session', userMiddleware, saveInterviewSession);


export default AIRouter
