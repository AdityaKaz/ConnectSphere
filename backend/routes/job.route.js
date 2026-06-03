import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createJob,
  getJobById,
  applyToJob,
  getJobs,
} from "../controllers/job.controller.js";

const router = express.Router();

// Public browsing within auth context (consistent with this app)
router.get("/", protectRoute, getJobs);
router.get("/:id", protectRoute, getJobById);

// Apply to a job
router.post("/:id/apply", protectRoute, applyToJob);

// Not used by UI yet; kept for later extension
router.post("/create", protectRoute, createJob);

export default router;
