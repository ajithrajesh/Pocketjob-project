import {
  getDashboardStatsService,
  getAllUsersService,
  toggleBlockUserService,
  toggleVerifyUserService,
  deleteUserService,
  getAllJobsService,
} from "../services/adminService.js";

export const getDashboardStats = async (req, res) => {
  try {
    const stats = await getDashboardStatsService();
    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const result = await getAllUsersService(req.query);
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const blockUser = async (req, res) => {
  try {
    const user = await toggleBlockUserService(req.params.id, true, req.user._id);
    res.json({
      success: true,
      message: "User blocked successfully",
      user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const unblockUser = async (req, res) => {
  try {
    const user = await toggleBlockUserService(req.params.id, false, req.user._id);
    res.json({
      success: true,
      message: "User unblocked successfully",
      user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const verifyUser = async (req, res) => {
  try {
    const user = await toggleVerifyUserService(req.params.id, true);
    res.json({
      success: true,
      message: "User verified successfully",
      user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const unverifyUser = async (req, res) => {
  try {
    const user = await toggleVerifyUserService(req.params.id, false);
    res.json({
      success: true,
      message: "User verification revoked",
      user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const result = await deleteUserService(req.params.id, req.user._id);
    res.json({
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

export const getAllJobs = async (req, res) => {
  try {
    const result = await getAllJobsService(req.query);
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};