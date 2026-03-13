import express from "express"
import { userMiddleware } from "../middleware/userMiddleware.js";
import  solveDoubt  from "../controllers/solveDoubt.js";

const AIRouter = express.Router();

AIRouter.post('/chat', userMiddleware, solveDoubt);


export default AIRouter