import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.ObjectId,
      ref: "tenant",
      required: true,
    },
    plan: {
      type: mongoose.Schema.ObjectId,
      ref: "plan",
      required: true,
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly",
    },
    status: {
      type: String,
      enum: ["active", "canceled", "past_due", "trialing", "paused"],
      default: "active",
    },
    stripeCustomerId: {
      type: String,
      default: "",
    },
    stripeSubscriptionId: {
      type: String,
      default: "",
    },
    currentPeriodStart: {
      type: Date,
    },
    currentPeriodEnd: {
      type: Date,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    trialEndsAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

subscriptionSchema.index({ tenant: 1 });
subscriptionSchema.index({ stripeSubscriptionId: 1 });

const Subscription = mongoose.model("subscription", subscriptionSchema);

export { Subscription };
