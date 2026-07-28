import User from "../models/User.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import Invitation from "../models/Invitation.js";

// ------------------------------------------------------------------
// Dashboard Stats
// ------------------------------------------------------------------
export const getDashboardStatsService = async () => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);
  const startOfMonth = new Date(now);
  startOfMonth.setDate(now.getDate() - 30);

  const [
    totalSeekers,
    totalCompanies,
    totalAdmins,
    blockedUsers,
    verifiedUsers,
    pendingVerification,
    totalJobs,
    totalApplications,
    newUsersThisWeek,
    newJobsThisWeek,
    freePlanCount,
    basicPlanCount,
    premiumPlanCount,
    recentUsers,
    recentJobs,
  ] = await Promise.all([
    User.countDocuments({ role: "user" }),
    User.countDocuments({ role: "company" }),
    User.countDocuments({ role: "admin" }),
    User.countDocuments({ isBlocked: true }),
    User.countDocuments({ isVerified: true }),
    User.countDocuments({ isVerified: false, role: { $ne: "admin" } }),
    Job.countDocuments({}),
    Application.countDocuments({}),
    User.countDocuments({ createdAt: { $gte: startOfWeek } }),
    Job.countDocuments({ createdAt: { $gte: startOfWeek } }),
    User.countDocuments({ role: "company", "subscription.plan": "free" }),
    User.countDocuments({ role: "company", "subscription.plan": "basic" }),
    User.countDocuments({ role: "company", "subscription.plan": "premium" }),
    User.find({}).sort({ createdAt: -1 }).limit(5).select("fullName email role createdAt isVerified isBlocked"),
    Job.find({}).sort({ createdAt: -1 }).limit(5).select("title companyName category createdAt slots"),
  ]);

  return {
    totals: {
      users: totalSeekers,
      companies: totalCompanies,
      admins: totalAdmins,
      jobs: totalJobs,
      applications: totalApplications,
    },
    moderation: {
      blockedUsers,
      verifiedUsers,
      pendingVerification,
    },
    growth: {
      newUsersThisWeek,
      newJobsThisWeek,
    },
    subscriptions: {
      free: freePlanCount,
      basic: basicPlanCount,
      premium: premiumPlanCount,
    },
    recentUsers,
    recentJobs,
  };
};

// ------------------------------------------------------------------
// User Management
// ------------------------------------------------------------------
export const getAllUsersService = async (filters) => {
  const {
    role,
    search,
    status,
    verified,
    page = 1,
    limit = 10,
  } = filters;

  const query = {};

  if (role && ["user", "company", "admin"].includes(role)) {
    query.role = role;
  }

  if (status === "blocked") {
    query.isBlocked = true;
  } else if (status === "active") {
    query.isBlocked = false;
  }

  if (verified === "true") {
    query.isVerified = true;
  } else if (verified === "false") {
    query.isVerified = false;
  }

  if (search && search.trim()) {
    const term = search.trim();
    query.$or = [
      { fullName: { $regex: term, $options: "i" } },
      { email: { $regex: term, $options: "i" } },
      { phone: { $regex: term, $options: "i" } },
      { companyName: { $regex: term, $options: "i" } },
    ];
  }

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const [users, total] = await Promise.all([
    User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    User.countDocuments(query),
  ]);

  return {
    users,
    total,
    page: pageNum,
    pages: Math.max(Math.ceil(total / limitNum), 1),
  };
};

export const toggleBlockUserService = async (userId, block, adminId) => {
  if (userId.toString() === adminId.toString()) {
    throw new Error("You cannot block your own admin account.");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  if (user.role === "admin") {
    throw new Error("Admin accounts cannot be blocked.");
  }

  user.isBlocked = !!block;
  await user.save();

  return user;
};

export const toggleVerifyUserService = async (userId, verified) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  user.isVerified = !!verified;
  await user.save();

  return user;
};

export const deleteUserService = async (userId, adminId) => {
  if (userId.toString() === adminId.toString()) {
    throw new Error("You cannot delete your own admin account.");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  if (user.role === "admin") {
    throw new Error("Admin accounts cannot be deleted.");
  }

  // Cascade cleanup so we don't leave orphaned records behind
  if (user.role === "company") {
    const companyJobs = await Job.find({ company: userId }).select("_id");
    const jobIds = companyJobs.map((j) => j._id);
    if (jobIds.length > 0) {
      await Application.deleteMany({ job: { $in: jobIds } });
      await Invitation.deleteMany({ job: { $in: jobIds } });
      await Job.deleteMany({ _id: { $in: jobIds } });
    }
    await Invitation.deleteMany({ company: userId });
  } else {
    await Application.deleteMany({ seeker: userId });
    await Invitation.deleteMany({ seeker: userId });
  }

  await User.findByIdAndDelete(userId);

  return { message: "User deleted successfully" };
};

// ------------------------------------------------------------------
// Job Management (listing only — deletion reuses the existing job route)
// ------------------------------------------------------------------
export const getAllJobsService = async (filters) => {
  const { search, category, page = 1, limit = 10 } = filters;

  const query = {};

  if (category && category.trim()) {
    query.category = { $regex: category.trim(), $options: "i" };
  }

  if (search && search.trim()) {
    const term = search.trim();
    query.$or = [
      { title: { $regex: term, $options: "i" } },
      { companyName: { $regex: term, $options: "i" } },
      { "location.city": { $regex: term, $options: "i" } },
      { "location.state": { $regex: term, $options: "i" } },
    ];
  }

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const [jobs, total] = await Promise.all([
    Job.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    Job.countDocuments(query),
  ]);

  // Attach a live applicant count per job for the admin table
  const jobIds = jobs.map((j) => j._id);
  const counts = await Application.aggregate([
    { $match: { job: { $in: jobIds } } },
    { $group: { _id: "$job", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [c._id.toString(), c.count]));

  const jobsWithCounts = jobs.map((job) => ({
    ...job.toObject(),
    applicantCount: countMap.get(job._id.toString()) || 0,
  }));

  return {
    jobs: jobsWithCounts,
    total,
    page: pageNum,
    pages: Math.max(Math.ceil(total / limitNum), 1),
  };
};