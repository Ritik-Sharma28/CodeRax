import express from "express"
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import { generateUploadSignature, handleCloudinaryWebhook, deleteVideo, saveVideoLocalFallback, getVideoForProblem } from "../controllers/videoSection.js";

export const videoRouter = express.Router();

videoRouter.get( "/create/:problemId", adminMiddleware , generateUploadSignature);
videoRouter.post( "/webhook", handleCloudinaryWebhook);
videoRouter.post( "/save-local", adminMiddleware, saveVideoLocalFallback); // For local host testing
videoRouter.get( "/:problemId", getVideoForProblem); // Fetch video metadata for Editorial API
videoRouter.delete( "/delete/:problemId" , adminMiddleware , deleteVideo);
