import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import {userMiddleware} from "../middleware/userMiddleware.js";
import { updateProfilePicture, getUserProfile } from "../controllers/userProfileController.js";

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "leetcode_avatars",
    allowedFormats: ["jpg", "png", "jpeg"]
  }
});

const upload = multer({ storage: storage });

router.post("/profile-picture", userMiddleware, upload.single("avatar"), updateProfilePicture);
router.get("/profile/:id", getUserProfile);

export const userProfileRouter = router;
