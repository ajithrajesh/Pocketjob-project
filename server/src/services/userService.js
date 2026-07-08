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