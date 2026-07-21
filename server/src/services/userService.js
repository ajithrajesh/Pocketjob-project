import User from "../models/User.js";

export const getProfileService = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

export const updateProfileService = async (userId, data) => {
  const user = await User.findByIdAndUpdate(userId, data, {
    new: true,
    runValidators: true,
  });

  return user;
};

export const uploadProfilePhotoService = async (userId, file) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  user.profilePhoto = {
    url: file.path,
    publicId: file.filename,
  };

  await user.save();

  return user;
};

export const uploadAadhaarFrontService = async (userId, file) => {
  const user = await User.findById(userId);

  user.aadhaarFront = {
    url: file.path,
    publicId: file.filename,
  };

  await user.save();

  return user;
};

export const uploadAadhaarBackService = async (userId, file) => {
  const user = await User.findById(userId);

  user.aadhaarBack = {
    url: file.path,
    publicId: file.filename,
  };

  await user.save();

  return user;
};

export const uploadLicenseService = async (userId, file) => {
  const user = await User.findById(userId);

  user.drivingLicense = {
    url: file.path,
    publicId: file.filename,
  };

  await user.save();

  return user;
};

export const uploadResumeService = async (userId, file) => {
  const user = await User.findById(userId);

  user.resume = {
    url: file.path,
    publicId: file.filename,
  };

  await user.save();

  return user;
};

export const getSeekersService = async (filters) => {
  const { category, city, search, minExperience, maxExperience, sort } = filters;
  const query = { role: "user" };

  if (category) {
    query.preferredCategories = category;
  }

  if (city) {
    query["address.city"] = { $regex: city, $options: "i" };
  }

  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { skills: { $regex: search, $options: "i" } },
    ];
  }

  if (minExperience !== undefined && minExperience !== "") {
    query.experience = { ...query.experience, $gte: Number(minExperience) };
  }
  if (maxExperience !== undefined && maxExperience !== "") {
    query.experience = { ...query.experience, $lte: Number(maxExperience) };
  }

  let sortObj = { createdAt: -1 }; // default: newest first
  if (sort) {
    if (sort === "experience-desc") {
      sortObj = { experience: -1 };
    } else if (sort === "experience-asc") {
      sortObj = { experience: 1 };
    } else if (sort === "newest") {
      sortObj = { createdAt: -1 };
    } else if (sort === "oldest") {
      sortObj = { createdAt: 1 };
    } else if (sort === "name-asc") {
      sortObj = { fullName: 1 };
    } else if (sort === "name-desc") {
      sortObj = { fullName: -1 };
    }
  }

  const seekers = await User.find(query).select("-password").sort(sortObj);
  return seekers;
};

export const getCompaniesService = async (filters) => {
  const { search } = filters;
  const query = { role: "company" };

  if (search) {
    query.companyName = { $regex: search, $options: "i" };
  }

  const companies = await User.find(query).select("-password").sort({ createdAt: -1 });
  return companies;
};