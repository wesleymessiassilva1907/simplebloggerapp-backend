import express from "express";
import { authRouter } from "./auth.js";
import { storyRouter } from "./story.js";
import { tenantRouter } from "./tenant.js";
import { subscriptionRouter } from "./subscription.js";
import { webhookRouter } from "./webhook.js";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/tenants", tenantRouter);
router.use("/subscriptions", subscriptionRouter);
router.use("/story", storyRouter);
router.use("/webhooks", webhookRouter);

export const indexRoutes = router;
