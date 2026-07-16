import { FaTools, FaUsers, FaUserShield, FaClipboardCheck } from "react-icons/fa";

function AdminDashboard() {
  return (
    <div className="card shadow-sm border-0 p-5 text-center">
      <div className="fs-1 text-warning mb-4">
        <FaTools />
      </div>
      <h2 className="fw-bold mb-3 text-dark">Admin Dashboard</h2>
      <p className="text-muted mx-auto mb-4" style={{ maxWidth: "500px" }}>
        Welcome to the pocketJob administration workspace. This section is currently under development. Detailed analytics, user management, and Verification approval screens are coming soon.
      </p>

      <div className="row g-3 justify-content-center mt-3" style={{ maxWidth: "600px", margin: "0 auto" }}>
        <div className="col-sm-4">
          <div className="card border p-3 bg-light text-muted">
            <FaUsers className="fs-3 mb-2" />
            <h6 className="fw-bold mb-0">Manage Users</h6>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="card border p-3 bg-light text-muted">
            <FaClipboardCheck className="fs-3 mb-2" />
            <h6 className="fw-bold mb-0">Verifications</h6>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="card border p-3 bg-light text-muted">
            <FaUserShield className="fs-3 mb-2" />
            <h6 className="fw-bold mb-0">Settings</h6>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
