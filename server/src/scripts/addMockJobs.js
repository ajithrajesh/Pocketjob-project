// One-off script — adds 20 mock jobs to the DB, and EVERY job has
// presetQuestions set, so all 20 will show the Detailed Apply form
// (with at least one resume/document upload question) instead of
// Quick Apply.
//
// This does NOT touch your existing jobs — it only inserts new ones.
// Not idempotent: running it twice adds 20 more jobs.
//
// Run from the server/ directory:
//   node src/scripts/addMockJobs.js

import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Job from "../models/Job.js";
import bcrypt from "bcryptjs";

dotenv.config();

// Reusable question sets — every job below uses one of these, and every
// one includes at least one "document" (resume/ID) upload question.

const resumeOnly = [
  { id: "q1", questionText: "Please upload your resume", required: true, answerType: "document" },
];

const resumePlusExperience = [
  { id: "q1", questionText: "Please upload your resume", required: true, answerType: "document" },
  { id: "q2", questionText: "How many years of relevant experience do you have?", required: true, answerType: "text" },
];

const resumeExperienceAvailability = [
  { id: "q1", questionText: "Please upload your resume", required: true, answerType: "document" },
  { id: "q2", questionText: "How many years of relevant experience do you have?", required: true, answerType: "text" },
  { id: "q3", questionText: "Are you available on weekends?", required: true, answerType: "text" },
  { id: "q4", questionText: "Do you have your own transport to reach the venue?", required: false, answerType: "text" },
];

const licenseAndResume = [
  { id: "q1", questionText: "Please upload your resume", required: true, answerType: "document" },
  { id: "q2", questionText: "Driving license number", required: true, answerType: "text" },
  { id: "q3", questionText: "Years of driving experience", required: true, answerType: "text" },
];

const idAndAvailability = [
  { id: "q1", questionText: "Please upload a copy of your ID proof (Aadhaar/PAN)", required: true, answerType: "document" },
  { id: "q2", questionText: "Which shifts are you available for?", required: true, answerType: "text" },
];

const resumeAndWhyYou = [
  { id: "q1", questionText: "Please upload your resume", required: true, answerType: "document" },
  { id: "q2", questionText: "Why should we pick you for this role?", required: false, answerType: "text" },
  { id: "q3", questionText: "Preferred shift timing", required: true, answerType: "text" },
];

// Jobs ----------------------------------------------------------------
// 20 jobs, every single one with presetQuestions set (Detailed Apply only)

const buildMockJobs = () => [
  {
    title: "Kitchen Assistant (Buffet Team)",
    description: "Assist chef with food preparation and buffet counter management for a corporate event.",
    category: "Catering",
    salary: "₹1,800 / Day",
    slots: 5,
    date: "2026-08-17",
    requirements: ["Basic kitchen knowledge", "Food safety awareness"],
    location: { city: "Bangalore", district: "Bengaluru", state: "Karnataka", pincode: "560001" },
    presetQuestions: resumePlusExperience,
  },
  {
    title: "Banquet Service Captain",
    description: "Lead a small team of banquet staff for a large wedding reception. Prior supervisory experience preferred.",
    category: "Catering",
    salary: "₹2,200 / Day",
    slots: 2,
    date: "2026-08-20",
    requirements: ["Leadership experience", "Formal attire"],
    location: { city: "Kochi", district: "Ernakulam", state: "Kerala", pincode: "682024" },
    presetQuestions: resumeExperienceAvailability,
  },
  {
    title: "Sunday Catering Helper",
    description: "Part-time helper needed for Sunday wedding catering shift. Guest hospitality and banquet service.",
    category: "Catering",
    salary: "₹1,500 / Day",
    slots: 10,
    date: "2026-08-16",
    requirements: ["Formal outfit", "Good communication", "Punctual"],
    location: { city: "Kochi", district: "Ernakulam", state: "Kerala", pincode: "682024" },
    presetQuestions: resumeOnly,
  },
  {
    title: "Weekend Driver for Catering Van",
    description: "Driver needed to transport cooking utensils and catering food on Sunday shift.",
    category: "Driver",
    salary: "₹2,000 / Day",
    slots: 2,
    date: "2026-08-16",
    requirements: ["Valid heavy vehicle driving license", "Safe driving record"],
    location: { city: "Kochi", district: "Ernakulam", state: "Kerala", pincode: "682024" },
    presetQuestions: licenseAndResume,
  },
  {
    title: "Personal Chauffeur (Part-time)",
    description: "Chauffeur needed for an executive's family for weekend travel around Thrissur.",
    category: "Driver",
    salary: "₹2,500 / Day",
    slots: 1,
    date: "2026-08-15",
    requirements: ["Valid driving license", "Clean background check"],
    location: { city: "Thrissur", district: "Thrissur", state: "Kerala", pincode: "680001" },
    presetQuestions: licenseAndResume,
  },
  {
    title: "Sunday Delivery Executive",
    description: "E-commerce parcel delivery shift on Sunday, covering multiple neighbourhoods.",
    category: "Delivery",
    salary: "₹1,200 / Day",
    slots: 8,
    date: "2026-08-16",
    requirements: ["Own two-wheeler", "Android phone", "Driving License"],
    location: { city: "Kochi", district: "Ernakulam", state: "Kerala", pincode: "682024" },
    presetQuestions: idAndAvailability,
  },
  {
    title: "Food Delivery Partner (Weekend)",
    description: "Flexible weekend food delivery shift. Choose your hours between 11 AM and 11 PM.",
    category: "Delivery",
    salary: "₹1,500 / Day",
    slots: 15,
    date: "2026-08-15",
    requirements: ["Smartphone", "Two-wheeler", "Punctuality"],
    location: { city: "Bangalore", district: "Bengaluru", state: "Karnataka", pincode: "560025" },
    presetQuestions: resumeAndWhyYou,
  },
  {
    title: "Warehouse Sorting Assistant",
    description: "Helping with cargo loading, packaging, and sorting for a Sunday day shift.",
    category: "Warehouse",
    salary: "₹1,100 / Day",
    slots: 5,
    date: "2026-08-16",
    requirements: ["Physical fitness", "Aadhaar Card copy"],
    location: { city: "Kochi", district: "Ernakulam", state: "Kerala", pincode: "682020" },
    presetQuestions: idAndAvailability,
  },
  {
    title: "Inventory Scanning Assistant",
    description: "Scans packages, updates inventory list, and moves boxes within a local distribution hub.",
    category: "Warehouse",
    salary: "₹1,300 / Day",
    slots: 4,
    date: "2026-08-17",
    requirements: ["Basic reading skills", "Physical fitness"],
    location: { city: "Bangalore", district: "Bengaluru", state: "Karnataka", pincode: "560068" },
    presetQuestions: resumePlusExperience,
  },
  {
    title: "Warehouse Forklift Operator",
    description: "Operate forklift for loading/unloading in a busy weekend distribution shift. Certification required.",
    category: "Warehouse",
    salary: "₹2,100 / Day",
    slots: 2,
    date: "2026-08-19",
    requirements: ["Valid forklift operating certificate", "Prior warehouse experience"],
    location: { city: "Bangalore", district: "Bengaluru", state: "Karnataka", pincode: "560068" },
    presetQuestions: resumeExperienceAvailability,
  },
  {
    title: "Resort Housekeeper (Part-time)",
    description: "Clean guest rooms, replace towels, and tidy lobby areas. Shift starts 9 AM.",
    category: "Housekeeping",
    salary: "₹1,000 / Day",
    slots: 6,
    date: "2026-08-16",
    requirements: ["Previous cleaning experience preferred", "Aadhaar card"],
    location: { city: "Kochi", district: "Ernakulam", state: "Kerala", pincode: "682016" },
    presetQuestions: resumeOnly,
  },
  {
    title: "Office Cleaning Staff (Weekend)",
    description: "General deep cleaning of office floors, glass panels, and cafeteria on Sunday.",
    category: "Housekeeping",
    salary: "₹1,100 / Day",
    slots: 3,
    date: "2026-08-16",
    requirements: ["Willingness to clean", "Punctuality"],
    location: { city: "Thrissur", district: "Thrissur", state: "Kerala", pincode: "680003" },
    presetQuestions: idAndAvailability,
  },
  {
    title: "Corporate Event Host / Hostess",
    description: "Assist with guest registration, ticketing, and guiding delegates to seats at a corporate conclave.",
    category: "Event Staff",
    salary: "₹2,000 / Day",
    slots: 6,
    date: "2026-08-21",
    requirements: ["Excellent English/Hindi communication", "Professional dress code"],
    location: { city: "Bangalore", district: "Bengaluru", state: "Karnataka", pincode: "560048" },
    presetQuestions: resumeExperienceAvailability,
  },
  {
    title: "Concert Venue Setup Crew",
    description: "Help assemble stage banners, set up barricades, and arrange chairs for an outdoor concert.",
    category: "Event Staff",
    salary: "₹1,400 / Day",
    slots: 12,
    date: "2026-08-14",
    requirements: ["Physical fitness", "Ability to follow instructions"],
    location: { city: "Kochi", district: "Ernakulam", state: "Kerala", pincode: "682025" },
    presetQuestions: resumeOnly,
  },
  {
    title: "Promotional Staff (Mall Activation)",
    description: "Represent a brand at a mall activation booth — engage shoppers, explain the offer, log leads.",
    category: "Event Staff",
    salary: "₹1,300 / Day",
    slots: 8,
    date: "2026-08-17",
    requirements: ["Outgoing personality", "Comfortable approaching strangers"],
    location: { city: "Bangalore", district: "Bengaluru", state: "Karnataka", pincode: "560025" },
    presetQuestions: resumeAndWhyYou,
  },
  {
    title: "Wedding Photography Assistant",
    description: "Support the lead photographer with equipment, lighting setup, and guest coordination at a wedding.",
    category: "Event Staff",
    salary: "₹1,900 / Day",
    slots: 2,
    date: "2026-08-22",
    requirements: ["Basic photography knowledge helpful", "Punctual"],
    location: { city: "Kochi", district: "Ernakulam", state: "Kerala", pincode: "682024" },
    presetQuestions: resumePlusExperience,
  },
  {
    title: "Shopping Mall Valet Driver",
    description: "Valet driver needed for evening rush hours (4 PM to 10 PM) at mall parking.",
    category: "Valet Parking",
    salary: "₹1,200 / Shift",
    slots: 4,
    date: "2026-08-15",
    requirements: ["Valid 4-wheeler driving license", "No accident record"],
    location: { city: "Kochi", district: "Ernakulam", state: "Kerala", pincode: "682024" },
    presetQuestions: licenseAndResume,
  },
  {
    title: "Hotel Valet Attendant",
    description: "Provide valet parking service for hotel guests during a weekend wedding ceremony.",
    category: "Valet Parking",
    salary: "₹1,500 / Shift",
    slots: 5,
    date: "2026-08-16",
    requirements: ["Driving license", "Gentle driving style", "Aadhaar Card"],
    location: { city: "Bangalore", district: "Bengaluru", state: "Karnataka", pincode: "560001" },
    presetQuestions: licenseAndResume,
  },
  {
    title: "Security Guard (Night Shift)",
    description: "Overnight security coverage for a commercial complex. Prior security training preferred.",
    category: "Security",
    salary: "₹1,600 / Night",
    slots: 3,
    date: "2026-08-18",
    requirements: ["Prior security experience preferred", "Physically fit"],
    location: { city: "Kochi", district: "Ernakulam", state: "Kerala", pincode: "682030" },
    presetQuestions: resumeExperienceAvailability,
  },
  {
    title: "Front Desk Receptionist (Temp)",
    description: "Cover front-desk duties for a boutique hotel for a busy weekend — check-in/out, calls, guest queries.",
    category: "Hospitality",
    salary: "₹1,700 / Day",
    slots: 1,
    date: "2026-08-15",
    requirements: ["Prior front-desk or hospitality experience", "Good spoken English"],
    location: { city: "Thrissur", district: "Thrissur", state: "Kerala", pincode: "680001" },
    presetQuestions: resumePlusExperience,
  },
];

const run = async () => {
  await connectDB();

  if (mongoose.connection.readyState !== 1) {
    console.error("Could not connect to the database. Aborting.");
    process.exit(1);
  }

  const beforeCount = await Job.countDocuments();
  console.log(`Jobs currently in DB: ${beforeCount}`);

  let companyUser = await User.findOne({ role: "company" });
  if (!companyUser) {
    const hashedPassword = await bcrypt.hash("password123", 10);
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    companyUser = await User.create({
      fullName: "Ajith Rajesh",
      email: "provider@test.com",
      phone: "9876543210",
      password: hashedPassword,
      role: "company",
      companyName: "Elite Catering & Events",
      organisationId: "ORG-ELITE-999",
      subscription: {
        plan: "free",
        status: "active",
        startDate,
        endDate,
      },
    });
    console.log("Created mock company user: provider@test.com / password123");
  }

  const mockJobs = buildMockJobs().map((job) => ({
    ...job,
    company: companyUser._id,
    companyName: companyUser.companyName,
  }));

  const missingQuestions = mockJobs.filter((j) => !j.presetQuestions || j.presetQuestions.length === 0);
  if (missingQuestions.length > 0) {
    console.error(`${missingQuestions.length} job(s) are missing presetQuestions — aborting insert.`);
    process.exit(1);
  }

  await Job.insertMany(mockJobs);

  const afterCount = await Job.countDocuments();
  console.log(`Inserted ${mockJobs.length} jobs — all with presetQuestions (Detailed Apply only).`);
  console.log(`Jobs in DB now: ${afterCount}`);

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error("Failed to add mock jobs:", err.message);
  process.exit(1);
});
