import {
  getProfileService,
  updateProfileService,
  uploadProfilePhotoService,
  uploadAadhaarFrontService,
  uploadAadhaarBackService,
  uploadLicenseService,
  uploadResumeService,
} from "../services/userService.js";

export const getProfile = async (req, res) => {
  try {
    const user = await getProfileService(req.user._id);

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await updateProfileService(req.user._id, req.body);

    res.json({
      success: true,
      message: "Profile Updated",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const uploadProfilePhoto = async (req, res) => {
  try {
    const user = await uploadProfilePhotoService(req.user._id, req.file);

    res.json({
      success: true,
      message: "Profile Photo Uploaded",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const uploadAadhaarFront = async (req, res) => {
  try {
    const user = await uploadAadhaarFrontService(req.user._id, req.file);

    res.json({
      success: true,
      message: "Aadhaar Front Uploaded",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const uploadAadhaarBack = async (req, res) => {
  try {
    const user = await uploadAadhaarBackService(req.user._id, req.file);

    res.json({
      success: true,
      message: "Aadhaar Back Uploaded",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const uploadLicense = async (req, res) => {
  try {
    const user = await uploadLicenseService(req.user._id, req.file);

    res.json({
      success: true,
      message: "Driving License Uploaded",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const uploadResume = async (req, res) => {
  try {
    const user = await uploadResumeService(req.user._id, req.file);

    res.json({
      success: true,
      message: "Resume Uploaded",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};