import mongoose from "mongoose";

const invitationSchema = new mongoose.Schema(
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
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Company reference is required"],
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

// Ensure a seeker can be invited to a specific job only once
invitationSchema.index({ job: 1, seeker: 1 }, { unique: true });

const Invitation = mongoose.model("Invitation", invitationSchema);

export default Invitation;
