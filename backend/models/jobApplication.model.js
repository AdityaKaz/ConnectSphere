import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    coverLetter: { type: String, default: "" },
    resumeUrl: { type: String, default: "" },
  },
  { timestamps: true },
);

const JobApplication = mongoose.model("JobApplication", jobApplicationSchema);

export default JobApplication;
