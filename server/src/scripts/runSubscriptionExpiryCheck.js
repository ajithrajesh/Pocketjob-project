// One-off runner for the subscription expiry check, for manual testing
// or for triggering it from an external scheduler (e.g. a system cron
// or hosting provider's scheduled-task feature) instead of the
// in-process node-cron job in jobs/subscriptionExpiryJob.js.
//
// Usage (from the server/ directory):
//   npm run check:subscriptions
//   or: node src/scripts/runSubscriptionExpiryCheck.js
//
// Note: this run has no Express `app` instance, so notifications are
// still created and emailed as usual, but the live socket.io push to
// currently-online users is skipped (there's no server/io to push
// through). That only affects real-time delivery, not the notification
// or email itself.

import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import { runSubscriptionExpiryCheck } from "../jobs/subscriptionExpiryJob.js";

dotenv.config();

const run = async () => {
  await connectDB();

  console.log("Running subscription expiry check...");
  await runSubscriptionExpiryCheck(null);
  console.log("Done.");

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((error) => {
  console.error("Subscription expiry check failed:", error);
  process.exit(1);
});
