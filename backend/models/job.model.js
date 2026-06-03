import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, default: "" },
    description: { type: String, default: "" },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // Simple fields for demo/seed; can be expanded later
    type: { type: String, default: "" }, // e.g. full-time, internship
    level: { type: String, default: "" }, // e.g. entry, senior
  },
  { timestamps: true },
);

const Job = mongoose.model("Job", jobSchema);

export default Job;
