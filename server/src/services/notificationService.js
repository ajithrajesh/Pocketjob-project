import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { sendPresetEmail } from "./emailService.js";

/**
 * Creates an in-app notification, emits Socket.io event, and sends preset email.
 */
export const createAndSendNotification = async ({
  recipientId,
  senderId = null,
  type,
  title,
  message,
  link = "",
  data = {},
  app = null,
}) => {
  try {
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      console.warn(`⚠️ Cannot create notification: Recipient ${recipientId} not found.`);
      return null;
    }

    // 1. Create DB Notification
    const notification = await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type,
      title,
      message,
      link,
      data,
    });

    // 2. Real-time Socket.io Notification
    if (app) {
      const io = app.get("io");
      const userSockets = app.get("userSockets");
      
      if (io && userSockets) {
        const socketId = userSockets.get(recipientId.toString());
        if (socketId) {
          io.to(socketId).emit("notification", {
            notification,
            type,
            title,
            message,
          });
          
          // Also emit legacy socket event if needed
          if (type === "job_invitation") {
            io.to(socketId).emit("newInvitation", {
              notification,
              message,
            });
          }
        }
      }
    }

    // 3. Preset Mail Notification
    const emailSettings = recipient.emailNotificationSettings || {};
    const enableEmail = emailSettings.enableEmailNotifications !== false;

    if (enableEmail) {
      // Use preset email if provided, otherwise fallback to account email
      const targetEmail = (emailSettings.presetEmail && emailSettings.presetEmail.trim())
        ? emailSettings.presetEmail.trim()
        : recipient.email;

      const presetTemplate = emailSettings.presetMailTemplate || "";

      // Fire email sending asynchronously
      sendPresetEmail({
        to: targetEmail,
        subject: title,
        recipientName: recipient.fullName || "User",
        activityTitle: title,
        activityMessage: message,
        presetTemplateText: presetTemplate,
      }).catch((err) => {
        console.error("Failed async email send:", err.message);
      });
    }

    return notification;
  } catch (error) {
    console.error("❌ Error in createAndSendNotification:", error.message);
    return null;
  }
};

/**
 * Get user's notifications and unread count
 */
export const getUserNotifications = async (userId) => {
  const notifications = await Notification.find({ recipient: userId })
    .populate("sender", "fullName companyName profilePhoto")
    .sort({ createdAt: -1 })
    .limit(50);

  const unreadCount = await Notification.countDocuments({
    recipient: userId,
    isRead: false,
  });

  return { notifications, unreadCount };
};

/**
 * Mark a single notification as read
 */
export const markNotificationAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { isRead: true },
    { new: true }
  );
  return notification;
};

/**
 * Mark all notifications for a user as read
 */
export const markAllNotificationsAsRead = async (userId) => {
  await Notification.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true }
  );
  return { success: true };
};

/**
 * Delete a notification
 */
export const deleteNotification = async (notificationId, userId) => {
  await Notification.findOneAndDelete({ _id: notificationId, recipient: userId });
  return { success: true };
};
