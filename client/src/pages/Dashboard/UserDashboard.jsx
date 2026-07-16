import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { getProfile, updateProfile, uploadAadhaarFront, uploadAadhaarBack, uploadLicense, uploadResume } from "../../services/userService";
import { searchJobs, getRecommendedJobs, applyToJob, getMyAppliedJobs } from "../../services/jobService";
import { FaUpload, FaSearch, FaMapMarkerAlt, FaFileAlt, FaCheckCircle, FaUser, FaSlidersH } from "react-icons/fa";
import LocationAutocomplete from "../../components/common/LocationAutocomplete";

function UserDashboard() {
  const { user: authUser, setUser } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [urlParams, setUrlParams] = useSearchParams();
  const activeTab = urlParams.get("tab") || "search";

  const setActiveTab = (tabName) => {
    setUrlParams({ tab: tabName });
  };
  
  // Job Search State
  const [searchParams, setSearchParams] = useState({ category: "", location: "" });
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  // Recommended Jobs State
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  // Applied Jobs State
  const [appliedJobsStatus, setAppliedJobsStatus] = useState({});
  const [appliedJobs, setAppliedJobs] = useState([]);

  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    gender: "",
    state: "",
    district: "",
    city: "",
    pincode: "",
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Document Upload Loading States
  const [uploading, setUploading] = useState({
    aadhaarFront: false,
    aadhaarBack: false,
    license: false,
    resume: false,
  });

  const categoriesList = [
    "Catering",
    "Warehouse",
    "Driver",
    "Delivery",
    "Housekeeping",
    "Event Staff",
    "Valet Parking",
  ];

  // Fetch Full Profile
  const fetchProfile = async () => {
    try {
      const data = await getProfile();
      setUserProfile(data.user);
      setFormData({
        fullName: data.user.fullName || "",
        phone: data.user.phone || "",
        gender: data.user.gender || "",
        state: data.user.address?.state || "",
        district: data.user.address?.district || "",
        city: data.user.address?.city || "",
        pincode: data.user.address?.pincode || "",
      });
    } catch (error) {
      toast.error("Failed to load user profile");
    }
  };

  // Fetch Jobs based on parameters
  const fetchJobs = async () => {
    try {
      setLoadingJobs(true);
      const data = await searchJobs(searchParams);
      setJobs(data.jobs || []);
    } catch (error) {
      toast.error("Error searching jobs");
    } finally {
      setLoadingJobs(false);
    }
  };

  // Fetch Recommended Jobs
  const fetchRecommendations = async () => {
    try {
      setLoadingRecs(true);
      const data = await getRecommendedJobs();
      setRecommendedJobs(data.jobs || []);
    } catch (error) {
      toast.error("Error fetching recommended jobs");
    } finally {
      setLoadingRecs(false);
    }
  };

  const fetchAppliedJobs = async () => {
    try {
      const data = await getMyAppliedJobs();
      setAppliedJobs(data.applications || []);
      const statusMap = {};
      (data.applications || []).forEach(app => {
        const jobId = app.job?._id || app.job;
        if (jobId) {
          statusMap[jobId] = app.status || "pending";
        }
      });
      setAppliedJobsStatus(statusMap);
    } catch (error) {
      console.error("Failed to load applied jobs", error);
    }
  };

  const handleApply = async (jobId, jobTitle) => {
    try {
      await applyToJob(jobId);
      toast.success(`Successfully applied for "${jobTitle}"!`);
      setAppliedJobsStatus(prev => ({
        ...prev,
        [jobId]: "pending"
      }));
      fetchAppliedJobs();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit application");
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchAppliedJobs();
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [searchParams.category]);

  useEffect(() => {
    if (activeTab === "recommended") {
      fetchRecommendations();
    }
  }, [activeTab]);

  // Handle Search Form Submit
  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  // Handle Profile Update Form
  const handleProfileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setUpdatingProfile(true);
      const updateData = {
        fullName: formData.fullName,
        phone: formData.phone,
        gender: formData.gender,
        address: {
          state: formData.state,
          district: formData.district,
          city: formData.city,
          pincode: formData.pincode,
        }
      };
      const response = await updateProfile(updateData);
      setUserProfile(response.user);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Handle File Uploads
  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading((prev) => ({ ...prev, [type]: true }));
      let response;

      if (type === "aadhaarFront") {
        response = await uploadAadhaarFront(file);
      } else if (type === "aadhaarBack") {
        response = await uploadAadhaarBack(file);
      } else if (type === "license") {
        response = await uploadLicense(file);
      } else if (type === "resume") {
        response = await uploadResume(file);
      }

      setUserProfile(response.user);
      toast.success(`${type.replace(/([A-Z])/g, " $1")} uploaded successfully!`);
    } catch (error) {
      toast.error(`Failed to upload ${type}`);
    } finally {
      setUploading((prev) => ({ ...prev, [type]: false }));
    }
  };

  return (
    <div className="card shadow-sm border-0 p-4">

      {/* Tab Content: Job Search */}
      {activeTab === "search" && (
        <div>
          <h4 className="fw-bold mb-3 text-dark">Find Part-Time Jobs</h4>
          <form onSubmit={handleSearch} className="row g-3 mb-4 bg-light p-3 rounded">
            <div className="col-md-5">
              <label className="form-label text-muted small">Category</label>
              <select
                className="form-select"
                value={searchParams.category}
                onChange={(e) => setSearchParams({ ...searchParams, category: e.target.value })}
              >
                <option value="">All Categories</option>
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="col-md-5">
              <label className="form-label text-muted small">Location (City, State, District, Pin)</label>
              <LocationAutocomplete
                className="form-control"
                placeholder="e.g. Cochin, Kerala"
                value={searchParams.location}
                onChange={(val) => setSearchParams({ ...searchParams, location: val })}
              />
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button type="submit" className="btn btn-primary w-100 py-2 d-flex align-items-center justify-content-center">
                <FaSearch className="me-2" /> Search
              </button>
            </div>
          </form>

          {loadingJobs ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-5 text-muted bg-white border rounded">
              No jobs found. Try adjusting your search filters.
            </div>
          ) : (
            <div className="row g-3">
              {jobs.map((job) => (
                <div className="col-md-6" key={job._id}>
                  <div className="card h-100 shadow-sm border border-light">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title fw-bold text-dark mb-0">{job.title}</h5>
                        <span className="badge bg-secondary">{job.category}</span>
                      </div>
                      <h6 className="text-primary mb-3">🏢 {job.companyName}</h6>
                      <p className="card-text text-muted text-truncate">{job.description}</p>
                      
                      <div className="d-flex flex-wrap gap-2 mb-3">
                        <span className="text-muted small d-flex align-items-center">
                          <FaMapMarkerAlt className="me-1 text-danger" /> 
                          {job.location?.city ? `${job.location.city}, ${job.location.state}` : "Remote"}
                        </span>
                        <span className="text-success small fw-bold">💰 {job.salary || "Not Specified"}</span>
                      </div>

                      <div className="small text-muted mb-3">
                        <strong>Requirements:</strong> {job.requirements?.join(", ") || "None listed"}
                      </div>
                      
                      {appliedJobsStatus[job._id] ? (
                        appliedJobsStatus[job._id] === "accepted" ? (
                          <button className="btn btn-success w-100" disabled>
                            Accepted
                          </button>
                        ) : appliedJobsStatus[job._id] === "rejected" ? (
                          <button className="btn btn-danger w-100" disabled>
                            Rejected
                          </button>
                        ) : (
                          <button className="btn btn-warning text-dark w-100" disabled>
                            Applied (Pending)
                          </button>
                        )
                      ) : (
                        <button className="btn btn-outline-primary w-100" onClick={() => handleApply(job._id, job.title)}>
                          Quick Apply
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Recommended Jobs */}
      {activeTab === "recommended" && (
        <div>
          <h4 className="fw-bold mb-2 text-dark">Recommended For You</h4>
          <p className="text-muted mb-4 small">Jobs that match your selected preferences: <strong>{userProfile?.preferredCategories?.join(", ") || "None selected"}</strong></p>

          {loadingRecs ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : recommendedJobs.length === 0 ? (
            <div className="text-center py-5 text-muted bg-white border rounded">
              No recommended jobs matching your categories. Update your profile preferences to see custom recommendations!
            </div>
          ) : (
            <div className="row g-3">
              {recommendedJobs.map((job) => (
                <div className="col-md-6" key={job._id}>
                  <div className="card h-100 shadow-sm border border-light">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title fw-bold text-dark mb-0">{job.title}</h5>
                        <span className="badge bg-primary">{job.category}</span>
                      </div>
                      <h6 className="text-primary mb-3">🏢 {job.companyName}</h6>
                      <p className="card-text text-muted text-truncate">{job.description}</p>
                      
                      <div className="d-flex flex-wrap gap-2 mb-3">
                        <span className="text-muted small d-flex align-items-center">
                          <FaMapMarkerAlt className="me-1 text-danger" /> 
                          {job.location?.city ? `${job.location.city}, ${job.location.state}` : "Remote"}
                        </span>
                        <span className="text-success small fw-bold">💰 {job.salary || "Not Specified"}</span>
                      </div>

                      <div className="small text-muted mb-3">
                        <strong>Requirements:</strong> {job.requirements?.join(", ") || "None listed"}
                      </div>
                      
                      {appliedJobsStatus[job._id] ? (
                        appliedJobsStatus[job._id] === "accepted" ? (
                          <button className="btn btn-success w-100" disabled>
                            Accepted
                          </button>
                        ) : appliedJobsStatus[job._id] === "rejected" ? (
                          <button className="btn btn-danger w-100" disabled>
                            Rejected
                          </button>
                        ) : (
                          <button className="btn btn-warning text-dark w-100" disabled>
                            Applied (Pending)
                          </button>
                        )
                      ) : (
                        <button className="btn btn-primary w-100" onClick={() => handleApply(job._id, job.title)}>
                          Quick Apply
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Profile */}
      {activeTab === "profile" && userProfile && (
        <div className="row g-4 justify-content-center">
          {/* Profile Form */}
          <div className="col-lg-8">
            <div className="card border-0 bg-white shadow-sm p-4">
              <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
                <h5 className="fw-bold text-dark m-0">Personal Profile</h5>
                <button 
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? "Cancel" : "Edit Profile"}
                </button>
              </div>

              <form onSubmit={handleProfileUpdate}>
                <div className="mb-3">
                  <label className="form-label text-muted small">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted small">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    value={userProfile.email}
                    disabled
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted small">Phone Number</label>
                  <input
                    type="text"
                    className="form-control"
                    name="phone"
                    value={formData.phone}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted small">Gender</label>
                  <select
                    className="form-select"
                    name="gender"
                    value={formData.gender}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <h6 className="fw-bold mt-4 mb-3 text-secondary">Address Details</h6>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-muted small">City</label>
                    <input
                      type="text"
                      className="form-control"
                      name="city"
                      value={formData.city}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-muted small">District</label>
                    <input
                      type="text"
                      className="form-control"
                      name="district"
                      value={formData.district}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-muted small">State</label>
                    <input
                      type="text"
                      className="form-control"
                      name="state"
                      value={formData.state}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-muted small">Pincode</label>
                    <input
                      type="text"
                      className="form-control"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                {isEditing && (
                  <button 
                    type="submit" 
                    className="btn btn-success w-100 py-2 mt-3"
                    disabled={updatingProfile}
                  >
                    {updatingProfile ? "Updating..." : "Save Changes"}
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Documents */}
      {activeTab === "documents" && userProfile && (
        <div className="row g-4 justify-content-center">
          {/* Document Upload */}
          <div className="col-lg-8">
            <div className="card border-0 bg-white shadow-sm p-4">
              <h5 className="fw-bold text-dark mb-4 border-bottom pb-2">Verification Documents</h5>

              {/* Upload Item: Aadhaar Front */}
              <div className="p-3 border rounded mb-3 bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="fw-bold m-0 text-dark">Aadhaar Card (Front)</h6>
                    <p className="text-muted small m-0">National Identity card photo (Front)</p>
                  </div>
                  {userProfile.aadhaarFront?.url ? (
                    <span className="text-success d-flex align-items-center small fw-bold">
                      <FaCheckCircle className="me-1" /> Uploaded
                    </span>
                  ) : (
                    <span className="text-warning small fw-bold">Pending Upload</span>
                  )}
                </div>
                <div className="mt-3 d-flex align-items-center gap-3">
                  <input
                    type="file"
                    className="form-control form-control-sm"
                    onChange={(e) => handleFileUpload(e, "aadhaarFront")}
                    disabled={uploading.aadhaarFront}
                    accept="image/*,.pdf"
                  />
                  {userProfile.aadhaarFront?.url && (
                    <a href={userProfile.aadhaarFront.url} target="_blank" rel="noreferrer" className="btn btn-sm btn-link text-decoration-none fw-bold">
                      View
                    </a>
                  )}
                </div>
              </div>

              {/* Upload Item: Aadhaar Back */}
              <div className="p-3 border rounded mb-3 bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="fw-bold m-0 text-dark">Aadhaar Card (Back)</h6>
                    <p className="text-muted small m-0">National Identity card photo (Back)</p>
                  </div>
                  {userProfile.aadhaarBack?.url ? (
                    <span className="text-success d-flex align-items-center small fw-bold">
                      <FaCheckCircle className="me-1" /> Uploaded
                    </span>
                  ) : (
                    <span className="text-warning small fw-bold">Pending Upload</span>
                  )}
                </div>
                <div className="mt-3 d-flex align-items-center gap-3">
                  <input
                    type="file"
                    className="form-control form-control-sm"
                    onChange={(e) => handleFileUpload(e, "aadhaarBack")}
                    disabled={uploading.aadhaarBack}
                    accept="image/*,.pdf"
                  />
                  {userProfile.aadhaarBack?.url && (
                    <a href={userProfile.aadhaarBack.url} target="_blank" rel="noreferrer" className="btn btn-sm btn-link text-decoration-none fw-bold">
                      View
                    </a>
                  )}
                </div>
              </div>

              {/* Upload Item: Driving License */}
              <div className="p-3 border rounded mb-3 bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="fw-bold m-0 text-dark">Driving License</h6>
                    <p className="text-muted small m-0">Necessary for driving jobs</p>
                  </div>
                  {userProfile.drivingLicense?.url ? (
                    <span className="text-success d-flex align-items-center small fw-bold">
                      <FaCheckCircle className="me-1" /> Uploaded
                    </span>
                  ) : (
                    <span className="text-warning small fw-bold">Pending Upload</span>
                  )}
                </div>
                <div className="mt-3 d-flex align-items-center gap-3">
                  <input
                    type="file"
                    className="form-control form-control-sm"
                    onChange={(e) => handleFileUpload(e, "license")}
                    disabled={uploading.license}
                    accept="image/*,.pdf"
                  />
                  {userProfile.drivingLicense?.url && (
                    <a href={userProfile.drivingLicense.url} target="_blank" rel="noreferrer" className="btn btn-sm btn-link text-decoration-none fw-bold">
                      View
                    </a>
                  )}
                </div>
              </div>

              {/* Upload Item: Resume */}
              <div className="p-3 border rounded mb-3 bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="fw-bold m-0 text-dark">Professional Resume / CV</h6>
                    <p className="text-muted small m-0">PDF format recommended</p>
                  </div>
                  {userProfile.resume?.url ? (
                    <span className="text-success d-flex align-items-center small fw-bold">
                      <FaCheckCircle className="me-1" /> Uploaded
                    </span>
                  ) : (
                    <span className="text-warning small fw-bold">Pending Upload</span>
                  )}
                </div>
                <div className="mt-3 d-flex align-items-center gap-3">
                  <input
                    type="file"
                    className="form-control form-control-sm"
                    onChange={(e) => handleFileUpload(e, "resume")}
                    disabled={uploading.resume}
                    accept=".pdf,.doc,.docx"
                  />
                  {userProfile.resume?.url && (
                    <a href={userProfile.resume.url} target="_blank" rel="noreferrer" className="btn btn-sm btn-link text-decoration-none fw-bold">
                      View
                    </a>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Tab Content: My Applications */}
      {activeTab === "applications" && (
        <div>
          <h4 className="fw-bold mb-4 text-dark">My Job Applications</h4>
          {appliedJobs.length === 0 ? (
            <div className="text-center py-5 text-muted bg-white border rounded">
              You haven't applied to any jobs yet. Browse jobs under the "Job Search" tab!
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle bg-white border border-light shadow-sm rounded mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Salary</th>
                    <th>Location</th>
                    <th>Date Applied</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appliedJobs.map((app) => (
                    <tr key={app._id}>
                      <td>
                        <span className="fw-bold text-dark">{app.job?.title || "Deleted Job"}</span>
                        {app.job?.category && (
                          <span className="badge bg-light text-secondary border ms-2">{app.job.category}</span>
                        )}
                      </td>
                      <td>🏢 {app.job?.companyName || "N/A"}</td>
                      <td className="text-success fw-semibold">{app.job?.salary || "Not Specified"}</td>
                      <td>📍 {app.job?.location?.city ? `${app.job.location.city}, ${app.job.location.state}` : "Remote"}</td>
                      <td className="text-muted small">{new Date(app.createdAt).toLocaleDateString()}</td>
                      <td>
                        {app.status === "accepted" ? (
                          <span className="badge bg-success px-3 py-2 fs-7">Accepted</span>
                        ) : app.status === "rejected" ? (
                          <span className="badge bg-danger px-3 py-2 fs-7">Rejected</span>
                        ) : (
                          <span className="badge bg-warning text-dark px-3 py-2 fs-7">Pending</span>
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
    </div>
  );
}

export default UserDashboard;
