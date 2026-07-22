import express from "express";
import { createOrder, verifyPayment } from "../controllers/subscriptionController.js";
import { protect, companyOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create-order", protect, companyOnly, createOrder);
router.post("/verify-payment", protect, companyOnly, verifyPayment);

export default router;
