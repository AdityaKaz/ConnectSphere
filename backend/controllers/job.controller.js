import Job from "../models/job.model.js";
import JobApplication from "../models/jobApplication.model.js";

export const getJobs = async (req, res) => {
  try {
    const { q, location, sortBy } = req.query;

    const filter = {};

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { company: { $regex: q, $options: "i" } },
      ];
    }

    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }

    let sort = { createdAt: -1 };
    if (sortBy === "oldest") sort = { createdAt: 1 };
    if (sortBy === "newest") sort = { createdAt: -1 };

    const jobs = await Job.find(filter).sort(sort);
    return res.status(200).json(jobs);
  } catch (error) {
    console.error("Error in getJobs controller:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    return res.status(200).json(job);
  } catch (error) {
    console.error("Error in getJobById controller:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Optional for now: basic creation for seeding/admin.
export const createJob = async (req, res) => {
  try {
    const { title, company, location, description, type, level } = req.body;
    if (!title || !company) {
      return res
        .status(400)
        .json({ message: "title and company are required" });
    }

    const job = await Job.create({
      title,
      company,
      location,
      description,
      type,
      level,
      postedBy: req.user?._id,
    });

    return res.status(201).json(job);
  } catch (error) {
    console.error("Error in createJob controller:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const applyToJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user._id;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const existing = await JobApplication.findOne({
      job: jobId,
      applicant: userId,
    });
    if (existing)
      return res.status(400).json({ message: "Already applied to this job" });

    const { coverLetter, resumeUrl } = req.body;

    const application = await JobApplication.create({
      job: jobId,
      applicant: userId,
      coverLetter: coverLetter || "",
      resumeUrl: resumeUrl || "",
    });

    return res
      .status(201)
      .json({ message: "Application submitted", application });
  } catch (error) {
    console.error("Error in applyToJob controller:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
