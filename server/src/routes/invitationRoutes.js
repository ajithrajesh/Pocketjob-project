import express from "express";
import {
  sendInvitation,
  getInvitations,
  updateInvitationStatus,
} from "../controllers/invitationController.js";
import { protect, companyOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// All invitation routes require authentication
router.post("/", protect, companyOnly, sendInvitation);
router.get("/", protect, getInvitations);
router.put("/:id", protect, updateInvitationStatus);

export default router;
