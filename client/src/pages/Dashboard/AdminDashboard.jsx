import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getDashboardStats,
  getAllUsers,
  blockUser,
  unblockUser,
  verifyUser,
  unverifyUser,
  deleteUser,
  getAllJobs,
} from "../../services/adminService";
import { deleteJob } from "../../services/jobService";
import {
  FaUsers,
  FaBuilding,
  FaBriefcase,
  FaClipboardList,
  FaUserShield,
  FaUserCheck,
  FaUserClock,
  FaBan,
  FaChartPie,
  FaSearch,
  FaTrashAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaLock,
  FaUnlock,
  FaTachometerAlt,
  FaCrown,
} from "react-icons/fa";

function AdminDashboard() {
  const [urlParams, setUrlParams] = useSearchParams();
  const activeTab = urlParams.get("tab") || "overview";

  const setTab = (tab) => setUrlParams({ tab });

  return (
    <div>
      <h5 className="fw-bold mb-4 text-dark d-flex align-items-center">
        <FaUserShield className="me-2 text-primary" /> Admin Control Center
      </h5>

      {/* Local tab switcher (in addition to the sidebar) */}
      <ul className="nav nav-pills mb-4 gap-2">
        <li className="nav-item">
          <button
            className={`btn btn-sm ${activeTab === "overview" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setTab("overview")}
          >
            <FaTachometerAlt className="me-1" /> Overview
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`btn btn-sm ${activeTab === "users" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setTab("users")}
          >
            <FaUsers className="me-1" /> Manage Users
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`btn btn-sm ${activeTab === "jobs" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setTab("jobs")}
          >
            <FaBriefcase className="me-1" /> Manage Jobs
          </button>
        </li>
      </ul>

      {activeTab === "overview" && <OverviewTab setTab={setTab} setUrlParams={setUrlParams} />}
      {activeTab === "users" && <UsersTab />}
      {activeTab === "jobs" && <JobsTab />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Overview Tab                                                        */
/* ------------------------------------------------------------------ */
function OverviewTab({ setUrlParams }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getDashboardStats();
        setStats(data.stats);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!stats) {
    return <p className="text-muted">Unable to load dashboard statistics.</p>;
  }

  const statCards = [
    { label: "Job Seekers", value: stats.totals.users, icon: <FaUsers />, color: "primary" },
    { label: "Companies", value: stats.totals.companies, icon: <FaBuilding />, color: "success" },
    { label: "Active Jobs", value: stats.totals.jobs, icon: <FaBriefcase />, color: "warning" },
    { label: "Applications", value: stats.totals.applications, icon: <FaClipboardList />, color: "info" },
  ];

  const totalSubs = stats.subscriptions.free + stats.subscriptions.basic + stats.subscriptions.premium || 1;

  return (
    <div>
      {/* Top Stat Cards */}
      <div className="row g-3 mb-4">
        {statCards.map((card) => (
          <div className="col-6 col-md-3" key={card.label}>
            <div className="card border-0 shadow-sm p-3 h-100">
              <div className={`fs-3 text-${card.color} mb-2`}>{card.icon}</div>
              <h3 className="fw-bold mb-0 text-dark">{card.value}</h3>
              <span className="text-muted small">{card.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3 mb-4">
        {/* Moderation Snapshot */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm p-4 h-100">
            <h6 className="fw-bold text-dark border-bottom pb-2 mb-3 d-flex align-items-center">
              <FaUserShield className="me-2 text-primary" /> Moderation Snapshot
            </h6>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="d-flex align-items-center text-muted">
                <FaUserCheck className="me-2 text-success" /> Verified Users
              </span>
              <span className="fw-bold text-dark">{stats.moderation.verifiedUsers}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="d-flex align-items-center text-muted">
                <FaUserClock className="me-2 text-warning" /> Pending Verification
              </span>
              <span className="fw-bold text-dark">{stats.moderation.pendingVerification}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-0">
              <span className="d-flex align-items-center text-muted">
                <FaBan className="me-2 text-danger" /> Blocked Accounts
              </span>
              <span className="fw-bold text-dark">{stats.moderation.blockedUsers}</span>
            </div>
            {stats.moderation.pendingVerification > 0 && (
              <button
                className="btn btn-outline-primary btn-sm mt-3"
                onClick={() => setUrlParams({ tab: "users", verified: "false" })}
              >
                Review Pending Verifications
              </button>
            )}
          </div>
        </div>

        {/* Subscription Breakdown */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm p-4 h-100">
            <h6 className="fw-bold text-dark border-bottom pb-2 mb-3 d-flex align-items-center">
              <FaChartPie className="me-2 text-primary" /> Company Subscription Plans
            </h6>
            {[
              { label: "Premium", value: stats.subscriptions.premium, color: "warning" },
              { label: "Basic", value: stats.subscriptions.basic, color: "primary" },
              { label: "Free", value: stats.subscriptions.free, color: "secondary" },
            ].map((plan) => (
              <div key={plan.label} className="mb-3">
                <div className="d-flex justify-content-between small mb-1">
                  <span className="text-muted fw-semibold">{plan.label}</span>
                  <span className="text-dark">{plan.value}</span>
                </div>
                <div className="progress" style={{ height: "8px" }}>
                  <div
                    className={`progress-bar bg-${plan.color}`}
                    style={{ width: `${(plan.value / totalSubs) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            <div className="text-muted small mt-2">
              <strong>{stats.growth.newUsersThisWeek}</strong> new users and{" "}
              <strong>{stats.growth.newJobsThisWeek}</strong> new jobs in the last 7 days.
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="row g-3">
        <div className="col-md-6">
          <div className="card border-0 shadow-sm p-4 h-100">
            <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">Recently Joined</h6>
            {stats.recentUsers.length === 0 ? (
              <p className="text-muted small mb-0">No users yet.</p>
            ) : (
              <ul className="list-unstyled mb-0">
                {stats.recentUsers.map((u) => (
                  <li key={u._id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <div>
                      <div className="fw-semibold text-dark small">{u.fullName}</div>
                      <div className="text-muted" style={{ fontSize: "0.75rem" }}>{u.email}</div>
                    </div>
                    <span className="badge bg-light text-dark text-capitalize border">{u.role}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="col-md-6">
          <div className="card border-0 shadow-sm p-4 h-100">
            <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">Recently Posted Jobs</h6>
            {stats.recentJobs.length === 0 ? (
              <p className="text-muted small mb-0">No jobs yet.</p>
            ) : (
              <ul className="list-unstyled mb-0">
                {stats.recentJobs.map((j) => (
                  <li key={j._id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <div>
                      <div className="fw-semibold text-dark small">{j.title}</div>
                      <div className="text-muted" style={{ fontSize: "0.75rem" }}>{j.companyName}</div>
                    </div>
                    <span className="badge bg-light text-dark border">{j.slots} slots</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Users Tab                                                           */
/* ------------------------------------------------------------------ */
function UsersTab() {
  const [urlParams, setUrlParams] = useSearchParams();
  const role = urlParams.get("role") || "";
  const status = urlParams.get("status") || "";
  const verified = urlParams.get("verified") || "";
  const page = parseInt(urlParams.get("page") || "1", 10);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [data, setData] = useState({ users: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(urlParams);
    next.set("tab", "users");
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set("page", "1");
    setUrlParams(next);
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllUsers({
        role: role || undefined,
        status: status || undefined,
        verified: verified || undefined,
        search: debouncedSearch || undefined,
        page,
        limit: 8,
      });
      setData(data);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [role, status, verified, debouncedSearch, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleBlockToggle = async (u) => {
    const action = u.isBlocked ? "unblock" : "block";
    if (!window.confirm(`Are you sure you want to ${action} ${u.fullName}?`)) return;
    try {
      setActionLoadingId(u._id);
      if (u.isBlocked) {
        await toast.promise(unblockUser(u._id), {
          pending: "Unblocking user...",
          success: "User unblocked",
          error: "Failed to unblock user",
        });
      } else {
        await toast.promise(blockUser(u._id), {
          pending: "Blocking user...",
          success: "User blocked",
          error: "Failed to block user",
        });
      }
      fetchUsers();
    } catch (error) {
      // toast.promise already surfaced the error
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleVerifyToggle = async (u) => {
    try {
      setActionLoadingId(u._id);
      if (u.isVerified) {
        await toast.promise(unverifyUser(u._id), {
          pending: "Updating...",
          success: "Verification revoked",
          error: "Failed to update verification",
        });
      } else {
        await toast.promise(verifyUser(u._id), {
          pending: "Verifying...",
          success: "User verified",
          error: "Failed to verify user",
        });
      }
      fetchUsers();
    } catch (error) {
      // handled by toast.promise
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`This will permanently delete ${u.fullName} and all related data. Continue?`)) return;
    try {
      setActionLoadingId(u._id);
      await toast.promise(deleteUser(u._id), {
        pending: "Deleting user...",
        success: "User deleted",
        error: "Failed to delete user",
      });
      fetchUsers();
    } catch (error) {
      // handled by toast.promise
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="card border-0 shadow-sm p-4">
      {/* Filters */}
      <div className="row g-2 mb-3">
        <div className="col-md-4">
          <div className="input-group">
            <span className="input-group-text bg-white"><FaSearch className="text-muted" /></span>
            <input
              type="text"
              className="form-control"
              placeholder="Search name, email or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-3">
          <select className="form-select" value={role} onChange={(e) => updateParam("role", e.target.value)}>
            <option value="">All Roles</option>
            <option value="user">Job Seekers</option>
            <option value="company">Companies</option>
            <option value="admin">Admins</option>
          </select>
        </div>
        <div className="col-md-2">
          <select className="form-select" value={status} onChange={(e) => updateParam("status", e.target.value)}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
        <div className="col-md-3">
          <select className="form-select" value={verified} onChange={(e) => updateParam("verified", e.target.value)}>
            <option value="">All Verification</option>
            <option value="true">Verified</option>
            <option value="false">Pending Verification</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : data.users.length === 0 ? (
        <p className="text-muted text-center py-4 mb-0">No users match these filters.</p>
      ) : (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr className="text-muted small text-uppercase">
                <th>Name</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Status</th>
                <th>Verification</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div className="fw-semibold text-dark">{u.fullName}</div>
                    {u.companyName && <div className="text-muted small">{u.companyName}</div>}
                  </td>
                  <td>
                    <div className="small text-dark">{u.email}</div>
                    <div className="small text-muted">{u.phone}</div>
                  </td>
                  <td>
                    <span className="badge bg-light text-dark border text-capitalize">{u.role}</span>
                  </td>
                  <td>
                    <span className={`badge ${u.isBlocked ? "bg-danger" : "bg-success"}`}>
                      {u.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.isVerified ? "bg-success" : "bg-warning text-dark"}`}>
                      {u.isVerified ? "Verified" : "Pending"}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex justify-content-end gap-2">
                      {u.role !== "admin" && (
                        <>
                          <button
                            className={`btn btn-sm ${u.isVerified ? "btn-outline-warning" : "btn-outline-success"}`}
                            title={u.isVerified ? "Revoke verification" : "Verify user"}
                            disabled={actionLoadingId === u._id}
                            onClick={() => handleVerifyToggle(u)}
                          >
                            {u.isVerified ? <FaTimesCircle /> : <FaCheckCircle />}
                          </button>
                          <button
                            className={`btn btn-sm ${u.isBlocked ? "btn-outline-success" : "btn-outline-danger"}`}
                            title={u.isBlocked ? "Unblock user" : "Block user"}
                            disabled={actionLoadingId === u._id}
                            onClick={() => handleBlockToggle(u)}
                          >
                            {u.isBlocked ? <FaUnlock /> : <FaLock />}
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            title="Delete user"
                            disabled={actionLoadingId === u._id}
                            onClick={() => handleDelete(u)}
                          >
                            <FaTrashAlt />
                          </button>
                        </>
                      )}
                      {u.role === "admin" && (
                        <span className="text-muted small d-flex align-items-center">
                          <FaCrown className="me-1 text-warning" /> Protected
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {data.pages > 1 && (
        <div className="d-flex justify-content-center gap-2 mt-3">
          <button
            className="btn btn-sm btn-outline-secondary"
            disabled={page <= 1}
            onClick={() => updateParam("page", String(page - 1))}
          >
            Previous
          </button>
          <span className="align-self-center small text-muted">
            Page {data.page} of {data.pages}
          </span>
          <button
            className="btn btn-sm btn-outline-secondary"
            disabled={page >= data.pages}
            onClick={() => updateParam("page", String(page + 1))}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Jobs Tab                                                            */
/* ------------------------------------------------------------------ */
function JobsTab() {
  const [urlParams, setUrlParams] = useSearchParams();
  const page = parseInt(urlParams.get("page") || "1", 10);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [data, setData] = useState({ jobs: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(urlParams);
    next.set("tab", "jobs");
    next.set(key, value);
    setUrlParams(next);
  };

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllJobs({ search: debouncedSearch || undefined, page, limit: 8 });
      setData(data);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleDeleteJob = async (job) => {
    if (!window.confirm(`Delete job "${job.title}" from ${job.companyName}? This cannot be undone.`)) return;
    try {
      setDeletingId(job._id);
      await toast.promise(deleteJob(job._id), {
        pending: "Deleting job...",
        success: "Job deleted",
        error: "Failed to delete job",
      });
      fetchJobs();
    } catch (error) {
      // handled by toast.promise
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="card border-0 shadow-sm p-4">
      <div className="row g-2 mb-3">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text bg-white"><FaSearch className="text-muted" /></span>
            <input
              type="text"
              className="form-control"
              placeholder="Search by title, company or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : data.jobs.length === 0 ? (
        <p className="text-muted text-center py-4 mb-0">No jobs found.</p>
      ) : (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr className="text-muted small text-uppercase">
                <th>Job Title</th>
                <th>Company</th>
                <th>Category</th>
                <th>Location</th>
                <th>Applicants</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.jobs.map((job) => (
                <tr key={job._id}>
                  <td className="fw-semibold text-dark">{job.title}</td>
                  <td className="text-muted small">{job.companyName}</td>
                  <td><span className="badge bg-light text-dark border">{job.category}</span></td>
                  <td className="text-muted small">
                    {[job.location?.city, job.location?.state].filter(Boolean).join(", ") || "—"}
                  </td>
                  <td>{job.applicantCount}</td>
                  <td className="text-end">
                    <button
                      className="btn btn-sm btn-outline-danger"
                      disabled={deletingId === job._id}
                      onClick={() => handleDeleteJob(job)}
                    >
                      <FaTrashAlt className="me-1" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data.pages > 1 && (
        <div className="d-flex justify-content-center gap-2 mt-3">
          <button
            className="btn btn-sm btn-outline-secondary"
            disabled={page <= 1}
            onClick={() => updateParam("page", String(page - 1))}
          >
            Previous
          </button>
          <span className="align-self-center small text-muted">
            Page {data.page} of {data.pages}
          </span>
          <button
            className="btn btn-sm btn-outline-secondary"
            disabled={page >= data.pages}
            onClick={() => updateParam("page", String(page + 1))}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;