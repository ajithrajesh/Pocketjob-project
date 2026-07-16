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
} from "../controllers/jobController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/search", searchJobs);

// Protected routes
router.post("/", protect, createJob);
router.put("/:id", protect, updateJob);
router.delete("/:id", protect, deleteJob);
router.get("/recommended", protect, getRecommendedJobs);
router.get("/my-jobs", protect, getMyJobs);
router.post("/:id/apply", protect, applyJob);
router.get("/applied", protect, getAppliedJobs);
router.get("/:id/applications", protect, getJobApplications);
router.put("/applications/:applicationId", protect, updateApplicationStatus);

export default router;
