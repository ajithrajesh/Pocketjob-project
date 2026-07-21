import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate, Link, Outlet, useNavigate, useSearchParams } from "react-router-dom";
import { FaUserCircle, FaBriefcase, FaClipboardList, FaSignOutAlt, FaSearch, FaUser, FaFileAlt, FaSlidersH, FaHome, FaTachometerAlt, FaBars, FaTimes, FaBuilding, FaPlusCircle, FaListAlt, FaUsers, FaEnvelope } from "react-icons/fa";

function DashboardLayout() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = user?.role === "company" ? "overview" : "search";
  const currentTab = searchParams.get("tab") || defaultTab;
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        <button
          className="btn btn-sm sidebar-toggle-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Backdrop for mobile when sidebar is open */}
      {sidebarOpen && (
        <div className="sidebar-backdrop d-md-none" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="row g-0" style={{ minHeight: "100vh" }}>
        
        {/* Sidebar */}
        <div
          className={`col-md-3 col-lg-2 text-white p-3 d-flex flex-column justify-content-between position-sticky top-0 sidebar-container ${sidebarOpen ? "sidebar-open" : ""}`}
          style={{ height: "100vh" }}
        >
          <div>
            <div className="d-flex align-items-center mb-4 mt-2 px-2 text-decoration-none text-white sidebar-brand">
              <FaBriefcase className="fs-3 text-primary me-2" />
              <span className="fs-4 fw-bold">pocketJob</span>
            </div>
            
            <hr className="bg-secondary opacity-25" />

            <div className="mb-4 sidebar-user-card">
              <div className="small text-uppercase mb-2" style={{ fontSize: "0.7rem", letterSpacing: "0.5px", color: "rgba(255,255,255,0.45)" }}>Logged in as</div>
              <div className="d-flex align-items-center">
                <FaUserCircle className="fs-4 me-2 text-primary" />
                <div>
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
                      <FaSearch className="me-2" /> Job Search
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/dashboard?tab=recommended"
                      onClick={() => setSidebarOpen(false)}
                      className={`nav-link d-flex align-items-start sidebar-nav-link ${currentTab === "recommended" ? "active" : ""}`}
                    >
                      <FaSlidersH className="me-2" /> Recommended Jobs
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/dashboard?tab=applications"
                      onClick={() => setSidebarOpen(false)}
                      className={`nav-link d-flex align-items-start sidebar-nav-link ${currentTab === "applications" ? "active" : ""}`}
                    >
                      <FaClipboardList className="me-2" /> My Applications
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/dashboard?tab=invitations"
                      onClick={() => setSidebarOpen(false)}
                      className={`nav-link d-flex align-items-start sidebar-nav-link ${currentTab === "invitations" ? "active" : ""}`}
                    >
                      <FaEnvelope className="me-2" /> Job Invitations
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/dashboard?tab=profile"
                      onClick={() => setSidebarOpen(false)}
                      className={`nav-link d-flex align-items-start sidebar-nav-link ${currentTab === "profile" ? "active" : ""}`}
                    >
                      <FaUser className="me-2" /> Profile
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/dashboard?tab=documents"
                      onClick={() => setSidebarOpen(false)}
                      className={`nav-link d-flex align-items-start sidebar-nav-link ${currentTab === "documents" ? "active" : ""}`}
                    >
                      <FaFileAlt className="me-2" /> Documents
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
                      <FaBuilding className="me-2" /> Organisation Overview
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/dashboard?tab=post"
                      onClick={() => setSidebarOpen(false)}
                      className={`nav-link d-flex align-items-start sidebar-nav-link ${currentTab === "post" ? "active" : ""}`}
                    >
                      <FaPlusCircle className="me-2" /> Post a Job
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/dashboard?tab=my-jobs"
                      onClick={() => setSidebarOpen(false)}
                      className={`nav-link d-flex align-items-start sidebar-nav-link ${currentTab === "my-jobs" || currentTab === "edit" || currentTab === "applicants" ? "active" : ""}`}
                    >
                      <FaBriefcase className="me-2" /> My Posted Job
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/dashboard?tab=seekers"
                      onClick={() => setSidebarOpen(false)}
                      className={`nav-link d-flex align-items-start sidebar-nav-link ${currentTab === "seekers" ? "active" : ""}`}
                    >
                      <FaUsers className="me-2" /> Search Seeker
                    </Link>
                  </li>
                </>
              ) : (
                <li className="nav-item">
                  <Link to="/dashboard" onClick={() => setSidebarOpen(false)} className="nav-link d-flex align-items-start sidebar-nav-link active">
                    <FaTachometerAlt className="me-2" /> Dashboard
                  </Link>
                </li>
              )}
              <li className="nav-item">
                <Link to="/" onClick={() => setSidebarOpen(false)} className="nav-link d-flex align-items-start sidebar-nav-link">
                  <FaHome className="me-2" /> Back to Home
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <hr className="bg-secondary opacity-25" />
            <button className="btn btn-danger w-100 d-flex align-items-center justify-content-center py-2" style={{ borderRadius: "10px" }} onClick={handleLogout}>
              <FaSignOutAlt className="me-2" />
              Logout
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="col-md-9 col-lg-10 bg-light d-flex flex-column" style={{ minHeight: "100vh" }}>
          
          {/* Header */}
          <header className="navbar navbar-expand bg-white shadow-sm px-4 py-3 d-flex justify-content-between">
            <h4 className="mb-0 fw-bold text-dark">
              Welcome back, {user?.fullName?.split(" ")[0]}!
            </h4>
            <div className="d-flex align-items-center">
              {user?.role === "company" && user?.companyName && (
                <span className="me-3 text-muted fw-semibold">
                  🏢 {user?.companyName}
                </span>
              )}
              <div className="d-flex align-items-center text-dark">
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
