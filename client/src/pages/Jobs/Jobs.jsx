import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { searchJobs, applyToJob, getMyAppliedJobs } from "../../services/jobService";
import { toast } from "react-toastify";
import { FaSearch, FaMapMarkerAlt, FaBriefcase, FaMoneyBillWave, FaCalendarAlt, FaUsers } from "react-icons/fa";
import LocationAutocomplete from "../../components/common/LocationAutocomplete";

function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [jobsList, setJobsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [appliedJobsStatus, setAppliedJobsStatus] = useState({});

  // Fetch applied jobs if logged in as user
  useEffect(() => {
    const fetchApplied = async () => {
      if (isAuthenticated && user?.role === "user") {
        try {
          const data = await getMyAppliedJobs();
          const statusMap = {};
          (data.applications || []).forEach(app => {
            const jobId = app.job?._id || app.job;
            if (jobId) {
              statusMap[jobId] = app.status || "pending";
            }
          });
          setAppliedJobsStatus(statusMap);
        } catch (error) {
          console.error("Failed to fetch applied jobs:", error);
        }
      }
    };
    fetchApplied();
  }, [isAuthenticated, user]);

  const categoriesList = [
    "Catering",
    "Warehouse",
    "Driver",
    "Delivery",
    "Housekeeping",
    "Event Staff",
    "Valet Parking",
  ];

  // URL parameters synchronization effect
  useEffect(() => {
    const urlCategory = searchParams.get("category") || "";
    const urlLocation = searchParams.get("location") || "";
    setCategory(urlCategory);
    setLocation(urlLocation);

    const fetchJobs = async () => {
      try {
        setLoading(true);
        const data = await searchJobs({ category: urlCategory, location: urlLocation });
        setJobsList(data.jobs || []);
      } catch (error) {
        toast.error("Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ category, location });
  };

  const handleApply = async (jobId, jobTitle) => {
    if (!isAuthenticated) {
      toast.info("Please login to apply for this shift");
      navigate("/login");
      return;
    }

    if (user?.role === "company" || user?.role === "admin") {
      toast.warning("Job Providers/Admins cannot apply for shifts");
      return;
    }

    try {
      await applyToJob(jobId);
      toast.success(`Successfully applied for "${jobTitle}"!`);
      setAppliedJobsStatus(prev => ({
        ...prev,
        [jobId]: "pending"
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit application");
    }
  };

  return (
    <div className="container py-5" style={{ minHeight: "80vh" }}>
      {/* Search Header */}
      <div className="text-center mb-5">
        <h2 className="fw-bold text-dark mb-2">Search Part-Time Shifts</h2>
        <p className="text-muted">Find shift-based catering, warehousing, delivery, and driving jobs near you.</p>
      </div>

      {/* Search Panel */}
      <form onSubmit={handleSearchSubmit} className="row g-3 mb-5 p-4 bg-white shadow-sm rounded border border-light">
        <div className="col-md-5">
          <label className="form-label fw-semibold text-secondary">Job Category</label>
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0">
              <FaBriefcase className="text-muted" />
            </span>
            <select
              className="form-select border-start-0 bg-light"
              value={category}
              onChange={(e) => {
                const selectedCat = e.target.value;
                setCategory(selectedCat);
                setSearchParams({ category: selectedCat, location });
              }}
            >
              <option value="">All Categories</option>
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="col-md-5">
          <label className="form-label fw-semibold text-secondary">Location</label>
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0">
              <FaMapMarkerAlt className="text-danger" />
            </span>
            <LocationAutocomplete
              className="form-control border-start-0 bg-light"
              placeholder="e.g. Kochi, Kerala"
              value={location}
              onChange={setLocation}
            />
          </div>
        </div>

        <div className="col-md-2 d-flex align-items-end">
          <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold">
            <FaSearch className="me-2" /> Search
          </button>
        </div>
      </form>

      {/* Jobs Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : jobsList.length === 0 ? (
        <div className="text-center py-5 bg-white border border-light shadow-sm rounded">
          <p className="text-muted mb-0 fs-5">No active shifts found matching your search.</p>
        </div>
      ) : (
        <div className="row g-4">
          {jobsList.map((job) => (
            <div className="col-md-6 col-lg-4" key={job._id}>
              <div className="card h-100 shadow-sm border-0 position-relative" style={{ transition: "transform 0.2s" }}>
                <span className="badge bg-success position-absolute top-0 end-0 mt-3 me-3 py-2 px-3 fs-7">
                  Verified
                </span>
                
                <div className="card-body p-4 d-flex flex-column justify-content-between">
                  <div>
                    <span className="badge bg-light text-primary fw-bold mb-3 border border-primary-subtle">
                      {job.category}
                    </span>
                    <h4 className="card-title fw-bold text-dark mb-1">{job.title}</h4>
                    <h6 className="text-secondary mb-3">🏢 {job.companyName}</h6>
                    <p className="card-text text-muted mb-4 small" style={{ minHeight: "50px" }}>
                      {job.description}
                    </p>

                    <div className="border-top pt-3 mb-4">
                      <div className="d-flex align-items-center mb-2 text-muted small">
                        <FaMapMarkerAlt className="me-2 text-danger" />
                        <span>{job.location?.city ? `${job.location.city}, ${job.location.state}` : "Remote"}</span>
                      </div>
                      <div className="d-flex align-items-center mb-2 text-muted small">
                        <FaMoneyBillWave className="me-2 text-success" />
                        <strong>Pay:</strong> <span className="text-dark ms-1">{job.salary || "Not specified"}</span>
                      </div>
                      {job.date && (
                        <div className="d-flex align-items-center mb-2 text-muted small">
                          <FaCalendarAlt className="me-2 text-primary" />
                          <strong>Date:</strong> <span className="text-dark ms-1">{job.date}</span>
                        </div>
                      )}
                      <div className="d-flex align-items-center text-muted small">
                        <FaUsers className="me-2 text-primary" />
                        <span><strong>Slots:</strong> {job.slots || 1} available</span>
                      </div>
                    </div>
                  </div>

                  {appliedJobsStatus[job._id] ? (
                    appliedJobsStatus[job._id] === "accepted" ? (
                      <button className="btn btn-success w-100 py-2 fw-semibold" disabled>
                        Accepted
                      </button>
                    ) : appliedJobsStatus[job._id] === "rejected" ? (
                      <button className="btn btn-danger w-100 py-2 fw-semibold" disabled>
                        Rejected
                      </button>
                    ) : (
                      <button className="btn btn-warning text-dark w-100 py-2 fw-semibold" disabled>
                        Applied (Pending)
                      </button>
                    )
                  ) : (
                    <Link to={`/jobs/${job._id}`} className="btn btn-primary w-100 py-2 fw-semibold">
                      View Details
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Jobs;
