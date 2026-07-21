import { useState, useEffect, useRef } from "react";
import { FaBell, FaEnvelope, FaCheckCircle, FaTimesCircle, FaBriefcase, FaInfoCircle, FaTrash } from "react-icons/fa";
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from "../../services/notificationService";
import "./NotificationBell.css";

function NotificationBell({ onSelectNotification, socket }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  const fetchNotifs = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  // Socket real-time event handler
  useEffect(() => {
    if (!socket) return;

    const handleNewNotif = () => {
      fetchNotifs();
    };

    socket.on("notification", handleNewNotif);
    socket.on("newInvitation", handleNewNotif);

    return () => {
      socket.off("notification", handleNewNotif);
      socket.off("newInvitation", handleNewNotif);
    };
  }, [socket]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchNotifs();
    }
  };

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications read:", err);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      const target = notifications.find((n) => n._id === id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (target && !target.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const handleItemClick = (notif) => {
    if (!notif.isRead) {
      handleMarkAsRead(notif._id, { stopPropagation: () => {} });
    }
    setIsOpen(false);
    if (onSelectNotification) {
      onSelectNotification(notif);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "job_invitation":
        return <FaEnvelope />;
      case "application_accepted":
      case "invitation_accepted":
        return <FaCheckCircle />;
      case "application_rejected":
      case "invitation_rejected":
        return <FaTimesCircle />;
      case "new_job_post":
        return <FaBriefcase />;
      default:
        return <FaInfoCircle />;
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);

    if (diffSec < 60) return "Just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  };

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button
        type="button"
        className="notification-bell-btn"
        onClick={handleToggle}
        title="Notifications"
      >
        <FaBell />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h6>
              Notifications {unreadCount > 0 && <span className="badge bg-primary ms-1">{unreadCount} unread</span>}
            </h6>
            {unreadCount > 0 && (
              <button
                type="button"
                className="mark-all-btn"
                onClick={handleMarkAllRead}
              >
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="notification-empty">
              <p className="mb-0">No notifications yet</p>
            </div>
          ) : (
            <ul className="notification-list">
              {notifications.map((n) => (
                <li
                  key={n._id}
                  className={`notification-item ${!n.isRead ? "unread" : ""}`}
                  onClick={() => handleItemClick(n)}
                >
                  <div className={`notification-icon ${n.type}`}>
                    {getIcon(n.type)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">{n.title}</div>
                    <div className="notification-msg">{n.message}</div>
                    <div className="notification-time">{formatTime(n.createdAt)}</div>
                  </div>
                  <button
                    type="button"
                    className="delete-notif-btn"
                    onClick={(e) => handleDelete(n._id, e)}
                    title="Remove notification"
                  >
                    <FaTrash />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
