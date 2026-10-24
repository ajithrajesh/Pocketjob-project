import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import { seedJobs } from "./utils/seeder.js";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import { scheduleSubscriptionExpiryJob } from "./jobs/subscriptionExpiryJob.js";

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
    const server = http.createServer(app);

    const allowedSocketOrigins = process.env.CLIENT_URL
      ? process.env.CLIENT_URL.split(",").map((s) => s.trim())
      : "*";

    const io = new Server(server, {
      cors: {
        origin: allowedSocketOrigins,
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
      },
    });

    const userSockets = new Map();

    io.on("connection", (socket) => {
      socket.on("join", (userId) => {
        if (userId) {
          userSockets.set(userId.toString(), socket.id);
        }
      });

      socket.on("disconnect", () => {
        for (const [userId, socketId] of userSockets.entries()) {
          if (socketId === socket.id) {
            userSockets.delete(userId);
            break;
          }
        }
      });
    });

   
    app.set("io", io);
    app.set("userSockets", userSockets);

    scheduleSubscriptionExpiryJob(app);

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on port ${PORT} (env: ${process.env.NODE_ENV || "development"})`);
    });

    const handleShutdown = async (signal) => {
      console.log(`\nReceived ${signal}. Gracefully shutting down...`);
      server.close(async () => {
        try {
          await mongoose.connection.close();
          console.log("MongoDB connection closed.");
        } catch (err) {
          console.error("Error closing MongoDB connection:", err);
        }
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => handleShutdown("SIGTERM"));
    process.on("SIGINT", () => handleShutdown("SIGINT"));
  } catch (error) {
    console.error("Server Failed to Start:", error.message);
  }
};

startServer();