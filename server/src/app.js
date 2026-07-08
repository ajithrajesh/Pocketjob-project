import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

import notFoundMiddleware from "./middleware/notFoundMiddleware.js";
import errorMiddleware from "./middleware/errorMiddleware.js";

const app = express();

/* -------------------- Middleware -------------------- */

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ---------------------- Routes ---------------------- */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to WorkConnect API 🚀",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

/* ------------------ Error Handlers ------------------ */

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;