import express from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  removeNotification,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getNotifications);
router.put("/read-all", markAllAsRead);
router.put("/:id/read", markAsRead);
router.delete("/:id", removeNotification);

export default router;
