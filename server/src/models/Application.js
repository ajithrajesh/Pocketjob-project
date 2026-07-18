import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: [true, "Job reference is required"],
    },
    seeker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Seeker reference is required"],
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

applicationSchema.index({ job: 1, seeker: 1 }, { unique: true });

const Application = mongoose.model("Application", applicationSchema);

export default Application;
