import express from "express";
import { createOrder, verifyPayment, downgradeSubscription } from "../controllers/subscriptionController.js";
import { protect, companyOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create-order", protect, companyOnly, createOrder);
router.post("/verify-payment", protect, companyOnly, verifyPayment);
router.post("/downgrade", protect, companyOnly, downgradeSubscription);

export default router;
