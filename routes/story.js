import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { resolveTenant } from "../middleware/tenantResolver.js";
import { trackUsage } from "../middleware/rateLimiter.js";
import {
  addStory,
  deleteStory,
  editStory,
  getAllStories,
  getStoryById,
} from "../controllers/story.js";

const router = express.Router();

router.post("/addstory", protectRoute, resolveTenant, trackUsage, addStory);
router.get("/getAllStories", resolveTenant, trackUsage, getAllStories);
router.get("/:id", protectRoute, resolveTenant, trackUsage, getStoryById);
router.put("/:id", protectRoute, resolveTenant, trackUsage, editStory);
router.delete("/:id", protectRoute, resolveTenant, trackUsage, deleteStory);

export const storyRouter = router;
