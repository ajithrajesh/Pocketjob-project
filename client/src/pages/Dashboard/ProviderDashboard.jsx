import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { postJob, getMyJobs, updateJob, deleteJob, getJobApplications, updateApplicationStatus } from "../../services/jobService";
import { getJobSeekers } from "../../services/userService";
import { 
  FaBuilding, FaPlusCircle, FaBriefcase, FaListAlt, 
  FaCalendarCheck, FaCreditCard, FaMapMarkerAlt, 
  FaEdit, FaTrashAlt, FaUsers, FaSearch, 
  FaUserCircle, FaCheck, FaTimes, FaFileAlt, 
  FaPhoneAlt, FaEnvelope, FaCalendarAlt 
} from "react-icons/fa";
import LocationAutocomplete from "../../components/common/LocationAutocomplete";

function ProviderDashboard() {
  const { user } = useAuth();
  const [urlParams, setUrlParams] = useSearchParams();
  const activeTab = urlParams.get("tab") || "overview";

  const setActiveTab = (tabName) => {
    setUrlParams({ tab: tabName });
  };
  
  // Job Post State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Catering",
    salary: "",
    slots: 1,
    date: "",
    state: "",
    district: "",
    city: "",
    pincode: "",
    requirements: "",
  });
  const [posting, setPosting] = useState(false);

  // Edit Job State
  const [editingJobId, setEditingJobId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    category: "Catering",
    salary: "",
    slots: 1,
    date: "",
    state: "",
    district: "",
    city: "",
    pincode: "",
    requirements: "",
  });
  const [updating, setUpdating] = useState(false);

  // Posted Jobs State
  const [myJobs, setMyJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  // Search Seekers State
  const [seekers, setSeekers] = useState([]);
  const [loadingSeekers, setLoadingSeekers] = useState(false);
  const [seekerFilters, setSeekerFilters] = useState({
    category: "",
    city: "",
    search: ""
  });

  // Applicants View State
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  const categoriesList = [
    "Catering",
    "Warehouse",
    "Driver",
    "Delivery",
    "Housekeeping",
    "Event Staff",
    "Valet Parking",
  ];

  const fetchMyJobs = async () => {
    try {
      setLoadingJobs(true);
      const data = await getMyJobs();
      setMyJobs(data.jobs || []);
    } catch (error) {
      toast.error("Failed to load your posted jobs");
    } finally {
      setLoadingJobs(false);
    }
  };

  const fetchSeekers = async () => {
    try {
      setLoadingSeekers(true);
      const data = await getJobSeekers(seekerFilters);
      setSeekers(data.seekers || []);
    } catch (error) {
      toast.error("Failed to load job seekers");
    } finally {
      setLoadingSeekers(false);
    }
  };

  const fetchApplicants = async (job) => {
    try {
      setLoadingApplicants(true);
      setSelectedJob(job);
      setActiveTab("applicants");
      const data = await getJobApplications(job._id);
      setApplicants(data.applications || []);
    } catch (error) {
      toast.error("Failed to load applicants for this job");
    } finally {
      setLoadingApplicants(false);
    }
  };

  useEffect(() => {
    if (activeTab === "my-jobs") {
      fetchMyJobs();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "seekers") {
      fetchSeekers();
    }
  }, [activeTab, seekerFilters.category]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.category) {
      toast.error("Please fill in title, description, and category");
      return;
    }

    try {
      setPosting(true);
      const jobData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        salary: formData.salary,
        slots: parseInt(formData.slots) || 1,
        date: formData.date,
        location: {
          state: formData.state,
          district: formData.district,
          city: formData.city,
          pincode: formData.pincode,
        },
        requirements: formData.requirements ? formData.requirements.split(",").map((req) => req.trim()) : [],
      };

      await postJob(jobData);
      toast.success("Job posted successfully!");
      setFormData({
        title: "",
        description: "",
        category: "Catering",
        salary: "",
        slots: 1,
        date: "",
        state: "",
        district: "",
        city: "",
        pincode: "",
        requirements: "",
      });
      setActiveTab("my-jobs");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to post job");
    } finally {
      setPosting(false);
    }
  };

  const startEditJob = (job) => {
    setEditingJobId(job._id);
    setEditFormData({
      title: job.title || "",
      description: job.description || "",
      category: job.category || "Catering",
      salary: job.salary || "",
      slots: job.slots || 1,
      date: job.date || "",
      state: job.location?.state || "",
      district: job.location?.district || "",
      city: job.location?.city || "",
      pincode: job.location?.pincode || "",
      requirements: job.requirements ? job.requirements.join(", ") : "",
    });
    setActiveTab("edit");
  };

  const handleUpdateJob = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      const jobData = {
        title: editFormData.title,
        description: editFormData.description,
        category: editFormData.category,
        salary: editFormData.salary,
        slots: parseInt(editFormData.slots) || 1,
        date: editFormData.date,
        location: {
          state: editFormData.state,
          district: editFormData.district,
          city: editFormData.city,
          pincode: editFormData.pincode,
        },
        requirements: editFormData.requirements ? editFormData.requirements.split(",").map((req) => req.trim()) : [],
      };

      await updateJob(editingJobId, jobData);
      toast.success("Job updated successfully!");
      setActiveTab("my-jobs");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update job");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job listing?")) return;
    try {
      await deleteJob(jobId);
      toast.success("Job listing deleted successfully");
      fetchMyJobs();
    } catch (error) {
      toast.error("Failed to delete job");
    }
  };

  const handleSeekerSearch = (e) => {
    e.preventDefault();
    fetchSeekers();
  };

  const handleUpdateStatus = async (appId, status) => {
    try {
      await updateApplicationStatus(appId, status);
      toast.success(`Application status marked as ${status}`);
      // Refresh applicants list
      const data = await getJobApplications(selectedJob._id);
      setApplicants(data.applications || []);
    } catch (error) {
      toast.error("Failed to update application status");
    }
  };

  // Helper to format dates
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getDaysRemaining = (endDateStr) => {
    if (!endDateStr) return 0;
    const end = new Date(endDateStr);
    const today = new Date();
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysRemaining = getDaysRemaining(user?.subscription?.endDate);

  return (
    <div className="card shadow-sm border-0 p-4">
      {activeTab === "edit" && (
        <h5 className="fw-bold mb-4 text-warning-emphasis d-flex align-items-center">
          <FaEdit className="me-2" /> Editing Job
        </h5>
      )}
      {activeTab === "applicants" && (
        <h5 className="fw-bold mb-4 text-dark d-flex align-items-center">
          <FaUsers className="me-2" /> Applicants
        </h5>
      )}

      {/* Tab Content: Overview */}
      {activeTab === "overview" && (
        <div className="row g-4">
          <div className="col-md-6">
            <div className="card border-0 bg-white shadow-sm p-4 h-100">
              <h5 className="fw-bold mb-4 text-dark border-bottom pb-2 d-flex align-items-center">
                <FaBuilding className="text-primary me-2" /> Organisation Details
              </h5>
              <div className="mb-3">
                <label className="text-muted small d-block">Organisation Name</label>
                <span className="fw-bold text-dark fs-5">{user?.companyName || "N/A"}</span>
              </div>
              <div className="mb-3">
                <label className="text-muted small d-block">Organisation / Registration ID</label>
                <span className="fw-semibold text-dark">{user?.organisationId || "N/A"}</span>
              </div>
              <div className="mb-3">
                <label className="text-muted small d-block">Contact Representative</label>
                <span className="fw-semibold text-dark">{user?.fullName}</span>
              </div>
              <div className="mb-3">
                <label className="text-muted small d-block">Email Address</label>
                <span className="text-dark">{user?.email}</span>
              </div>
              <div className="mb-0">
                <label className="text-muted small d-block">Phone Number</label>
                <span className="text-dark">{user?.phone}</span>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card border-0 bg-white shadow-sm p-4 h-100">
              <h5 className="fw-bold mb-4 text-dark border-bottom pb-2 d-flex align-items-center">
                <FaCreditCard className="text-success me-2" /> Subscription Plan
              </h5>
              <div className="p-3 bg-light border rounded mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="badge bg-success text-white py-2 px-3 fw-bold">
                    {user?.subscription?.plan?.toUpperCase()} TRIAL
                  </span>
                  <span className="badge bg-primary">ACTIVE</span>
                </div>
                <h4 className="fw-bold text-dark mt-2">1 Month Free Plan</h4>
                <p className="text-muted small mb-0">Full access to post part-time job openings.</p>
              </div>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <div className="border p-2 rounded text-center">
                    <span className="text-muted small d-block">Start Date</span>
                    <strong className="text-dark">{formatDate(user?.subscription?.startDate)}</strong>
                  </div>
                </div>
                <div className="col-6">
                  <div className="border p-2 rounded text-center">
                    <span className="text-muted small d-block">End Date</span>
                    <strong className="text-danger">{formatDate(user?.subscription?.endDate)}</strong>
                  </div>
                </div>
              </div>
              <div className="alert alert-info py-2 d-flex align-items-center mb-0">
                <FaCalendarCheck className="me-2 text-info fs-5" />
                <span>You have <strong>{daysRemaining} days</strong> remaining in your free trial.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Post a Job */}
      {activeTab === "post" && (
        <div>
          <h4 className="fw-bold mb-3 text-dark d-flex align-items-center">
            <FaPlusCircle className="text-primary me-2" /> Post a New Job Opening
          </h4>
          <p className="text-muted small mb-4">
            Provide details about the part-time shift, category, and requirements to attract qualified job seekers.
          </p>
          <form onSubmit={handlePostJob} className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Job Title</label>
              <input
                type="text"
                className="form-control"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Assistant Chef for Weekend Event"
                required
              />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">Job Category</label>
              <select
                className="form-select"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">Job Date / shift time</label>
              <input
                type="text"
                className="form-control"
                name="date"
                value={formData.date}
                onChange={handleChange}
                placeholder="e.g. Sunday, 26th July"
                required
              />
            </div>
            <div className="col-12">
              <label className="form-label fw-semibold">Job Description</label>
              <textarea
                className="form-control"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Describe roles, tasks, working environment, shifts, and timing details..."
                required
              ></textarea>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Salary / Pay Rate</label>
              <input
                type="text"
                className="form-control"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                placeholder="e.g. ₹1500 / Day"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Available Slots</label>
              <input
                type="number"
                className="form-control"
                name="slots"
                value={formData.slots}
                onChange={handleChange}
                min="1"
                required
              />
            </div>
            <div className="col-12">
              <label className="form-label fw-semibold">Requirements (comma separated)</label>
              <input
                type="text"
                className="form-control"
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                placeholder="e.g. Basic catering skills, Aadhaar Card, Black shoes"
              />
            </div>
            <h5 className="fw-bold mt-4 mb-2 text-secondary border-bottom pb-2">Shift Location</h5>
            <div className="col-md-3">
              <label className="form-label">City</label>
              <input type="text" className="form-control" name="city" value={formData.city} onChange={handleChange} placeholder="e.g. Ernakulam" />
            </div>
            <div className="col-md-3">
              <label className="form-label">District</label>
              <input type="text" className="form-control" name="district" value={formData.district} onChange={handleChange} placeholder="e.g. Kochi" />
            </div>
            <div className="col-md-3">
              <label className="form-label">State</label>
              <input type="text" className="form-control" name="state" value={formData.state} onChange={handleChange} placeholder="e.g. Kerala" />
            </div>
            <div className="col-md-3">
              <label className="form-label">Pincode</label>
              <input type="text" className="form-control" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="e.g. 682024" />
            </div>
            <div className="col-12 mt-4">
              <button type="submit" className="btn btn-primary w-100 py-2 fw-bold" disabled={posting}>
                {posting ? "Posting Job..." : "Post Job Opening"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab Content: Edit Job */}
      {activeTab === "edit" && (
        <div>
          <h4 className="fw-bold mb-3 text-dark d-flex align-items-center">
            <FaEdit className="text-warning me-2" /> Edit Job Opening
          </h4>
          <form onSubmit={handleUpdateJob} className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Job Title</label>
              <input
                type="text"
                className="form-control"
                name="title"
                value={editFormData.title}
                onChange={handleEditChange}
                required
              />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">Job Category</label>
              <select
                className="form-select"
                name="category"
                value={editFormData.category}
                onChange={handleEditChange}
              >
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">Job Date / shift time</label>
              <input
                type="text"
                className="form-control"
                name="date"
                value={editFormData.date}
                onChange={handleEditChange}
                required
              />
            </div>
            <div className="col-12">
              <label className="form-label fw-semibold">Job Description</label>
              <textarea
                className="form-control"
                name="description"
                value={editFormData.description}
                onChange={handleEditChange}
                rows="4"
                required
              ></textarea>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Salary / Pay Rate</label>
              <input
                type="text"
                className="form-control"
                name="salary"
                value={editFormData.salary}
                onChange={handleEditChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Available Slots</label>
              <input
                type="number"
                className="form-control"
                name="slots"
                value={editFormData.slots}
                onChange={handleEditChange}
                min="1"
                required
              />
            </div>
            <div className="col-12">
              <label className="form-label fw-semibold">Requirements (comma separated)</label>
              <input
                type="text"
                className="form-control"
                name="requirements"
                value={editFormData.requirements}
                onChange={handleEditChange}
              />
            </div>
            <h5 className="fw-bold mt-4 mb-2 text-secondary border-bottom pb-2">Shift Location</h5>
            <div className="col-md-3">
              <label className="form-label">City</label>
              <input type="text" className="form-control" name="city" value={editFormData.city} onChange={handleEditChange} />
            </div>
            <div className="col-md-3">
              <label className="form-label">District</label>
              <input type="text" className="form-control" name="district" value={editFormData.district} onChange={handleEditChange} />
            </div>
            <div className="col-md-3">
              <label className="form-label">State</label>
              <input type="text" className="form-control" name="state" value={editFormData.state} onChange={handleEditChange} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Pincode</label>
              <input type="text" className="form-control" name="pincode" value={editFormData.pincode} onChange={handleEditChange} />
            </div>
            <div className="col-6 mt-4">
              <button type="button" className="btn btn-outline-secondary w-100 py-2 fw-semibold" onClick={() => setActiveTab("my-jobs")}>
                Cancel
              </button>
            </div>
            <div className="col-6 mt-4">
              <button type="submit" className="btn btn-success w-100 py-2 fw-bold" disabled={updating}>
                {updating ? "Updating..." : "Save Updates"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab Content: My Posted Jobs */}
      {activeTab === "my-jobs" && (
        <div>
          <h4 className="fw-bold mb-4 text-dark d-flex align-items-center">
            <FaListAlt className="text-primary me-2" /> Your Job Listings
          </h4>

          {loadingJobs ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : myJobs.length === 0 ? (
            <div className="text-center py-5 text-muted bg-white border rounded">
              You haven't posted any jobs yet. Click "Post a Job" tab to create your first listing!
            </div>
          ) : (
            <div className="row g-3">
              {myJobs.map((job) => (
                <div className="col-md-6" key={job._id}>
                  <div className="card h-100 shadow-sm border border-light">
                    <div className="card-body d-flex flex-column justify-content-between">
                      <div>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h5 className="card-title fw-bold text-dark mb-0">{job.title}</h5>
                          <span className="badge bg-secondary">{job.category}</span>
                        </div>
                        <p className="card-text text-muted small mt-2">{job.description}</p>
                        
                        <div className="d-flex flex-wrap gap-2 mb-3 mt-3">
                          <span className="text-muted small d-flex align-items-center">
                            <FaMapMarkerAlt className="me-1 text-danger" /> 
                            {job.location?.city ? `${job.location.city}, ${job.location.state}` : "Remote"}
                          </span>
                          <span className="text-success small fw-bold me-2">💰 {job.salary || "Not Specified"}</span>
                          {job.date && (
                            <span className="text-muted small d-flex align-items-center">
                              <FaCalendarAlt className="me-1 text-primary" /> {job.date}
                            </span>
                          )}
                        </div>

                        <div className="small text-muted mb-2">
                          <strong>Requirements:</strong> {job.requirements?.join(", ") || "None"}
                        </div>
                        <div className="small text-muted mb-2">
                          <strong>Slots:</strong> {job.slots || 1} available
                        </div>
                      </div>

                      <div className="border-top pt-3 mt-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="text-muted small">Posted: {formatDate(job.createdAt)}</span>
                          <span className="badge bg-success">Active</span>
                        </div>
                        <div className="d-flex gap-2 mt-2">
                          <button className="btn btn-sm btn-outline-primary flex-grow-1 d-flex align-items-center justify-content-center" onClick={() => fetchApplicants(job)}>
                            <FaUsers className="me-1" /> View Applicants
                          </button>
                          <button className="btn btn-sm btn-outline-warning" title="Edit Job" onClick={() => startEditJob(job)}>
                            <FaEdit /> Edit
                          </button>
                          <button className="btn btn-sm btn-outline-danger" title="Delete Job" onClick={() => handleDeleteJob(job._id)}>
                            <FaTrashAlt />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Job Applicants */}
      {activeTab === "applicants" && selectedJob && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold mb-0 text-dark">
              Applicants for: <span className="text-primary">{selectedJob.title}</span>
            </h4>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setActiveTab("my-jobs")}>
              ← Back to Listings
            </button>
          </div>

          {loadingApplicants ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : applicants.length === 0 ? (
            <div className="text-center py-5 text-muted bg-white border rounded">
              No candidates have applied to this listing yet.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover bg-white border align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Candidate</th>
                    <th>Contact</th>
                    <th>Location / Gender</th>
                    <th>Verification Documents</th>
                    <th className="text-center">Status</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applicants.map((app) => (
                    <tr key={app._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaUserCircle className="text-muted fs-3 me-2" />
                          <div>
                            <div className="fw-bold">{app.seeker?.fullName}</div>
                            <span className="small text-muted text-capitalize">Exp: {app.seeker?.experience || 0} years</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="small"><FaEnvelope className="text-muted me-1" /> {app.seeker?.email}</div>
                        <div className="small"><FaPhoneAlt className="text-muted me-1" /> {app.seeker?.phone}</div>
                      </td>
                      <td>
                        <div className="small">📍 {app.seeker?.address?.city || "N/A"}, {app.seeker?.address?.state || "N/A"}</div>
                        <div className="small text-muted">{app.seeker?.gender || "Not Specified"}</div>
                      </td>
                      <td>
                        <div className="d-flex flex-column gap-1">
                          {app.seeker?.aadhaarFront?.url && (
                            <a href={app.seeker.aadhaarFront.url} target="_blank" rel="noreferrer" className="btn btn-sm btn-link text-start text-decoration-none p-0">
                              <FaFileAlt className="text-primary me-1" /> Aadhaar Front
                            </a>
                          )}
                          {app.seeker?.aadhaarBack?.url && (
                            <a href={app.seeker.aadhaarBack.url} target="_blank" rel="noreferrer" className="btn btn-sm btn-link text-start text-decoration-none p-0">
                              <FaFileAlt className="text-primary me-1" /> Aadhaar Back
                            </a>
                          )}
                          {app.seeker?.drivingLicense?.url && (
                            <a href={app.seeker.drivingLicense.url} target="_blank" rel="noreferrer" className="btn btn-sm btn-link text-start text-decoration-none p-0">
                              <FaFileAlt className="text-success me-1" /> Driving License
                            </a>
                          )}
                          {app.seeker?.resume?.url && (
                            <a href={app.seeker.resume.url} target="_blank" rel="noreferrer" className="btn btn-sm btn-link text-start text-decoration-none p-0">
                              <FaFileAlt className="text-warning me-1" /> Resume / CV
                            </a>
                          )}
                          {!app.seeker?.aadhaarFront?.url && !app.seeker?.resume?.url && (
                            <span className="text-muted small">No docs uploaded</span>
                          )}
                        </div>
                      </td>
                      <td className="text-center">
                        <span className={`badge py-2 px-3 text-capitalize ${app.status === "accepted" ? "bg-success" : app.status === "rejected" ? "bg-danger" : "bg-warning text-dark"}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="text-center">
                        {app.status === "pending" ? (
                          <div className="d-flex justify-content-center gap-2">
                            <button className="btn btn-sm btn-success d-flex align-items-center" onClick={() => handleUpdateStatus(app._id, "accepted")}>
                              <FaCheck className="me-1" /> Accept
                            </button>
                            <button className="btn btn-sm btn-danger d-flex align-items-center" onClick={() => handleUpdateStatus(app._id, "rejected")}>
                              <FaTimes className="me-1" /> Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted small">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Search Seekers */}
      {activeTab === "seekers" && (
        <div>
          <h4 className="fw-bold mb-3 text-dark">Find Job Seekers</h4>
          <p className="text-muted small mb-4">Browse and contact workers looking for part-time shift jobs.</p>

          <form onSubmit={handleSeekerSearch} className="row g-2 mb-4 bg-light p-3 rounded">
            <div className="col-md-4">
              <select 
                className="form-select"
                value={seekerFilters.category}
                onChange={(e) => setSeekerFilters({ ...seekerFilters, category: e.target.value })}
              >
                <option value="">All Preferred Categories</option>
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <LocationAutocomplete 
                className="form-control" 
                placeholder="City (e.g. Kochi)" 
                value={seekerFilters.city}
                onChange={(val) => setSeekerFilters({ ...seekerFilters, city: val })}
              />
            </div>
            <div className="col-md-3">
              <input 
                type="text" 
                className="form-control" 
                placeholder="Search name, skills..." 
                value={seekerFilters.search}
                onChange={(e) => setSeekerFilters({ ...seekerFilters, search: e.target.value })}
              />
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-primary w-100">
                <FaSearch className="me-1" /> Filter
              </button>
            </div>
          </form>

          {loadingSeekers ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : seekers.length === 0 ? (
            <div className="text-center py-5 text-muted bg-white border rounded">
              No job seekers found matching your criteria.
            </div>
          ) : (
            <div className="row g-3">
              {seekers.map((seeker) => (
                <div className="col-md-6 col-lg-4" key={seeker._id}>
                  <div className="card h-100 shadow-sm border">
                    <div className="card-body d-flex flex-column justify-content-between">
                      <div>
                        <div className="d-flex align-items-center mb-3">
                          <FaUserCircle className="text-muted fs-2 me-2" />
                          <div>
                            <h5 className="fw-bold text-dark mb-0">{seeker.fullName}</h5>
                            <span className="small text-muted">{seeker.gender || "Gender: N/A"}</span>
                          </div>
                        </div>

                        <div className="small text-muted mb-2">
                          <strong>Location:</strong> {seeker.address?.city || "N/A"}, {seeker.address?.state || "N/A"}
                        </div>
                        <div className="small text-muted mb-2">
                          <strong>Experience:</strong> {seeker.experience || 0} years
                        </div>

                        <div className="small text-muted mb-3">
                          <strong>Interests:</strong>
                          <div className="d-flex flex-wrap gap-1 mt-1">
                            {seeker.preferredCategories?.map((cat) => (
                              <span key={cat} className="badge bg-secondary small">{cat}</span>
                            )) || <span className="text-muted small">None specified</span>}
                          </div>
                        </div>

                        {seeker.skills && seeker.skills.length > 0 && (
                          <div className="small text-muted mb-3">
                            <strong>Skills:</strong>
                            <div className="d-flex flex-wrap gap-1 mt-1">
                              {seeker.skills.map((skill) => (
                                <span key={skill} className="badge bg-light text-dark border small">{skill}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="border-top pt-2 mt-2">
                          <div className="small text-dark mb-1"><FaEnvelope className="text-muted me-2" /> {seeker.email}</div>
                          <div className="small text-dark"><FaPhoneAlt className="text-muted me-2" /> {seeker.phone}</div>
                        </div>
                      </div>

                      <div className="mt-3 border-top pt-2">
                        <h6 className="fw-bold small text-muted mb-2">Documents:</h6>
                        <div className="d-flex flex-wrap gap-2">
                          {seeker.aadhaarFront?.url && (
                            <a href={seeker.aadhaarFront.url} target="_blank" rel="noreferrer" className="badge bg-primary text-decoration-none py-2">
                              Aadhaar
                            </a>
                          )}
                          {seeker.drivingLicense?.url && (
                            <a href={seeker.drivingLicense.url} target="_blank" rel="noreferrer" className="badge bg-success text-decoration-none py-2">
                              License
                            </a>
                          )}
                          {seeker.resume?.url && (
                            <a href={seeker.resume.url} target="_blank" rel="noreferrer" className="badge bg-warning text-dark text-decoration-none py-2">
                              Resume
                            </a>
                          )}
                          {!seeker.aadhaarFront?.url && !seeker.drivingLicense?.url && !seeker.resume?.url && (
                            <span className="text-muted small">No verified documents</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ProviderDashboard;
