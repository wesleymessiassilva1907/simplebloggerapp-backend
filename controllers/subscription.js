import { Plan } from "../models/plan.js";
import { Subscription } from "../models/subscription.js";
import { Usage } from "../models/usage.js";

export const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true }).sort({ sortOrder: 1 });

    return res.status(200).json({
      message: "Plans retrieved successfully",
      data: plans,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      tenant: req.params.tenantId,
    }).populate("plan");

    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    return res.status(200).json({
      message: "Subscription retrieved successfully",
      data: subscription,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const changePlan = async (req, res) => {
  try {
    const { planId, billingCycle } = req.body;
    const { tenantId } = req.params;

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    const subscription = await Subscription.findOne({ tenant: tenantId });
    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    subscription.plan = plan._id;
    if (billingCycle) subscription.billingCycle = billingCycle;
    subscription.currentPeriodStart = new Date();
    subscription.currentPeriodEnd = new Date(
      Date.now() +
        (billingCycle === "yearly" ? 365 : 30) * 24 * 60 * 60 * 1000
    );

    await subscription.save();

    return res.status(200).json({
      message: "Plan changed successfully",
      data: subscription,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const cancelSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      tenant: req.params.tenantId,
    });

    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    subscription.cancelAtPeriodEnd = true;
    await subscription.save();

    return res.status(200).json({
      message: "Subscription will be canceled at end of billing period",
      data: subscription,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getUsage = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const today = new Date().toISOString().split("T")[0];

    const usage = await Usage.findOne({ tenant: tenantId, date: today });

    const subscription = await Subscription.findOne({
      tenant: tenantId,
    }).populate("plan");

    return res.status(200).json({
      message: "Usage retrieved successfully",
      data: {
        usage: usage || { apiRequests: 0, storiesCreated: 0, storageUsedMB: 0 },
        limits: subscription?.plan?.limits || {},
      },
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const seedPlans = async (req, res) => {
  try {
    const defaultPlans = [
      {
        name: "free",
        displayName: "Free",
        price: { monthly: 0, yearly: 0 },
        limits: {
          maxUsers: 2,
          maxStories: 10,
          maxStorageGB: 1,
          apiRequestsPerDay: 100,
          customDomain: false,
          customBranding: false,
          prioritySupport: false,
        },
        sortOrder: 0,
      },
      {
        name: "starter",
        displayName: "Starter",
        price: { monthly: 29, yearly: 290 },
        limits: {
          maxUsers: 5,
          maxStories: 100,
          maxStorageGB: 10,
          apiRequestsPerDay: 1000,
          customDomain: false,
          customBranding: false,
          prioritySupport: false,
        },
        sortOrder: 1,
      },
      {
        name: "professional",
        displayName: "Professional",
        price: { monthly: 79, yearly: 790 },
        limits: {
          maxUsers: 25,
          maxStories: 1000,
          maxStorageGB: 50,
          apiRequestsPerDay: 10000,
          customDomain: true,
          customBranding: true,
          prioritySupport: false,
        },
        sortOrder: 2,
      },
      {
        name: "enterprise",
        displayName: "Enterprise",
        price: { monthly: 199, yearly: 1990 },
        limits: {
          maxUsers: 100,
          maxStories: -1,
          maxStorageGB: 500,
          apiRequestsPerDay: -1,
          customDomain: true,
          customBranding: true,
          prioritySupport: true,
        },
        sortOrder: 3,
      },
    ];

    for (const planData of defaultPlans) {
      await Plan.findOneAndUpdate({ name: planData.name }, planData, {
        upsert: true,
        new: true,
      });
    }

    return res.status(200).json({
      message: "Plans seeded successfully",
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
