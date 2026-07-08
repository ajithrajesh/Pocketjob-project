import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

/*
=========================================
REGISTER SERVICE
=========================================
*/

export const registerService = async (data) => {
  const {
    fullName,
    email,
    phone,
    password,
    confirmPassword,

    gender,
    dob,

    state,
    district,
    city,
    pincode,

    categories,
  } = data;

  // Check required fields
  if (!fullName || !email || !phone || !password) {
    throw new Error("Please fill all required fields");
  }

  // Password validation
  if (password !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  // Existing user
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("User already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await User.create({
    fullName,

    email,

    password: hashedPassword,

    phone,

    gender,

    dateOfBirth: dob,

    address: {
      state,
      district,
      city,
      pincode,
    },

    preferredCategories: categories || [],
  });

  // JWT
  const token = generateToken(user._id);

  // Hide password
  user.password = undefined;

  return {
    token,
    user,
  };
};

/*
=========================================
LOGIN SERVICE
=========================================
*/

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

  // Update last login
  user.lastLogin = new Date();

  await user.save();

  // Hide password
  user.password = undefined;

  const token = generateToken(user._id);

  return {
    token,
    user,
  };
};