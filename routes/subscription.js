import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import {
  getPlans,
  getSubscription,
  changePlan,
  cancelSubscription,
  getUsage,
  seedPlans,
} from "../controllers/subscription.js";

const router = express.Router();

router.get("/plans", getPlans);
router.post("/plans/seed", seedPlans);
router.get("/:tenantId", protectRoute, getSubscription);
router.put("/:tenantId/change-plan", protectRoute, requireRole("tenant_owner"), changePlan);
router.post("/:tenantId/cancel", protectRoute, requireRole("tenant_owner"), cancelSubscription);
router.get("/:tenantId/usage", protectRoute, getUsage);

export const subscriptionRouter = router;
