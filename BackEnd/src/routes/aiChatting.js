import express from "express"
import { userMiddleware } from "../middleware/userMiddleware.js";
import solveDoubt from "../controllers/solveDoubt.js";
import { saveMemory, getMemories, deleteMemory, revisionChat, saveQuickNote, getMemoriesByProblem } from "../controllers/revisionController.js";

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


export default AIRouter