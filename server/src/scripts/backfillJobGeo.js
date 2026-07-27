

import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Job from "../models/Job.js";
import { geocodeLocation } from "../utils/geocode.js";

dotenv.config();


const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const run = async () => {
  await connectDB();

  const jobsToBackfill = await Job.find({
    $or: [
      { "location.geo": { $exists: false } },
      { "location.geo.coordinates": { $exists: false } },
    ],
  });

  console.log(`Found ${jobsToBackfill.length} job(s) without coordinates.`);

  let updated = 0;
  let skipped = 0;

  for (const job of jobsToBackfill) {
    const { city, district, state, pincode } = job.location || {};
    const result = await geocodeLocation({ city, district, state, pincode });

    if (result) {
      job.location.lat = result.lat;
      job.location.lng = result.lng;
      job.location.geo = { type: "Point", coordinates: [result.lng, result.lat] };
      await job.save();
      updated += 1;
      console.log(`✔ Geocoded "${job.title}" (${job._id}) -> ${result.lat}, ${result.lng}`);
    } else {
      skipped += 1;
      console.log(`✘ Could not geocode "${job.title}" (${job._id}) — location: ${JSON.stringify(job.location)}`);
    }

    // Be polite to the free Nominatim API: ~1 request/second.
    await sleep(1100);
  }

  console.log(`\nDone. Updated: ${updated}, Skipped: ${skipped}, Total: ${jobsToBackfill.length}`);
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((error) => {
  console.error("Backfill failed:", error);
  process.exit(1);
});
