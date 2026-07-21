import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../services/notificationService.js";

export const getNotifications = async (req, res) => {
  try {
    const data = await getUserNotifications(req.user._id);
    res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const notification = await markNotificationAsRead(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await markAllNotificationsAsRead(req.user._id);
    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const removeNotification = async (req, res) => {
  try {
    await deleteNotification(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      message: "Notification removed successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
