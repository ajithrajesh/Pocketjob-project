
import cron from "node-cron";
import User from "../models/User.js";
import { createAndSendNotification } from "../services/notificationService.js";


const REMINDER_DAYS_BEFORE = [7, 3, 1];

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const sendExpiryReminders = async (app) => {
  const today = startOfDay(new Date());

  for (const daysBefore of REMINDER_DAYS_BEFORE) {
    const windowStart = addDays(today, daysBefore);
    const windowEnd = addDays(windowStart, 1);

    const users = await User.find({
      role: "company",
      "subscription.status": "active",
      "subscription.plan": { $in: ["basic", "premium"] },
      "subscription.endDate": { $gte: windowStart, $lt: windowEnd },
    });

    for (const user of users) {
      const plan = user.subscription.plan.toUpperCase();
      const dayLabel = daysBefore === 1 ? "tomorrow" : `in ${daysBefore} days`;

      await createAndSendNotification({
        recipientId: user._id,
        type: "subscription_expiring",
        title: "Your subscription is expiring soon",
        message: `Your ${plan} subscription expires ${dayLabel}. Renew now to keep uninterrupted access to paid features.`,
        link: "/subscription",
        data: {
          plan: user.subscription.plan,
          endDate: user.subscription.endDate,
          daysBefore,
        },
        app,
      });

      console.log(
        `[subscriptionExpiryJob] Reminder sent to ${user.email} (${daysBefore}d before expiry)`
      );
    }
  }
};

const downgradeExpiredSubscriptions = async (app) => {
  const now = new Date();

  const expiredUsers = await User.find({
    role: "company",
    "subscription.status": "active",
    "subscription.plan": { $in: ["basic", "premium"] },
    "subscription.endDate": { $lt: now },
  });

  for (const user of expiredUsers) {
    const previousPlan = user.subscription.plan;

    user.subscription = {
      plan: "free",
      status: "active",
      startDate: null,
      endDate: null,
    };
    await user.save();

    await createAndSendNotification({
      recipientId: user._id,
      type: "subscription_expired",
      title: "Your subscription has expired",
      message: `Your ${previousPlan.toUpperCase()} subscription has ended and your account has been moved to the FREE plan. Upgrade any time to restore paid features.`,
      link: "/subscription",
      data: { previousPlan },
      app,
    });

    console.log(
      `[subscriptionExpiryJob] Downgraded expired ${previousPlan} subscription for ${user.email}`
    );
  }
};

export const runSubscriptionExpiryCheck = async (app = null) => {
  try {
    await sendExpiryReminders(app);
    await downgradeExpiredSubscriptions(app);
  } catch (error) {
    console.error("[subscriptionExpiryJob] Run failed:", error.message);
  }
};

export const scheduleSubscriptionExpiryJob = (app) => {
  cron.schedule("0 9 * * *", () => {
    console.log("[subscriptionExpiryJob] Running scheduled subscription expiry check...");
    runSubscriptionExpiryCheck(app);
  });

  console.log("[subscriptionExpiryJob] Scheduled daily subscription expiry check (09:00 server time).");
};
