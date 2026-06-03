import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getUserApplications } from "../controllers/application.controller.js";

const router = express.Router();

router.get("/", protectRoute, getUserApplications);

export default router;
