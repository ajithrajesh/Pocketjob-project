import express from "express";
import {
  createJob,
  searchJobs,
  getRecommendedJobs,
  getMyJobs,
  updateJob,
  deleteJob,
  applyJob,
  getAppliedJobs,
  getJobApplications,
  updateApplicationStatus,
  getJob,
  saveJob,
  unsaveJob,
  getSavedJobs,
} from "../controllers/jobController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/search", searchJobs);

// Protected routes
router.post("/", protect, createJob);
router.get("/recommended", protect, getRecommendedJobs);
router.get("/my-jobs", protect, getMyJobs);
router.get("/applied", protect, getAppliedJobs);
router.get("/saved", protect, getSavedJobs);
router.put("/applications/:applicationId", protect, updateApplicationStatus);

// Single Job & Sub-resource routes
router.get("/:id", getJob);
router.put("/:id", protect, updateJob);
router.delete("/:id", protect, deleteJob);
router.post("/:id/apply", protect, applyJob);
router.post("/:id/save", protect, saveJob);
router.post("/:id/unsave", protect, unsaveJob);
router.get("/:id/applications", protect, getJobApplications);

export default router;
