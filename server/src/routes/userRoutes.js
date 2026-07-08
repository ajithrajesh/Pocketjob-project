import express from "express";
import {
  getProfile,
  updateProfile,
  uploadProfilePhoto,
  uploadAadhaarFront,
  uploadAadhaarBack,
  uploadLicense,
  uploadResume,
} from "../controllers/userController.js";

import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/profile", protect, getProfile);

router.put("/profile", protect, updateProfile);

router.put(
  "/profile/photo",
  protect,
  upload.single("profilePhoto"),
  uploadProfilePhoto
);

router.put(
  "/aadhaar/front",
  protect,
  upload.single("aadhaarFront"),
  uploadAadhaarFront
);

router.put(
  "/aadhaar/back",
  protect,
  upload.single("aadhaarBack"),
  uploadAadhaarBack
);

router.put(
  "/license",
  protect,
  upload.single("license"),
  uploadLicense
);

router.put(
  "/resume",
  protect,
  upload.single("resume"),
  uploadResume
);

export default router;