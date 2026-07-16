import {
  createJobService,
  searchJobsService,
  getRecommendedJobsService,
  getMyJobsService,
  updateJobService,
  deleteJobService,
  applyJobService,
  getAppliedJobsService,
  getJobApplicationsService,
  updateApplicationStatusService,
} from "../services/jobService.js";

export const createJob = async (req, res) => {
  try {
    const job = await createJobService(req.user._id, req.body);

    res.status(201).json({
      success: true,
      message: "Job Posted Successfully",
      job,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const searchJobs = async (req, res) => {
  try {
    const { category, location } = req.query;
    const jobs = await searchJobsService({ category, location });

    res.status(200).json({
      success: true,
      jobs,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getRecommendedJobs = async (req, res) => {
  try {
    const jobs = await getRecommendedJobsService(req.user._id);

    res.status(200).json({
      success: true,
      jobs,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyJobs = async (req, res) => {
  try {
    const jobs = await getMyJobsService(req.user._id);

    res.status(200).json({
      success: true,
      jobs,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateJob = async (req, res) => {
  try {
    const job = await updateJobService(req.params.id, req.user._id, req.body);
    res.status(200).json({
      success: true,
      message: "Job Updated Successfully",
      job,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const result = await deleteJobService(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const applyJob = async (req, res) => {
  try {
    const app = await applyJobService(req.params.id, req.user._id);
    res.status(201).json({
      success: true,
      message: "Applied for Job Successfully",
      application: app,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAppliedJobs = async (req, res) => {
  try {
    const applications = await getAppliedJobsService(req.user._id);
    res.status(200).json({
      success: true,
      applications,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getJobApplications = async (req, res) => {
  try {
    const applications = await getJobApplicationsService(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      applications,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const application = await updateApplicationStatusService(
      req.params.applicationId,
      req.user._id,
      req.body.status
    );
    res.status(200).json({
      success: true,
      message: "Application status updated successfully",
      application,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
