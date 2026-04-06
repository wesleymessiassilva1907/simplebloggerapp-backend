import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import {
  createTenant,
  getTenant,
  updateTenant,
  deleteTenant,
  regenerateApiKey,
  inviteUser,
  getTenantMembers,
} from "../controllers/tenant.js";

const router = express.Router();

router.post("/", protectRoute, createTenant);
router.get("/:id", protectRoute, getTenant);
router.put("/:id", protectRoute, requireRole("tenant_owner", "admin"), updateTenant);
router.delete("/:id", protectRoute, requireRole("tenant_owner"), deleteTenant);
router.post("/:id/regenerate-api-key", protectRoute, requireRole("tenant_owner"), regenerateApiKey);
router.post("/:id/invite", protectRoute, requireRole("tenant_owner", "admin"), inviteUser);
router.get("/:id/members", protectRoute, getTenantMembers);

export const tenantRouter = router;
