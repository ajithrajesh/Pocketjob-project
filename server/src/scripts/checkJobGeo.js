// Diagnostic script — run from server/ directory:
//   node ../checkJobGeo.js   (adjust path to wherever you put this)
// or copy it into server/src/scripts/checkJobGeo.js and run:
//   node src/scripts/checkJobGeo.js

import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Job from "../models/Job.js";

dotenv.config();

const run = async () => {
  await connectDB();

  const total = await Job.countDocuments();
  const withGeo = await Job.countDocuments({ "location.geo.coordinates": { $exists: true } });
  const withoutGeo = total - withGeo;

  console.log(`Total jobs: ${total}`);
  console.log(`With coordinates: ${withGeo}`);
  console.log(`WITHOUT coordinates: ${withoutGeo}`);

  const indexes = await Job.collection.indexes();
  const geoIndex = indexes.find((idx) => JSON.stringify(idx.key).includes("2dsphere"));
  console.log("\n2dsphere index present:", !!geoIndex);
  if (geoIndex) console.log(geoIndex);

  console.log("\nSample jobs (first 5):");
  const samples = await Job.find().limit(5).select("title location");
  samples.forEach((j) => console.log(`- ${j.title}:`, JSON.stringify(j.location)));

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
