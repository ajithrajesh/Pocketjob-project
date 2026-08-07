import { registerService, loginService, forgotPasswordService, resetPasswordService } from "../services/authService.js";
import User from "../models/User.js";

export const registerUser = async (req, res) => {
  try {
    const data = await registerService(req.body);

    res.status(201).json({
      success: true,
      message: "User Registered Successfully",
      ...data,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const data = await loginService(req.body);

    res.status(200).json({
      success: true,
      message: "Login Successful",
      ...data,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
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

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const message = await forgotPasswordService(email);

    res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    const data = await resetPasswordService(token, password, confirmPassword);

    res.status(200).json({
      success: true,
      message: "Password Reset Successful",
      ...data,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};