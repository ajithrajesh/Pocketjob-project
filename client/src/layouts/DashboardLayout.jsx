import { useAuth } from "../context/AuthContext";
import { Navigate, Link, Outlet, useNavigate } from "react-router-dom";
import { FaUserCircle, FaBriefcase, FaBuilding, FaClipboardList, FaSignOutAlt } from "react-icons/fa";

function DashboardLayout() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const navigate = useNavigate();

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
      <div className="row g-0" style={{ minHeight: "100vh" }}>
        
        {/* Sidebar */}
        <div className="col-md-3 col-lg-2 bg-dark text-white p-3 d-flex flex-column justify-content-between position-sticky top-0" style={{ height: "100vh" }}>
          <div>
            <div className="d-flex align-items-center mb-4 mt-2 px-2 text-decoration-none text-white">
              <FaBriefcase className="fs-3 text-primary me-2" />
              <span className="fs-4 fw-bold">pocketJob</span>
            </div>
            
            <hr className="bg-secondary" />

            <div className="px-2 mb-4">
              <div className="small text-muted text-uppercase mb-2">Logged in as</div>
              <div className="d-flex align-items-center">
                <FaUserCircle className="fs-4 me-2 text-primary" />
                <div>
                  <div className="fw-semibold text-truncate" style={{ maxWidth: "150px" }}>{user?.fullName || "User"}</div>
                  <span className="badge bg-secondary small text-capitalize" style={{ fontSize: "0.75rem" }}>
                    {user?.role === "company" ? "Job Provider" : user?.role === "admin" ? "Admin" : "Job Seeker"}
                  </span>
                </div>
              </div>
            </div>

            <ul className="nav nav-pills flex-column mb-auto">
              <li className="nav-item mb-2">
                <Link to="/dashboard" className="nav-link text-white bg-primary active">
                  🚀 Dashboard
                </Link>
              </li>
              <li className="nav-item mb-2">
                <Link to="/" className="nav-link text-white-50 hover-text-white">
                  🏠 Back to Home
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <hr className="bg-secondary" />
            <button className="btn btn-danger w-100 d-flex align-items-center justify-content-center py-2" onClick={handleLogout}>
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
