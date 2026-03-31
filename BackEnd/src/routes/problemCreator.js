import express from "express";
import { userMiddleware } from "../middleware/userMiddleware.js";
import { createProblem , updateProblem , deleteProblem , getProblemById , getAllProblem , solvedAllProblembyUser , submittedProblem, getPublicProblemById, getPublicProblems } from "../controllers/userProblem.js";
const problemRouter = express.Router()

problemRouter.get("/public", getPublicProblems)
problemRouter.get("/public/:id", getPublicProblemById)

problemRouter.post("/create",userMiddleware, createProblem)
problemRouter.put("/update/:id",userMiddleware, updateProblem)
problemRouter.delete("/delete/:id" ,userMiddleware, deleteProblem)

problemRouter.get("/problemById/:id" ,userMiddleware, getProblemById)
problemRouter.get("/getAllProblem" ,userMiddleware, getAllProblem)
problemRouter.get("/problemSolvedByUser" ,userMiddleware, solvedAllProblembyUser)
problemRouter.get("/submittedProblem/:pid" ,userMiddleware, submittedProblem)


export default problemRouter;

