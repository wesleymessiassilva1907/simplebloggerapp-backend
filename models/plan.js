import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: ["free", "starter", "professional", "enterprise"],
    },
    displayName: {
      type: String,
      required: true,
    },
    price: {
      monthly: {
        type: Number,
        required: true,
      },
      yearly: {
        type: Number,
        required: true,
      },
    },
    currency: {
      type: String,
      default: "BRL",
    },
    limits: {
      maxUsers: {
        type: Number,
        required: true,
      },
      maxStories: {
        type: Number,
        required: true,
      },
      maxStorageGB: {
        type: Number,
        required: true,
      },
      apiRequestsPerDay: {
        type: Number,
        required: true,
      },
      customDomain: {
        type: Boolean,
        default: false,
      },
      customBranding: {
        type: Boolean,
        default: false,
      },
      prioritySupport: {
        type: Boolean,
        default: false,
      },
    },
    stripePriceIdMonthly: {
      type: String,
      default: "",
    },
    stripePriceIdYearly: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Plan = mongoose.model("plan", planSchema);

export { Plan };
