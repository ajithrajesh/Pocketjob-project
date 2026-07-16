import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import { seedJobs } from "./utils/seeder.js";
import mongoose from "mongoose";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    
    if (mongoose.connection.readyState === 1) {
      await seedJobs();
    } else {
      console.warn("WARNING: Skipping job database seeding because the database is offline.");
    }

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server Failed to Start:", error.message);
  }
};

startServer();