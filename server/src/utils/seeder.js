import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Job from "../models/Job.js";

export const seedJobs = async () => {
  try {
    console.log("Clearing existing jobs for fresh seeding...");
    await Job.deleteMany({});

    console.log("Seeding mock company and jobs...");

    // 1. Find or create a company user
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
      console.log("Seeded mock company user: provider@test.com / password123");
    }

    // 2. Insert seed jobs for all 7 categories
    const mockJobs = [
      // 1. Catering
      {
        title: "Catering Staff (Sunday Shift)",
        company: companyUser._id,
        companyName: companyUser.companyName,
        description: "Part-time helper needed for Sunday wedding catering shift. Duties include guest hospitality and banquet service. 10 slots available.",
        category: "Catering",
        salary: "₹1,500 / Day",
        slots: 10,
        date: "2026-07-26",
        requirements: ["Formal outfit (white shirt & black trousers)", "Good communication", "Punctual"],
        location: { city: "Kochi", district: "Ernakulam", state: "Kerala", pincode: "682024" },
      },
      {
        title: "Kitchen Assistant (Buffet Team)",
        company: companyUser._id,
        companyName: companyUser.companyName,
        description: "Assist chef with food preparation and buffet counter management for corporate event.",
        category: "Catering",
        salary: "₹1,800 / Day",
        slots: 5,
        date: "2026-07-28",
        requirements: ["Basic kitchen knowledge", "Food safety awareness"],
        location: { city: "Bangalore", district: "Bengaluru", state: "Karnataka", pincode: "560001" },
      },
      // 2. Warehouse
      {
        title: "Warehouse Assistant (Sorting)",
        company: companyUser._id,
        companyName: companyUser.companyName,
        description: "Helping with cargo loading, packaging, and sorting. Sunday day shift.",
        category: "Warehouse",
        salary: "₹1,100 / Day",
        slots: 5,
        date: "2026-07-26",
        requirements: ["Physical fitness", "Aadhaar Card copy"],
        location: { city: "Kochi", district: "Ernakulam", state: "Kerala", pincode: "682020" },
      },
      {
        title: "Inventory Assistant",
        company: companyUser._id,
        companyName: companyUser.companyName,
        description: "Scans packages, updates inventory list, and moves boxes within local distribution hub.",
        category: "Warehouse",
        salary: "₹1,300 / Day",
        slots: 4,
        date: "2026-07-27",
        requirements: ["Basic reading skills", "Physical fitness"],
        location: { city: "Bangalore", district: "Bengaluru", state: "Karnataka", pincode: "560068" },
      },
      // 3. Driver
      {
        title: "Weekend Driver for Catering Van",
        company: companyUser._id,
        companyName: companyUser.companyName,
        description: "Driver needed for transport. Sunday shift to transport cooking utensils and catering food.",
        category: "Driver",
        salary: "₹2,000 / Day",
        slots: 2,
        date: "2026-07-26",
        requirements: ["Valid heavy vehicle driving license", "Safe driving record"],
        location: { city: "Kochi", district: "Ernakulam", state: "Kerala", pincode: "682024" },
      },
      {
        title: "Personal Chauffeur (Part-time)",
        company: companyUser._id,
        companyName: companyUser.companyName,
        description: "Chauffeur needed for an executive's family for weekend travel around Thrissur.",
        category: "Driver",
        salary: "₹2,500 / Day",
        slots: 1,
        date: "2026-07-25",
        requirements: ["Valid driving license", "Clean background check", "Knows Malayalam/English"],
        location: { city: "Thrissur", district: "Thrissur", state: "Kerala", pincode: "680001" },
      },
      // 4. Delivery
      {
        title: "Sunday Delivery Executive",
        company: companyUser._id,
        companyName: companyUser.companyName,
        description: "E-commerce parcel delivery shift on Sunday.",
        category: "Delivery",
        salary: "₹1,200 / Day",
        slots: 8,
        date: "2026-07-26",
        requirements: ["Own two-wheeler", "Android phone", "Driving License"],
        location: { city: "Kochi", district: "Ernakulam", state: "Kerala", pincode: "682024" },
      },
      {
        title: "Food Delivery Partner (Weekend)",
        company: companyUser._id,
        companyName: companyUser.companyName,
        description: "Flexible weekend food delivery shift. Choose your hours between 11 AM and 11 PM.",
        category: "Delivery",
        salary: "₹1,500 / Day",
        slots: 15,
        date: "2026-07-25",
        requirements: ["Smartphone", "Two-wheeler", "Punctuality"],
        location: { city: "Bangalore", district: "Bengaluru", state: "Karnataka", pincode: "560025" },
      },
      // 5. Housekeeping
      {
        title: "Resort Housekeeper (Part-time)",
        company: companyUser._id,
        companyName: companyUser.companyName,
        description: "Clean guest rooms, replace towels, and tidy lobby areas. Shift starts 9 AM.",
        category: "Housekeeping",
        salary: "₹1,000 / Day",
        slots: 6,
        date: "2026-07-27",
        requirements: ["Previous cleaning experience preferred", "Aadhaar card"],
        location: { city: "Kochi", district: "Ernakulam", state: "Kerala", pincode: "682016" },
      },
      {
        title: "Office Cleaning Staff (Weekend)",
        company: companyUser._id,
        companyName: companyUser.companyName,
        description: "General deep cleaning of office floors, glass panels, and cafeteria on Sunday.",
        category: "Housekeeping",
        salary: "₹1,100 / Day",
        slots: 3,
        date: "2026-07-26",
        requirements: ["Willingness to clean", "Punctuality"],
        location: { city: "Thrissur", district: "Thrissur", state: "Kerala", pincode: "680003" },
      },
      // 6. Event Staff
      {
        title: "Corporate Event Host / Hostess",
        company: companyUser._id,
        companyName: companyUser.companyName,
        description: "Assist with guest registration, ticketing, and guiding delegates to seats at corporate conclave.",
        category: "Event Staff",
        salary: "₹2,000 / Day",
        slots: 6,
        date: "2026-07-29",
        requirements: ["Excellent English/Hindi communication", "Professional dress code"],
        location: { city: "Bangalore", district: "Bengaluru", state: "Karnataka", pincode: "560048" },
      },
      {
        title: "Concert Venue Setup Crew",
        company: companyUser._id,
        companyName: companyUser.companyName,
        description: "Help assemble stage banners, set up barricades, and arrange chairs for upcoming outdoor music concert.",
        category: "Event Staff",
        salary: "₹1,400 / Day",
        slots: 12,
        date: "2026-07-28",
        requirements: ["Physical fitness", "Ability to follow supervisor instructions"],
        location: { city: "Kochi", district: "Ernakulam", state: "Kerala", pincode: "682025" },
      },
      // 7. Valet Parking
      {
        title: "Shopping Mall Valet Driver",
        company: companyUser._id,
        companyName: companyUser.companyName,
        description: "Valet driver needed for evening rush hours (4 PM to 10 PM) at mall parking.",
        category: "Valet Parking",
        salary: "₹1,200 / Shift",
        slots: 4,
        date: "2026-07-25",
        requirements: ["Valid 4-wheeler driving license", "Excellent parking skills", "No accident record"],
        location: { city: "Kochi", district: "Ernakulam", state: "Kerala", pincode: "682024" },
      },
      {
        title: "Hotel Valet Attendant",
        company: companyUser._id,
        companyName: companyUser.companyName,
        description: "Provide valet parking service for hotel guests during weekend wedding ceremony.",
        category: "Valet Parking",
        salary: "₹1,500 / Shift",
        slots: 5,
        date: "2026-07-26",
        requirements: ["Driving license", "Gentle driving style", "Aadhaar Card"],
        location: { city: "Bangalore", district: "Bengaluru", state: "Karnataka", pincode: "560001" },
      },
    ];

    await Job.insertMany(mockJobs);
    console.log("Mock jobs successfully seeded!");
  } catch (error) {
    console.error("Error seeding database:", error.message);
  }
};
