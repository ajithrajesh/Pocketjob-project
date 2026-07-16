import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import { seedJobs } from "./utils/seeder.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await seedJobs();

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server Failed to Start:", error.message);
  }
};

startServer();