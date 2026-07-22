import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getJobById, applyToJob, saveJob, unsaveJob, getSavedJobs, getMyAppliedJobs, searchJobs } from "../../services/jobService";
import { uploadResume, uploadDocument } from "../../services/userService";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaBriefcase,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaUsers,
  FaBookmark,
  FaRegBookmark,
  FaCheckCircle,
  FaSpinner,
  FaFileAlt
} from "react-icons/fa";

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appliedStatus, setAppliedStatus] = useState(null); // null, 'pending', 'accepted', 'rejected'
  const [existingAppDetails, setExistingAppDetails] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [showDetailedForm, setShowDetailedForm] = useState(false);
  const [relatedJobs, setRelatedJobs] = useState([]);

  // Are we viewing this inside the dashboard, or the public jobs page?
  const isDashboardView = location.pathname.startsWith("/dashboard");
  const jobLinkBase = isDashboardView ? "/dashboard/jobs" : "/jobs";

  // Detailed Apply answers state
  const [answers, setAnswers] = useState({});
  const [submittingApply, setSubmittingApply] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingDocIds, setUploadingDocIds] = useState({});
  const [expandedAnswers, setExpandedAnswers] = useState({});

  useEffect(() => {
    const fetchJobData = async () => {
      try {
        setLoading(true);
        const data = await getJobById(id);
        setJob(data.job);

        // Fetch related jobs in the same category
        if (data.job?.category) {
          try {
            const relatedData = await searchJobs({ category: data.job.category });
            const filtered = (relatedData.jobs || [])
              .filter((j) => j._id !== id)
              .slice(0, 4);
            setRelatedJobs(filtered);
          } catch (relatedError) {
            setRelatedJobs([]);
          }
        }
        
        if (isAuthenticated && user?.role === "user") {
          // Check application status
          const appliedData = await getMyAppliedJobs();
          const existingApp = (appliedData.applications || []).find(
            app => (app.job?._id || app.job) === id
          );
          if (existingApp) {
            setAppliedStatus(existingApp.status || "pending");
            setExistingAppDetails(existingApp);
          }

          // Check if saved
          const savedData = await getSavedJobs();
          const savedExists = (savedData.jobs || []).some(
            sj => (sj._id || sj) === id
          );
          setIsSaved(savedExists);
        }
      } catch (error) {
        toast.error("Failed to load job details");
        navigate("/jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchJobData();
  }, [id, isAuthenticated, user, navigate]);

  const handleQuickApply = async () => {
    if (!isAuthenticated) {
      toast.info("Please login to apply for this shift");
      navigate("/login");
      return;
    }

    if (user?.role !== "user") {
      toast.warning("Only Job Seekers can apply for jobs");
      return;
    }

    try {
      setSubmittingApply(true);
      const res = await applyToJob(id);
      toast.success("Successfully applied (Quick Apply)!");
      setAppliedStatus("pending");
      if (res?.application) setExistingAppDetails(res.application);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to apply");
    } finally {
      setSubmittingApply(false);
    }
  };

  const handleSaveToggle = async () => {
    if (!isAuthenticated) {
      toast.info("Please login to save this job");
      navigate("/login");
      return;
    }

    if (user?.role !== "user") {
      toast.warning("Only Job Seekers can save jobs");
      return;
    }

    try {
      if (isSaved) {
        await unsaveJob(id);
        setIsSaved(false);
        toast.success("Job removed from saved list");
      } else {
        await saveJob(id);
        setIsSaved(true);
        toast.success("Job saved successfully!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update saved job status");
    }
  };

  const handleAnswerChange = (qId, val) => {
    setAnswers(prev => ({
      ...prev,
      [qId]: val
    }));
  };

  const handleResumeUpload = async (e, qId) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingResume(true);
      const response = await uploadResume(file);
      const resumeUrl = response.user?.resume?.url;
      if (resumeUrl) {
        handleAnswerChange(qId, resumeUrl);
        toast.success("Resume uploaded successfully!");
      } else {
        toast.error("Failed to retrieve uploaded resume URL");
      }
    } catch (error) {
      toast.error("Failed to upload resume");
    } finally {
      setUploadingResume(false);
    }
  };

  const handleCustomDocumentUpload = async (e, qId) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingDocIds(prev => ({ ...prev, [qId]: true }));
      const response = await uploadDocument(file);
      if (response?.url) {
        handleAnswerChange(qId, response.url);
        toast.success("Document uploaded successfully!");
      } else {
        toast.error("Failed to retrieve uploaded document URL");
      }
    } catch (error) {
      toast.error("Failed to upload document");
    } finally {
      setUploadingDocIds(prev => ({ ...prev, [qId]: false }));
    }
  };

  const handleDetailedApplySubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info("Please login to apply");
      navigate("/login");
      return;
    }

    // Validate required questions
    for (const q of job.presetQuestions || []) {
      if (q.required && !answers[q.id]) {
        toast.warning(`Please answer the question: "${q.questionText}"`);
        return;
      }
    }

    try {
      setSubmittingApply(true);
      // Map answers object to backend format
      const formattedAnswers = (job.presetQuestions || []).map(q => ({
        questionText: q.questionText,
        questionType: q.id,
        answer: answers[q.id] || ""
      }));

      const res = await applyToJob(id, formattedAnswers);
      toast.success("Successfully applied (Detailed Apply)!");
      setAppliedStatus("pending");
      if (res?.application) setExistingAppDetails(res.application);
      setShowDetailedForm(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit application");
    } finally {
      setSubmittingApply(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: "85vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: "85vh" }}>
        <p className="text-muted">Job listing not found.</p>
        <button className="btn btn-primary" onClick={() => navigate("/jobs")}>
          Back to Jobs
        </button>
      </div>
    );
  }

  const hasPresetQuestions = job.presetQuestions && job.presetQuestions.length > 0;

  return (
    <div className="container py-5" style={{ minHeight: "80vh" }}>
      {/* Back Button */}
      <button className="btn btn-link text-decoration-none text-secondary mb-4 p-0 d-flex align-items-center" onClick={() => navigate(-1)}>
        <FaArrowLeft className="me-2" /> Back
      </button>

      <div className="row g-4">
        {/* Left Column: Job details */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 p-4 mb-4 bg-white">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <span className="badge bg-light text-primary fw-bold mb-2 border border-primary-subtle px-3 py-2">
                  {job.category}
                </span>
                <h2 className="fw-bold text-dark mb-1">{job.title}</h2>
                <h5 className="text-muted">🏢 {job.companyName}</h5>
              </div>
              
              {/* Save Button for Seekers */}
              {(!isAuthenticated || user?.role === "user") && (
                <button
                  onClick={handleSaveToggle}
                  className={`btn ${isSaved ? "btn-primary" : "btn-outline-primary"} rounded-circle d-flex align-items-center justify-content-center`}
                  style={{ width: "45px", height: "45px" }}
                  title={isSaved ? "Unsave Job" : "Save Job"}
                >
                  {isSaved ? <FaBookmark /> : <FaRegBookmark />}
                </button>
              )}
            </div>

            <div className="border-top pt-4 mt-4">
              <h5 className="fw-bold text-dark mb-3">Job Description</h5>
              <p className="text-secondary" style={{ whiteSpace: "pre-line", lineHeight: "1.7" }}>
                {job.description}
              </p>
            </div>

            {job.requirements && job.requirements.length > 0 && (
              <div className="border-top pt-4 mt-4">
                <h5 className="fw-bold text-dark mb-3">Requirements</h5>
                <ul className="list-group list-group-flush">
                  {job.requirements.map((req, index) => (
                    <li key={index} className="list-group-item px-0 border-0 text-secondary d-flex align-items-center">
                      <FaCheckCircle className="text-success me-2" /> {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Detailed Apply Form Card */}
          {showDetailedForm && hasPresetQuestions && (
            <div className="card shadow-sm border-0 p-4 bg-white mb-4 animate__animated animate__fadeIn">
              <h4 className="fw-bold mb-4 text-dark border-bottom pb-2">Detailed Application Form</h4>
              <form onSubmit={handleDetailedApplySubmit}>
                {job.presetQuestions.map((q) => (
                  <div className="mb-4" key={q.id}>
                    <label className="form-label fw-semibold text-secondary">
                      {q.questionText} {q.required && <span className="text-danger">*</span>}
                    </label>

                    {/* Question type matching */}
                    {q.id === "experience" && (
                      <input
                        type="number"
                        className="form-control bg-light"
                        placeholder="Years of experience"
                        value={answers[q.id] || ""}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        required={q.required}
                        min="0"
                      />
                    )}

                    {q.id === "relocate" && (
                      <div className="d-flex gap-4 mt-2">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name={`radio-${q.id}`}
                            id={`radio-${q.id}-yes`}
                            value="Yes"
                            checked={answers[q.id] === "Yes"}
                            onChange={() => handleAnswerChange(q.id, "Yes")}
                            required={q.required}
                          />
                          <label className="form-check-label" htmlFor={`radio-${q.id}-yes`}>
                            Yes
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name={`radio-${q.id}`}
                            id={`radio-${q.id}-no`}
                            value="No"
                            checked={answers[q.id] === "No"}
                            onChange={() => handleAnswerChange(q.id, "No")}
                          />
                          <label className="form-check-label" htmlFor={`radio-${q.id}-no`}>
                            No
                          </label>
                        </div>
                      </div>
                    )}

                    {q.id === "currentSalary" && (
                      <input
                        type="text"
                        className="form-control bg-light"
                        placeholder="e.g. ₹20,000 / month (or N/A)"
                        value={answers[q.id] || ""}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        required={q.required}
                      />
                    )}

                    {q.id === "expectedSalary" && (
                      <input
                        type="text"
                        className="form-control bg-light"
                        placeholder="e.g. ₹25,000 / month"
                        value={answers[q.id] || ""}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        required={q.required}
                      />
                    )}

                    {q.id === "resume" && (
                      <div className="mt-2">
                        <div className="d-flex align-items-center gap-3">
                          <input
                            type="file"
                            className="form-control bg-light"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => handleResumeUpload(e, q.id)}
                            required={q.required && !answers[q.id]}
                          />
                          {uploadingResume && (
                            <span className="text-secondary small d-flex align-items-center">
                              <FaSpinner className="spinner-border spinner-border-sm me-2 text-primary animate-spin" /> Uploading...
                            </span>
                          )}
                          {answers[q.id] && !uploadingResume && (
                            <span className="text-success small fw-semibold d-flex align-items-center">
                              <FaCheckCircle className="me-1" /> Resume ready
                            </span>
                          )}
                        </div>
                        <p className="text-muted small mt-1 mb-0">PDF, DOC, DOCX files allowed. Uploading will update your dashboard resume.</p>
                      </div>
                    )}

                    {/* Fallback for other custom ids */}
                    {q.id !== "experience" && q.id !== "relocate" && q.id !== "currentSalary" && q.id !== "expectedSalary" && q.id !== "resume" && (
                      q.answerType === "document" ? (
                        <div className="mt-2">
                          <div className="d-flex align-items-center gap-3">
                            <input
                              type="file"
                              className="form-control bg-light"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              onChange={(e) => handleCustomDocumentUpload(e, q.id)}
                              required={q.required && !answers[q.id]}
                            />
                            {uploadingDocIds[q.id] && (
                              <span className="text-secondary small d-flex align-items-center">
                                <FaSpinner className="spinner-border spinner-border-sm me-2 text-primary animate-spin" /> Uploading...
                              </span>
                            )}
                            {answers[q.id] && !uploadingDocIds[q.id] && (
                              <span className="text-success small fw-semibold d-flex align-items-center">
                                <FaCheckCircle className="me-1" /> Document ready
                              </span>
                            )}
                          </div>
                          <p className="text-muted small mt-1 mb-0">PDF, DOC, DOCX, JPG, or PNG files allowed.</p>
                        </div>
                      ) : (
                        <input
                          type="text"
                          className="form-control bg-light"
                          placeholder="Answer"
                          value={answers[q.id] || ""}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                          required={q.required}
                        />
                      )
                    )}
                  </div>
                ))}

                <div className="d-flex gap-2 justify-content-end mt-4">
                  <button type="button" className="btn btn-light fw-semibold" onClick={() => setShowDetailedForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary fw-semibold px-4" disabled={submittingApply || uploadingResume}>
                    {submittingApply ? "Submitting..." : "Submit Detailed Application"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Right Column: Quick Stats Card */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 p-4 bg-white position-sticky" style={{ top: "2rem" }}>
            <h5 className="fw-bold mb-4 text-dark">Shift Details</h5>
            
            <div className="mb-3 d-flex align-items-center text-secondary small">
              <FaMapMarkerAlt className="me-3 text-danger fs-5" />
              <div>
                <strong className="text-dark d-block">Location</strong>
                {job.location?.city ? `${job.location.city}, ${job.location.state}` : "Remote"}
              </div>
            </div>

            <div className="mb-3 d-flex align-items-center text-secondary small">
              <FaMoneyBillWave className="me-3 text-success fs-5" />
              <div>
                <strong className="text-dark d-block">Salary / Pay Rate</strong>
                {job.salary || "Not specified"}
              </div>
            </div>

            {job.date && (
              <div className="mb-3 d-flex align-items-center text-secondary small">
                <FaCalendarAlt className="me-3 text-primary fs-5" />
                <div>
                  <strong className="text-dark d-block">Shift Date / Time</strong>
                  {job.date}
                </div>
              </div>
            )}

            <div className="mb-4 d-flex align-items-center text-secondary small">
              <FaUsers className="me-3 text-info fs-5" />
              <div>
                <strong className="text-dark d-block">Slots Available</strong>
                {job.slots || 1} slots
              </div>
            </div>

            {/* Application actions block */}
            <div className="border-top pt-4">
              {appliedStatus ? (
                <div className="text-center">
                  <div className={`alert ${appliedStatus === "accepted" ? "alert-success" : appliedStatus === "rejected" ? "alert-danger" : "alert-warning text-dark"} fw-bold py-2 ${existingAppDetails ? "mb-3" : "mb-0"}`}>
                    Application Status: {appliedStatus.toUpperCase()}
                  </div>
                  {existingAppDetails?.answers && existingAppDetails.answers.length > 0 ? (
                    <div className="border rounded p-3 text-start bg-light">
                      <h6 className="fw-bold text-dark mb-2">Your Submitted Answers:</h6>
                      {existingAppDetails.answers.map((ans, idx) => {
                        const matchingQuestion = job.presetQuestions?.find((pq) => pq.id === ans.questionType);
                        const looksLikeUrl = /^https?:\/\//i.test(ans.answer || "");
                        const isDocumentAnswer = ans.questionType === "resume" || matchingQuestion?.answerType === "document" || looksLikeUrl;
                        const answerText = ans.answer || "";
                        const CHAR_LIMIT = 100;
                        const isLong = !isDocumentAnswer && answerText.length > CHAR_LIMIT;
                        const isExpanded = expandedAnswers[idx];
                        const displayText = isLong && !isExpanded
                          ? `${answerText.slice(0, CHAR_LIMIT)}...`
                          : answerText;
                        return (
                          <div key={idx} className="small mb-1">
                            <strong className="text-secondary">{ans.questionText}:</strong>{" "}
                            {isDocumentAnswer && ans.answer ? (
                              <a href={ans.answer} target="_blank" rel="noreferrer" className="text-primary text-decoration-none fw-semibold">
                                <FaFileAlt className="me-1" /> View Submitted {ans.questionType === "resume" ? "Resume" : "Document"}
                              </a>
                            ) : (
                              <span className="text-dark fw-medium">
                                {displayText || "N/A"}
                                {isLong && (
                                  <button
                                    type="button"
                                    className="btn btn-link btn-sm p-0 ms-1 align-baseline"
                                    onClick={() => setExpandedAnswers(prev => ({ ...prev, [idx]: !prev[idx] }))}
                                  >
                                    {isExpanded ? "Show less" : "Read more"}
                                  </button>
                                )}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : existingAppDetails ? (
                    <span className="badge bg-light text-secondary border">Applied via Quick Apply</span>
                  ) : null}
                </div>
              ) : user?.role === "company" || user?.role === "admin" ? (
                <div className="alert alert-secondary text-center small py-2 mb-0">
                  Providers / Admins cannot apply
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {/* Quick Apply Option */}
                  <button
                    onClick={handleQuickApply}
                    className="btn btn-primary py-2 fw-bold w-100"
                    disabled={submittingApply}
                  >
                    {submittingApply ? "Applying..." : "Quick Apply"}
                  </button>

                  {/* Detailed Apply Option */}
                  {hasPresetQuestions ? (
                    <button
                      onClick={() => setShowDetailedForm(true)}
                      className="btn btn-warning text-dark py-2 fw-bold w-100"
                      disabled={submittingApply}
                    >
                      Detailed Apply
                    </button>
                  ) : (
                    <div className="text-muted small text-center italic">
                      Detailed Apply is not configured for this shift.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Jobs Section */}
      {relatedJobs.length > 0 && (
        <div className="mt-5">
          <h4 className="fw-bold text-dark mb-4">Related Jobs in {job.category}</h4>
          <div className="row g-4">
            {relatedJobs.map((rj) => (
              <div className="col-md-6 col-lg-3" key={rj._id}>
                <div className="card shadow-sm border-0 p-3 h-100 d-flex flex-column">
                  <span className="badge bg-light text-primary fw-bold mb-2 border border-primary-subtle align-self-start">
                    {rj.category}
                  </span>
                  <h6 className="fw-bold text-dark mb-1">{rj.title}</h6>
                  <p className="text-muted small mb-2">🏢 {rj.companyName}</p>
                  <div className="d-flex align-items-center text-secondary small mb-3">
                    <FaMapMarkerAlt className="me-2 text-danger" />
                    {rj.location?.city ? `${rj.location.city}, ${rj.location.state}` : "Remote"}
                  </div>
                  <div className="mt-auto">
                    <Link to={`${jobLinkBase}/${rj._id}`} className="btn btn-outline-primary btn-sm w-100 fw-semibold">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default JobDetails;
