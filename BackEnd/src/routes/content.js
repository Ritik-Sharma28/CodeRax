import express from "express";
import {
  getAdminSiteContent,
  getPublicSiteContent,
  updateAdminSiteContent,
} from "../controllers/contentController.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

export const contentRouter = express.Router();

contentRouter.get("/public", getPublicSiteContent);
contentRouter.get("/admin", adminMiddleware, getAdminSiteContent);
contentRouter.put("/admin", adminMiddleware, updateAdminSiteContent);
