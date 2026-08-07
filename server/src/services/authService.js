import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { sendPasswordResetEmail } from "./emailService.js";



export const registerService = async (data) => {
  const {
    fullName,
    email,
    phone,
    password,
    confirmPassword,
    role, 

    gender,
    dob,

    state,
    district,
    city,
    pincode,

    categories,
    skills,

    
    companyName,
    organisationId,
  } = data;

  if (!fullName || !email || !phone || !password) {
    throw new Error("Please fill all required fields");
  }

  if (password !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const userData = {
    fullName,
    email,
    password: hashedPassword,
    phone,
    role: role || "user",
  };

  if (role === "company") {
    userData.companyName = companyName || "";
    userData.organisationId = organisationId || "";
    
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    userData.subscription = {
      plan: "free",
      status: "active",
      startDate,
      endDate,
    };
  } else {
    userData.gender = gender || "";
    userData.dateOfBirth = dob || null;
    userData.address = {
      state: state || "",
      district: district || "",
      city: city || "",
      pincode: pincode || "",
    };
    userData.preferredCategories = categories || [];
    userData.skills = Array.isArray(skills)
      ? skills.map((s) => String(s).trim()).filter(Boolean)
      : [];
  }

  const user = await User.create(userData);

  const token = generateToken(user._id);

  user.password = undefined;

  return {
    token,
    user,
  };
};



export const loginService = async (data) => {
  const { email, password } = data;

  if (!email || !password) {
    throw new Error("Email and Password are required");
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new Error("Invalid Email or Password");
  }

  if (user.isBlocked) {
    throw new Error("Your account has been blocked");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid Email or Password");
  }


  user.lastLogin = new Date();

  await user.save();

  
  user.password = undefined;

  const token = generateToken(user._id);

  return {
    token,
    user,
  };
};

export const forgotPasswordService = async (email) => {
  if (!email) {
    throw new Error("Email is required");
  }

  const user = await User.findOne({ email });

  if (user) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes

    await user.save({ validateBeforeSave: false });

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${clientUrl}/reset-password/${rawToken}`;

    await sendPasswordResetEmail({
      to: user.email,
      recipientName: user.fullName,
      resetUrl,
    });
  }

  return "If an account exists for that email, a password reset link has been sent.";
};

export const resetPasswordService = async (rawToken, password, confirmPassword) => {
  if (!password || !confirmPassword) {
    throw new Error("Both password fields are required");
  }

  if (password !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new Error("Invalid or expired reset link. Please request a new one.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  user.password = hashedPassword;

  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  const token = generateToken(user._id);
  user.password = undefined;

  return {
    token,
    user,
  };
};