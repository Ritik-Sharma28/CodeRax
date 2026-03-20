import express from "express"
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import { generateUploadSignature, handleCloudinaryWebhook, deleteVideo } from "../controllers/videoSection.js";

export const videoRouter = express.Router();

videoRouter.get( "/create/:problemId", adminMiddleware , generateUploadSignature);
videoRouter.post( "/webhook", handleCloudinaryWebhook);
videoRouter.delete( "/delete/:problemId" , adminMiddleware , deleteVideo);
