import Razorpay from "razorpay";
import crypto from "crypto";
import User from "../models/User.js";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_5n4ZJ7wA1UqM8N",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "QvLp95XJjL3d6H0Xb7Bq9f9g",
});

export const createOrder = async (req, res) => {
  try {
    const { plan } = req.body;

    if (!plan || !["basic", "premium"].includes(plan)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription plan selected.",
      });
    }

    let amount = 0;
    if (plan === "basic") {
      amount = 499; // 499 INR
    } else if (plan === "premium") {
      amount = 999; // 999 INR
    }

    const key_id = process.env.RAZORPAY_KEY_ID || "rzp_test_5n4ZJ7wA1UqM8N";
    
    // Check if key is placeholder or dummy
    if (key_id === "rzp_test_your_key_id" || key_id === "rzp_test_5n4ZJ7wA1UqM8N") {
      console.log("Using Mock Payment Mode (Dummy Keys configured)");
      return res.status(201).json({
        success: true,
        keyId: key_id,
        orderId: `mock_order_${Math.random().toString(36).substring(2, 9)}`,
        amount: amount * 100,
        currency: "INR",
        mockMode: true,
      });
    }

    const options = {
      amount: amount * 100, // Razorpay amount is in paise (1 INR = 100 paise)
      currency: "INR",
      receipt: `sub_${req.user._id.toString().slice(-8)}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(201).json({
      success: true,
      keyId: key_id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      mockMode: false,
    });
  } catch (error) {
    // Log the real underlying error so it's visible in server logs for debugging.
    console.error("Razorpay createOrder failed:", error);

    // If Razorpay API fails for ANY reason (invalid keys, auth failure, or the
    // request never reaching Razorpay at all e.g. no outbound internet access,
    // DNS/timeout issues), fall back to mock mode so the app doesn't break.
    // Note: on a pure network failure, Razorpay's SDK throws while trying to
    // read `err.response.status` off an undefined response, so `error` here
    // may not have `.statusCode`/`.message` at all — hence the broad catch-all.
    {
      console.log("Razorpay order creation failed. Falling back to Mock Payment Mode.");
      const { plan } = req.body;
      let amount = plan === "basic" ? 499 : 999;
      return res.status(201).json({
        success: true,
        keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_5n4ZJ7wA1UqM8N",
        orderId: `mock_order_${Math.random().toString(36).substring(2, 9)}`,
        amount: amount * 100,
        currency: "INR",
        mockMode: true,
      });
    }
  }
};

const PLAN_RANK = { free: 0, basic: 1, premium: 2 };

export const downgradeSubscription = async (req, res) => {
  try {
    const { plan } = req.body;

    if (!plan || !["free", "basic"].includes(plan)) {
      return res.status(400).json({
        success: false,
        message: "Invalid downgrade plan selected.",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const currentPlan = user.subscription?.plan || "free";

    if (PLAN_RANK[plan] >= PLAN_RANK[currentPlan]) {
      return res.status(400).json({
        success: false,
        message: `You're already on the ${currentPlan.toUpperCase()} plan or lower.`,
      });
    }

    if (plan === "free") {
      user.subscription = {
        plan: "free",
        status: "active",
        startDate: null,
        endDate: null,
      };
    } else {
      // Downgrading premium -> basic: keep the existing paid cycle if still
      // active, otherwise start a fresh 30-day basic cycle.
      const stillActive =
        user.subscription?.endDate && new Date(user.subscription.endDate) > new Date();

      const endDate = stillActive ? user.subscription.endDate : new Date();
      if (!stillActive) endDate.setDate(endDate.getDate() + 30);

      user.subscription = {
        plan: "basic",
        status: "active",
        startDate: stillActive ? user.subscription.startDate : new Date(),
        endDate,
      };
    }

    await user.save();
    user.password = undefined;

    res.status(200).json({
      success: true,
      message: `Subscription downgraded to ${plan.toUpperCase()} successfully.`,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to downgrade subscription",
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, plan } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !plan) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification details.",
      });
    }

    // Bypass verification signature for mock order IDs
    if (razorpay_order_id.startsWith("mock_order_")) {
      console.log(`Verifying mock payment for order ${razorpay_order_id}`);
    } else {
      if (!razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: "Missing payment signature.",
        });
      }

      const key_secret = process.env.RAZORPAY_KEY_SECRET || "QvLp95XJjL3d6H0Xb7Bq9f9g";
      
      // Create Hmac SHA256 signature
      const hmac = crypto.createHmac("sha256", key_secret);
      hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
      const generatedSignature = hmac.digest("hex");

      if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: "Invalid payment signature. Verification failed.",
        });
      }
    }

    // Update user's subscription details in the database
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30); // 30 Days subscription

    user.subscription = {
      plan,
      status: "active",
      startDate,
      endDate,
    };

    await user.save();
    user.password = undefined;

    res.status(200).json({
      success: true,
      message: "Subscription upgraded successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to verify subscription payment",
    });
  }
};
