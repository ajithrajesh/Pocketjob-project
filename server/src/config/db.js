import mongoose from "mongoose";

const connectDB = async () => {
  const uris = [
    process.env.MONGODB_URI,
    "mongodb://127.0.0.1:27017/workforce",
    "mongodb://localhost:27017/workforce"
  ];

  for (const uri of uris) {
    if (!uri) continue;
    try {
      console.log(`Attempting to connect to MongoDB: ${uri.includes("@") ? "Atlas (Remote Cloud)" : uri}`);
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000 // 5 seconds timeout
      });
      console.log("MongoDB Connected Successfully!");
      return;
    } catch (error) {
      console.error(`MongoDB Connection to ${uri.includes("@") ? "Atlas" : uri} failed:`, error.message);
    }
  }

  console.error("CRITICAL: All MongoDB connection attempts failed. The server will start, but database operations will fail until a database is available.");
};

export default connectDB;