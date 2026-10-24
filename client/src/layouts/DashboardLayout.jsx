import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate, Link, Outlet, useNavigate, useSearchParams } from "react-router-dom";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import NotificationBell from "../components/common/NotificationBell";
import { FaUserCircle, FaBriefcase, FaClipboardList, FaSignOutAlt, FaSearch, FaUser, FaFileAlt, FaSlidersH, FaHome, FaTachometerAlt, FaBars, FaTimes, FaBuilding, FaPlusCircle, FaListAlt, FaUsers, FaEnvelope, FaBookmark } from "react-icons/fa";

function DashboardLayout() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = user?.role === "company" || user?.role === "admin" ? "overview" : "search";
  const currentTab = searchParams.get("tab") || defaultTab;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [socket, setSocket] = useState(null);

  // Initialize socket connection & activity toast listeners
  useEffect(() => {
    if (user && user._id) {
      const socketUrl =
        import.meta.env.VITE_SOCKET_URL ||
        (import.meta.env.VITE_API_BASE_URL
          ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, "")
          : "http://localhost:5000");
      const socketInstance = io(socketUrl);
      setSocket(socketInstance);

      socketInstance.emit("join", user._id);

      socketInstance.on("notification", (data) => {
        if (data.type === "application_accepted" || data.type === "invitation_accepted") {
          toast.success(data.message || data.title);
        } else if (data.type === "application_rejected" || data.type === "invitation_rejected") {
          toast.error(data.message || data.title);
        } else {
          toast.info(data.message || data.title);
        }
      });

      return () => {
        socketInstance.disconnect();
      };
    }
  }, [user]);

  const handleNotificationNavigate = (notif) => {
    if (notif.link) {
      navigate(notif.link);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="container-fluid p-0">
      {/* Mobile top bar with hamburger toggle */}
      <div className="d-md-none d-flex align-items-center justify-content-between px-3 py-2 sidebar-mobile-bar">
        <div className="d-flex align-items-center text-white sidebar-brand">
          <FaBriefcase className="fs-4 text-primary me-2" />
          <span className="fs-5 fw-bold">pocketJob</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <NotificationBell socket={socket} onSelectNotification={handleNotificationNavigate} />
          <button
            className="btn btn-sm sidebar-toggle-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Backdrop for mobile when sidebar is open */}
      {sidebarOpen && (
        <div className="sidebar-backdrop d-md-none" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="row g-0" style={{ minHeight: "100vh" }}>
        
        {/* Sidebar */}
        <div
          className={`dashboard-sidebar text-white p-3 d-flex flex-column justify-content-between position-sticky top-0 sidebar-container ${sidebarOpen ? "sidebar-open" : ""}`}
          style={{ height: "100vh" }}
        >
          <div>
            <div className="d-flex align-items-center mb-4 mt-2 px-2 text-decoration-none text-white sidebar-brand">
              <FaBriefcase className="fs-3 text-primary sidebar-icon" />
              <span className="fs-4 fw-bold sidebar-link-text">pocketJob</span>
            </div>
            
            <hr className="bg-secondary opacity-25" />

            <div className="mb-4 sidebar-user-card">
              <div className="small text-uppercase mb-2 sidebar-link-text" style={{ fontSize: "0.7rem", letterSpacing: "0.5px", color: "rgba(255,255,255,0.45)" }}>Logged in as</div>
              <div className="d-flex align-items-center">
                <FaUserCircle className="fs-4 text-primary sidebar-icon" />
                <div className="sidebar-link-text">
                  <div className="fw-semibold text-truncate text-white" style={{ maxWidth: "120px", fontSize: "0.9rem" }}>{user?.fullName || "User"}</div>
                  <span className="badge bg-secondary small text-capitalize" style={{ fontSize: "0.7rem" }}>
                    {user?.role === "company" ? "Job Provider" : user?.role === "admin" ? "Admin" : "Job Seeker"}
                  </span>
                </div>
              </div>
            </div>

            <ul className="nav nav-pills flex-column mb-auto">
              {user?.role === "user" ? (
                <>
                  <li className="nav-item">
                    <Link
                      to="/dashboard?tab=search"
                      onClick={() => setSidebarOpen(false)}
                      className={`nav-link d-flex align-items-start sidebar-nav-link ${currentTab === "search" ? "active" : ""}`}
                    >
                      <FaSearch className="sidebar-icon" /> <span className="sidebar-link-text">Job Search</span>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/dashboard?tab=recommended"
                      onClick={() => setSidebarOpen(false)}
                      className={`nav-link d-flex align-items-start sidebar-nav-link ${currentTab === "recommended" ? "active" : ""}`}
                    >
                      <FaSlidersH className="sidebar-icon" /> <span className="sidebar-link-text">Recommended </span>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/dashboard?tab=saved"
                      onClick={() => setSidebarOpen(false)}
                      className={`nav-link d-flex align-items-start sidebar-nav-link ${currentTab === "saved" ? "active" : ""}`}
                    >
                      <FaBookmark className="sidebar-icon" /> <span className="sidebar-link-text">Saved Jobs</span>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/dashboard?tab=applications"
                      onClick={() => setSidebarOpen(false)}
                      className={`nav-link d-flex align-items-start sidebar-nav-link ${currentTab === "applications" ? "active" : ""}`}
                    >
                      <FaClipboardList className="sidebar-icon" /> <span className="sidebar-link-text">My Applications</span>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/dashboard?tab=invitations"
                      onClick={() => setSidebarOpen(false)}
                      className={`nav-link d-flex align-items-start sidebar-nav-link ${currentTab === "invitations" ? "active" : ""}`}
                    >
                      <FaEnvelope className="sidebar-icon" /> <span className="sidebar-link-text">Job Invitations</span>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/dashboard?tab=profile"
                      onClick={() => setSidebarOpen(false)}
                      className={`nav-link d-flex align-items-start sidebar-nav-link ${currentTab === "profile" ? "active" : ""}`}
                    >
                      <FaUser className="sidebar-icon" /> <span className="sidebar-link-text">Profile</span>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/dashboard?tab=documents"
                      onClick={() => setSidebarOpen(false)}
                      className={`nav-link d-flex align-items-start sidebar-nav-link ${currentTab === "documents" ? "active" : ""}`}
                    >
                      <FaFileAlt className="sidebar-icon" /> <span className="sidebar-link-text">Documents</span>
                    </Link>
                  </li>
                </>
              ) : user?.role === "company" ? (
                <>
                  <li className="nav-item">
                    <Link
                      to="/dashboard?tab=overview"
                      onClick={() => setSidebarOpen(false)}
                      className={`nav-link d-flex align-items-start sidebar-nav-link ${currentTab === "overview" ? "active" : ""}`}
                    >
                      <FaBuilding className="sidebar-icon" /> <span className="sidebar-link-text"> Overview</span>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/dashboard?tab=post"
                      onClick={() => setSidebarOpen(false)}
                      className={`nav-link d-flex align-items-start sidebar-nav-link ${currentTab === "post" ? "active" : ""}`}
                    >
                      <FaPlusCircle className="sidebar-icon" /> <span className="sidebar-link-text">Post a Job</span>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/dashboard?tab=my-jobs"
                      onClick={() => setSidebarOpen(false)}
                      className={`nav-link d-flex align-items-start sidebar-nav-link ${currentTab === "my-jobs" || currentTab === "edit" || currentTab === "applicants" ? "active" : ""}`}
                    >
                      <FaBriefcase className="sidebar-icon" /> <span className="sidebar-link-text">My Posted Job</span>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/dashboard?tab=seekers"
                      onClick={() => setSidebarOpen(false)}
                      className={`nav-link d-flex align-items-start sidebar-nav-link ${currentTab === "seekers" ? "active" : ""}`}
                    >
                      <FaUsers className="sidebar-icon" /> <span className="sidebar-link-text">Search Seeker</span>
                    </Link>
                  </li>
                </>
              ) : user?.role === "admin" ? (
                <>
                  <li className="nav-item">
                    <Link
                      to="/dashboard?tab=overview"
                      onClick={() => setSidebarOpen(false)}
                      className={`nav-link d-flex align-items-start sidebar-nav-link ${currentTab === "overview" ? "active" : ""}`}
                    >
                      <FaTachometerAlt className="sidebar-icon" /> <span className="sidebar-link-text">Overview</span>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/dashboard?tab=users"
                      onClick={() => setSidebarOpen(false)}
                      className={`nav-link d-flex align-items-start sidebar-nav-link ${currentTab === "users" ? "active" : ""}`}
                    >
                      <FaUsers className="sidebar-icon" /> <span className="sidebar-link-text">Manage Users</span>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/dashboard?tab=jobs"
                      onClick={() => setSidebarOpen(false)}
                      className={`nav-link d-flex align-items-start sidebar-nav-link ${currentTab === "jobs" ? "active" : ""}`}
                    >
                      <FaBriefcase className="sidebar-icon" /> <span className="sidebar-link-text">Manage Jobs</span>
                    </Link>
                  </li>
                </>
              ) : (
                <li className="nav-item">
                  <Link to="/dashboard" onClick={() => setSidebarOpen(false)} className="nav-link d-flex align-items-start sidebar-nav-link active">
                    <FaTachometerAlt className="sidebar-icon" /> <span className="sidebar-link-text">Dashboard</span>
                  </Link>
                </li>
              )}
              {user?.role !== "admin" && user?.role !== "company" && (
  <li className="nav-item">
    <Link to="/" onClick={() => setSidebarOpen(false)} className="nav-link d-flex align-items-start sidebar-nav-link">
      <FaHome className="sidebar-icon" /> <span className="sidebar-link-text">Back to Home</span>
    </Link>
  </li>
)}
            </ul>
          </div>

          <div>
            <hr className="bg-secondary opacity-25" />
            <button className="btn btn-danger w-100 d-flex align-items-center justify-content-center py-2 sidebar-logout-btn" style={{ borderRadius: "10px" }} onClick={handleLogout}>
              <FaSignOutAlt className="sidebar-icon" />
              <span className="sidebar-link-text">Logout</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="dashboard-main bg-light d-flex flex-column" style={{ minHeight: "100vh" }}>
          
          {/* Header */}
          <header className="navbar navbar-expand bg-white shadow-sm px-4 py-3 d-flex justify-content-between align-items-center">
            <h4 className="mb-0 fw-bold text-dark">
              Welcome back, {user?.fullName?.split(" ")[0]}!
            </h4>
            <div className="d-flex align-items-center gap-3">
              {user?.role === "company" && user?.companyName && (
                <span className="text-muted fw-semibold">
                  🏢 {user?.companyName}
                </span>
              )}

              {/* Notification Bell Icon */}
              <NotificationBell socket={socket} onSelectNotification={handleNotificationNavigate} />

              <div className="d-flex align-items-center text-dark ps-2 border-start">
                <FaUserCircle className="fs-3 text-primary me-2" />
                <span className="fw-semibold">{user?.fullName}</span>
              </div>
            </div>
          </header>

          {/* Page Body */}
          <main className="flex-grow-1 p-4">
            <Outlet />
          </main>
        </div>

      </div>
    </div>
  );
}

export default DashboardLayout;