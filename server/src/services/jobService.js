import Job from "../models/Job.js";
import User from "../models/User.js";

export const createJobService = async (userId, jobData) => {
  const user = await User.findById(userId);

  if (!user || (user.role !== "company" && user.role !== "admin")) {
    throw new Error("Only job providers or admins can post jobs");
  }

  const { title, description, category, location, salary, requirements, slots, date } = jobData;

  if (!title || !description || !category) {
    throw new Error("Title, Description, and Category are required");
  }

  const job = await Job.create({
    title,
    company: userId,
    companyName: user.companyName || user.fullName,
    description,
    category,
    location: location || { state: "", district: "", city: "", pincode: "" },
    salary: salary || "",
    slots: slots || 1,
    date: date || "",
    requirements: requirements || [],
  });

  return job;
};

export const searchJobsService = async (filters) => {
  const query = {};

  if (filters.category) {
    query.category = { $regex: filters.category, $options: "i" };
  }

  if (filters.location) {
    const loc = filters.location.trim();
    // Search location across city, district, state, or pincode
    query.$or = [
      { "location.city": { $regex: loc, $options: "i" } },
      { "location.district": { $regex: loc, $options: "i" } },
      { "location.state": { $regex: loc, $options: "i" } },
      { "location.pincode": { $regex: loc, $options: "i" } },
    ];
  }

  const jobs = await Job.find(query).sort({ createdAt: -1 });
  return jobs;
};

export const getRecommendedJobsService = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const categories = user.preferredCategories || [];

  if (categories.length === 0) {
    // Return newest jobs if no preferred categories selected
    return await Job.find({}).sort({ createdAt: -1 }).limit(10);
  }

  // Find jobs that match any of the user's preferred categories
  const jobs = await Job.find({
    category: { $in: categories },
  }).sort({ createdAt: -1 });

  return jobs;
};

export const getMyJobsService = async (userId) => {
  const jobs = await Job.find({ company: userId }).sort({ createdAt: -1 });
  return jobs;
};

// ----------------------------------------------------
// EXTENDED JOB & APPLICATION SERVICES
// ----------------------------------------------------
import Application from "../models/Application.js";

export const updateJobService = async (jobId, userId, updateData) => {
  const job = await Job.findById(jobId);
  if (!job) {
    throw new Error("Job not found");
  }

  if (job.company.toString() !== userId.toString()) {
    const user = await User.findById(userId);
    if (user?.role !== "admin") {
      throw new Error("Not authorized to update this job");
    }
  }

  const { title, description, category, location, salary, slots, date, requirements } = updateData;

  job.title = title || job.title;
  job.description = description || job.description;
  job.category = category || job.category;
  job.location = location || job.location;
  job.salary = salary !== undefined ? salary : job.salary;
  job.slots = slots !== undefined ? slots : job.slots;
  job.date = date !== undefined ? date : job.date;
  job.requirements = requirements || job.requirements;

  await job.save();
  return job;
};

export const deleteJobService = async (jobId, userId) => {
  const job = await Job.findById(jobId);
  if (!job) {
    throw new Error("Job not found");
  }

  if (job.company.toString() !== userId.toString()) {
    const user = await User.findById(userId);
    if (user?.role !== "admin") {
      throw new Error("Not authorized to delete this job");
    }
  }

  // Remove associated applications
  await Application.deleteMany({ job: jobId });
  await Job.findByIdAndDelete(jobId);
  return { message: "Job deleted successfully" };
};

export const applyJobService = async (jobId, seekerId) => {
  const job = await Job.findById(jobId);
  if (!job) {
    throw new Error("Job not found");
  }

  const seeker = await User.findById(seekerId);
  if (!seeker || seeker.role !== "user") {
    throw new Error("Only job seekers can apply for jobs");
  }

  // Check if already applied
  const existingApp = await Application.findOne({ job: jobId, seeker: seekerId });
  if (existingApp) {
    throw new Error("You have already applied to this job");
  }

  const app = await Application.create({
    job: jobId,
    seeker: seekerId,
    status: "pending",
  });

  return app;
};

export const getAppliedJobsService = async (seekerId) => {
  const applications = await Application.find({ seeker: seekerId })
    .populate("job")
    .sort({ createdAt: -1 });
  return applications;
};

export const getJobApplicationsService = async (jobId, userId) => {
  const job = await Job.findById(jobId);
  if (!job) {
    throw new Error("Job not found");
  }

  if (job.company.toString() !== userId.toString()) {
    const user = await User.findById(userId);
    if (user?.role !== "admin") {
      throw new Error("Not authorized to view applicants for this job");
    }
  }

  const applications = await Application.find({ job: jobId })
    .populate("seeker", "-password")
    .sort({ createdAt: -1 });

  return applications;
};

export const updateApplicationStatusService = async (applicationId, userId, status) => {
  if (!["accepted", "rejected"].includes(status)) {
    throw new Error("Invalid status update value");
  }

  const application = await Application.findById(applicationId).populate("job");
  if (!application) {
    throw new Error("Application not found");
  }

  if (application.job.company.toString() !== userId.toString()) {
    const user = await User.findById(userId);
    if (user?.role !== "admin") {
      throw new Error("Not authorized to manage this application");
    }
  }

  application.status = status;
  await application.save();
  return application;
};
