import api from "./api";

export const postJob = async (jobData) => {
  const response = await api.post("/jobs", jobData);
  return response.data;
};

export const updateJob = async (jobId, jobData) => {
  const response = await api.put(`/jobs/${jobId}`, jobData);
  return response.data;
};

export const deleteJob = async (jobId) => {
  const response = await api.delete(`/jobs/${jobId}`);
  return response.data;
};

export const searchJobs = async (params) => {
  // params: { category, location }
  const response = await api.get("/jobs/search", { params });
  return response.data;
};

export const getRecommendedJobs = async () => {
  const response = await api.get("/jobs/recommended");
  return response.data;
};

export const getMyJobs = async () => {
  const response = await api.get("/jobs/my-jobs");
  return response.data;
};

export const applyToJob = async (jobId) => {
  const response = await api.post(`/jobs/${jobId}/apply`);
  return response.data;
};

export const getMyAppliedJobs = async () => {
  const response = await api.get("/jobs/applied");
  return response.data;
};

export const getJobApplications = async (jobId) => {
  const response = await api.get(`/jobs/${jobId}/applications`);
  return response.data;
};

export const updateApplicationStatus = async (applicationId, status) => {
  const response = await api.put(`/jobs/applications/${applicationId}`, { status });
  return response.data;
};
