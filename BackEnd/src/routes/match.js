import express from "express";
import { userMiddleware} from "../middleware/userMiddleware.js";
import { createMatch, joinMatch, queueMatch, cancelQueue, getQueueStatus, getMatch, submitFinal, forfeitMatch, finishMatch } from "../controllers/matchController.js";

const router = express.Router();

router.post("/create", userMiddleware, createMatch);
router.post("/join", userMiddleware, joinMatch);
router.post("/queue", userMiddleware, queueMatch);
router.post("/cancel-queue", userMiddleware, cancelQueue);
router.get("/queue-status", userMiddleware, getQueueStatus);
router.post("/:matchId/submit-final", userMiddleware, submitFinal);
router.post("/:matchId/forfeit", userMiddleware, forfeitMatch);
router.post("/:matchId/finish", userMiddleware, finishMatch);
router.get("/:matchId", getMatch);

export const matchRouter = router;
