import JobApplication from "../models/jobApplication.model.js";

export const getUserApplications = async (req, res) => {
  try {
    const applications = await JobApplication.find({ applicant: req.user._id })
      .populate("job")
      .sort({ createdAt: -1 });

    res.status(200).json(applications);
  } catch (error) {
    console.error("Error in getUserApplications:", error);
    res.status(500).json({ message: "Server error" });
  }
};
