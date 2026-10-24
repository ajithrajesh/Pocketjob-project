import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (uri) {
    try {
      console.log(`Attempting to connect to MongoDB: ${uri.includes("@") ? "Atlas (Remote Cloud)" : uri}`);
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log("MongoDB Connected Successfully!");
      return;
    } catch (error) {
      console.error(`MongoDB connection failed: ${error.message}`);
      if (process.env.NODE_ENV === "production") {
        console.error(
          "\nCRITICAL: MongoDB Atlas connection failed in production.\n" +
          "Troubleshooting checklist for Render:\n" +
          " 1. Go to MongoDB Atlas -> Network Access -> IP Access List.\n" +
          " 2. Make sure 0.0.0.0/0 (Allow access from anywhere) is added, since Render uses dynamic IP addresses.\n" +
          " 3. Go to MongoDB Atlas -> Database Access -> Ensure the database user & password match your MONGODB_URI.\n" +
          " 4. Verify MONGODB_URI is correctly added under Environment in your Render dashboard.\n"
        );
        return;
      }
    }
  } else if (process.env.NODE_ENV === "production") {
    console.error(
      "\nCRITICAL: MONGODB_URI environment variable is missing in production!\n" +
      "Please configure MONGODB_URI in your Render service environment variables.\n"
    );
    return;
  }

  // Local development fallbacks
  const localUris = [
    "mongodb://127.0.0.1:27017/workforce",
    "mongodb://localhost:27017/workforce",
  ];

  for (const localUri of localUris) {
    try {
      console.log(`Attempting local MongoDB connection: ${localUri}`);
      await mongoose.connect(localUri, {
        serverSelectionTimeoutMS: 3000,
      });
      console.log("Connected to local MongoDB successfully!");
      return;
    } catch (err) {
      // Continue to next uri
    }
  }

  console.error("CRITICAL: All MongoDB connection attempts failed.");
};

export default connectDB;