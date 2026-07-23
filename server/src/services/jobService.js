import Job from "../models/Job.js";
import User from "../models/User.js";
import { buildGeocodedLocation } from "../utils/geocode.js";

export const createJobService = async (userId, jobData) => {
  const user = await User.findById(userId);

  if (!user || (user.role !== "company" && user.role !== "admin")) {
    throw new Error("Only job providers or admins can post jobs");
  }

  const { title, description, category, location, salary, requirements, slots, date, presetQuestions } = jobData;

  if (!title || !description || !category) {
    throw new Error("Title, Description, and Category are required");
  }

  // Best-effort geocoding so the job can show up in "jobs near me" radius
  // searches. If it fails, the job is still created with just the text
  // location fields (city/district/state/pincode).
  const geocodedLocation = await buildGeocodedLocation(
    location || { state: "", district: "", city: "", pincode: "" }
  );

  const job = await Job.create({
    title,
    company: userId,
    companyName: user.companyName || user.fullName,
    description,
    category,
    location: geocodedLocation,
    salary: salary || "",
    slots: slots || 1,
    date: date || "",
    requirements: requirements || [],
    presetQuestions: presetQuestions || [],
  });

  return job;
};

export const searchJobsService = async (filters) => {
  const query = {};
  const andConditions = [];

  if (filters.category) {
    query.category = { $regex: filters.category, $options: "i" };
  }

  if (filters.location) {
    const loc = filters.location.trim();

    andConditions.push({
      $or: [
        { "location.city": { $regex: loc, $options: "i" } },
        { "location.district": { $regex: loc, $options: "i" } },
        { "location.state": { $regex: loc, $options: "i" } },
        { "location.pincode": { $regex: loc, $options: "i" } },
      ],
    });
  }

  // General keyword search: matches skills/requirements, job description,
  // job title, salary, organisation name, category, or location — any
  // free-text keyword the seeker types (e.g. "chef", "20000", "Kochi",
  // "ABC Caterers"). Multiple words are treated as AND across words, OR
  // across fields, so "delivery kochi" matches jobs that mention both
  // "delivery" and "kochi" somewhere, not necessarily in the same field.
  if (filters.keyword) {
    const words = filters.keyword.trim().split(/\s+/).filter(Boolean);

    words.forEach((word) => {
      andConditions.push({
        $or: [
          { title: { $regex: word, $options: "i" } },
          { description: { $regex: word, $options: "i" } },
          { companyName: { $regex: word, $options: "i" } },
          { category: { $regex: word, $options: "i" } },
          { salary: { $regex: word, $options: "i" } },
          { requirements: { $regex: word, $options: "i" } },
          { "location.city": { $regex: word, $options: "i" } },
          { "location.district": { $regex: word, $options: "i" } },
          { "location.state": { $regex: word, $options: "i" } },
          { "location.pincode": { $regex: word, $options: "i" } },
        ],
      });
    });
  }

  if (andConditions.length > 0) {
    query.$and = andConditions;
  }

  // Nearby search: if the seeker shared their coordinates and a radius
  // (in km), restrict results to jobs whose geocoded location falls
  // within that distance, sorted closest-first. Jobs without geocoded
  // coordinates (geocoding failed or job predates this feature) are
  // simply excluded from these results, same as any $geoNear query.
  const latitude = parseFloat(filters.lat);
  const longitude = parseFloat(filters.lng);
  const radiusKm = parseFloat(filters.radius);

  const hasValidCoords =
    !Number.isNaN(latitude) &&
    !Number.isNaN(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180;

  if (hasValidCoords && !Number.isNaN(radiusKm) && radiusKm > 0) {
    const jobs = await Job.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [longitude, latitude] },
          distanceField: "distanceMeters",
          maxDistance: radiusKm * 1000,
          spherical: true,
          query,
        },
      },
      { $sort: { distanceMeters: 1 } },
    ]);

    return jobs.map((job) => ({
      ...job,
      distanceKm: Math.round((job.distanceMeters / 1000) * 10) / 10,
    }));
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
   
    return await Job.find({}).sort({ createdAt: -1 }).limit(10);
  }

 
  const jobs = await Job.find({
    category: { $in: categories },
  }).sort({ createdAt: -1 });

  return jobs;
};

export const getMyJobsService = async (userId) => {
  const jobs = await Job.find({ company: userId }).sort({ createdAt: -1 });
  return jobs;
};


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

  const { title, description, category, location, salary, slots, date, requirements, presetQuestions } = updateData;

  job.title = title || job.title;
  job.description = description || job.description;
  job.category = category || job.category;
  if (location) {
    job.location = await buildGeocodedLocation(location);
  }
  job.salary = salary !== undefined ? salary : job.salary;
  job.slots = slots !== undefined ? slots : job.slots;
  job.date = date !== undefined ? date : job.date;
  job.requirements = requirements || job.requirements;
  if (presetQuestions !== undefined) {
    job.presetQuestions = presetQuestions;
  }

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


  await Application.deleteMany({ job: jobId });
  await Job.findByIdAndDelete(jobId);
  return { message: "Job deleted successfully" };
};

export const applyJobService = async (jobId, seekerId, answers) => {
  const job = await Job.findById(jobId);
  if (!job) {
    throw new Error("Job not found");
  }

  const seeker = await User.findById(seekerId);
  if (!seeker || seeker.role !== "user") {
    throw new Error("Only job seekers can apply for jobs");
  }


  const existingApp = await Application.findOne({ job: jobId, seeker: seekerId });
  if (existingApp) {
    throw new Error("You have already applied to this job");
  }

  const app = await Application.create({
    job: jobId,
    seeker: seekerId,
    status: "pending",
    answers: answers || [],
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

export const getJobByIdService = async (jobId) => {
  const job = await Job.findById(jobId);
  if (!job) {
    throw new Error("Job not found");
  }
  return job;
};

export const saveJobService = async (jobId, userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  if (!user.savedJobs) {
    user.savedJobs = [];
  }

  if (!user.savedJobs.includes(jobId)) {
    user.savedJobs.push(jobId);
    await user.save();
  }

  return user;
};

export const unsaveJobService = async (jobId, userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  if (user.savedJobs) {
    user.savedJobs = user.savedJobs.filter((id) => id.toString() !== jobId.toString());
    await user.save();
  }

  return user;
};

export const getSavedJobsService = async (userId) => {
  const user = await User.findById(userId).populate("savedJobs");
  if (!user) {
    throw new Error("User not found");
  }
  return user.savedJobs || [];
};
