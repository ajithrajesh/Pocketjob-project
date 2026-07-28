import express from "express";
import {
  getDashboardStats,
  getAllUsers,
  blockUser,
  unblockUser,
  verifyUser,
  unverifyUser,
  deleteUser,
  getAllJobs,
} from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Every route here is admin-only
router.use(protect, adminOnly);

router.get("/stats", getDashboardStats);

router.get("/users", getAllUsers);
router.put("/users/:id/block", blockUser);
router.put("/users/:id/unblock", unblockUser);
router.put("/users/:id/verify", verifyUser);
router.put("/users/:id/unverify", unverifyUser);
router.delete("/users/:id", deleteUser);

router.get("/jobs", getAllJobs);

export default router;