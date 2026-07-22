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
  getJobByIdService,
  saveJobService,
  unsaveJobService,
  getSavedJobsService,
} from "../services/jobService.js";
import { createAndSendNotification } from "../services/notificationService.js";
import User from "../models/User.js";

export const createJob = async (req, res) => {
  try {
    const job = await createJobService(req.user._id, req.body);

    // 1. Notify company/employer (confirmation)
    createAndSendNotification({
      recipientId: req.user._id,
      senderId: req.user._id,
      type: "new_job_post",
      title: "Job Posted Successfully",
      message: `Your job post for "${job.title}" is now active on pocketJob.`,
      link: "/dashboard?tab=jobs",
      data: { jobId: job._id },
      app: req.app,
    });

    // 2. Notify job seekers matching category or all active seekers
    User.find({ role: "user" }).select("_id preferredCategories").then((seekers) => {
      seekers.forEach((seeker) => {
        // Send to candidates interested in category or all candidates
        createAndSendNotification({
          recipientId: seeker._id,
          senderId: req.user._id,
          type: "new_job_post",
          title: `New Job Posted: ${job.title}`,
          message: `${job.companyName || req.user.fullName} posted a new job listing in ${job.category}.`,
          link: "/dashboard?tab=search",
          data: { jobId: job._id },
          app: req.app,
        });
      });
    }).catch(err => console.error("Error notifying seekers:", err.message));

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
    const app = await applyJobService(req.params.id, req.user._id, req.body.answers);

    // Notify company of new applicant
    if (app && app.job) {
      createAndSendNotification({
        recipientId: app.job.company || app.job,
        senderId: req.user._id,
        type: "system",
        title: "New Job Applicant",
        message: `${req.user.fullName} applied for your job listing.`,
        link: "/dashboard?tab=posted-jobs",
        data: { applicationId: app._id, jobId: req.params.id },
        app: req.app,
      });
    }

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
    const status = req.body.status;
    const application = await updateApplicationStatusService(
      req.params.applicationId,
      req.user._id,
      status
    );

    // Send notification & email to candidate
    if (application && application.seeker) {
      const isAccepted = status === "accepted";
      const title = isAccepted ? "Application Accepted 🎉" : "Application Decision Update";
      const message = isAccepted
        ? `Congratulations! Your application for "${application.job?.title || 'the job'}" has been ACCEPTED by ${req.user.companyName || req.user.fullName}.`
        : `Your application for "${application.job?.title || 'the job'}" was REJECTED by ${req.user.companyName || req.user.fullName}.`;

      createAndSendNotification({
        recipientId: application.seeker,
        senderId: req.user._id,
        type: isAccepted ? "application_accepted" : "application_rejected",
        title,
        message,
        link: "/dashboard?tab=applied",
        data: { applicationId: application._id },
        app: req.app,
      });
    }

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

export const getJob = async (req, res) => {
  try {
    const job = await getJobByIdService(req.params.id);
    res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

export const saveJob = async (req, res) => {
  try {
    await saveJobService(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      message: "Job saved successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const unsaveJob = async (req, res) => {
  try {
    await unsaveJobService(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      message: "Job unsaved successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getSavedJobs = async (req, res) => {
  try {
    const jobs = await getSavedJobsService(req.user._id);
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
