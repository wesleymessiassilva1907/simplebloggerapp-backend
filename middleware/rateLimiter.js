import rateLimit from "express-rate-limit";
import { Usage } from "../models/usage.js";
import { Subscription } from "../models/subscription.js";

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    error: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const trackUsage = async (req, res, next) => {
  try {
    if (!req.tenant) {
      return next();
    }

    const today = new Date().toISOString().split("T")[0];

    await Usage.findOneAndUpdate(
      { tenant: req.tenant._id, date: today },
      { $inc: { apiRequests: 1 } },
      { upsert: true, new: true }
    );

    // Check daily API limit
    const subscription = await Subscription.findOne({
      tenant: req.tenant._id,
    }).populate("plan");

    if (subscription?.plan?.limits?.apiRequestsPerDay > 0) {
      const usage = await Usage.findOne({
        tenant: req.tenant._id,
        date: today,
      });

      if (
        usage &&
        usage.apiRequests > subscription.plan.limits.apiRequestsPerDay
      ) {
        return res.status(429).json({
          error: "Daily API request limit exceeded. Please upgrade your plan.",
        });
      }
    }

    next();
  } catch (error) {
    console.error("Usage tracking error:", error);
    next();
  }
};
