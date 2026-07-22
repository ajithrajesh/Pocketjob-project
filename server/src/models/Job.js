import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Company reference is required"],
    },
    companyName: {
      type: String,
      required: [true, "Company name is required"],
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
    },
    category: {
      type: String,
      required: [true, "Job category is required"],
      trim: true,
    },
    location: {
      state: {
        type: String,
        default: "",
      },
      district: {
        type: String,
        default: "",
      },
      city: {
        type: String,
        default: "",
      },
      pincode: {
        type: String,
        default: "",
      },
    },
    salary: {
      type: String,
      default: "",
    },
    slots: {
      type: Number,
      default: 1,
    },
    date: {
      type: String,
      default: "",
    },
    requirements: [
      {
        type: String,
      },
    ],
    presetQuestions: [
      {
        id: { type: String, required: true },
        questionText: { type: String, required: true },
        required: { type: Boolean, default: false },
        answerType: { type: String, enum: ["text", "document"], default: "text" },
      },
    ],
  },
  {
    timestamps: true,
  }
);


jobSchema.index({
  title: "text",
  "location.city": "text",
  "location.district": "text",
  "location.state": "text",
});

const Job = mongoose.model("Job", jobSchema);

export default Job;
