import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import { seedJobs } from "./utils/seeder.js";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";

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
    const io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
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

    // Store socket instances in the express app
    app.set("io", io);
    app.set("userSockets", userSockets);

    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server Failed to Start:", error.message);
  }
};

startServer();