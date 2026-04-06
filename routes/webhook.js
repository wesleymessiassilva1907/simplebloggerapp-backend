import express from "express";
import { handleStripeWebhook } from "../controllers/webhook.js";

const router = express.Router();

router.post("/stripe", express.raw({ type: "application/json" }), handleStripeWebhook);

export const webhookRouter = router;
