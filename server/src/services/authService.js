import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";



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