import { useState, useEffect } from "react";
import "./FeaturedJobs.css";
import {
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaClock,
  FaUsers,
  FaCalendarAlt,
} from "react-icons/fa";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { searchJobs, applyToJob, getMyAppliedJobs } from "../../../services/jobService";

function FeaturedJobs() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appliedJobsStatus, setAppliedJobsStatus] = useState({});

  const fetchFeaturedJobs = async () => {
    try {
      setLoading(true);
      // Fetch all jobs, but we'll display the first 4
      const response = await searchJobs({});
      setJobs((response.jobs || []).slice(0, 4));
    } catch (error) {
      console.error("Failed to fetch featured jobs:", error);
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    fetchFeaturedJobs();
    fetchApplied();
  }, [isAuthenticated, user]);

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
      toast.error(error.response?.data?.message || "Failed to apply for this job");
    }
  };

  return (
    <section className="featured-jobs section">

      <div className="container">

        <div className="text-center mb-5">
          <h2 className="title">Featured Jobs</h2>
          <p className="subtitle">
            Apply for verified part-time jobs near you
          </p>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-5 text-muted bg-white border rounded">
            No active jobs found. Check back later!
          </div>
        ) : (
          <div className="row g-4">

            {jobs.map((job) => (

              <div
                className="col-12 col-md-6 col-xl-3"
                key={job._id}
              >

                <div className="job-card h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="badge bg-success">
                        Verified
                      </span>
                      <span className="badge bg-light text-secondary border">{job.category}</span>
                    </div>

                    <h4 className="fw-bold mt-2 text-dark">{job.title}</h4>

                    <h6 className="text-primary mb-3">🏢 {job.companyName}</h6>

                    <div className="job-info">

                      <p className="small text-muted mb-1">
                        <FaMapMarkerAlt className="text-danger me-2" />
                        {job.location?.city ? `${job.location.city}, ${job.location.state}` : "Remote"}
                      </p>

                      <p className="small text-success fw-semibold mb-1">
                        <FaMoneyBillWave className="me-2" />
                        {job.salary || "Not Specified"}
                      </p>

                      {job.date && (
                        <p className="small text-muted mb-1">
                          <FaCalendarAlt className="text-primary me-2" />
                          Work Date: {job.date}
                        </p>
                      )}

                      <p className="small text-muted mb-3">
                        <FaUsers className="text-info me-2" />
                        {job.slots || 1} Slots Left
                      </p>

                    </div>
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
                      Apply Now
                    </button>
                  )}

                </div>

              </div>

            ))}

          </div>
        )}

      </div>

    </section>
  );
}

export default FeaturedJobs;