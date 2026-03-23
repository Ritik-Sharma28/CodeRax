import express from "express";
import { userMiddleware} from "../middleware/userMiddleware.js";
import { createMatch, joinMatch, queueMatch, cancelQueue, getMatch } from "../controllers/matchController.js";

const router = express.Router();

router.post("/create", userMiddleware, createMatch);
router.post("/join", userMiddleware, joinMatch);
router.post("/queue", userMiddleware, queueMatch);
router.post("/cancel-queue", userMiddleware, cancelQueue);
router.get("/:matchId", getMatch);

export const matchRouter = router;
