import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    owner: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      required: true,
    },
    domain: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    logo: {
      type: String,
      default: "",
    },
    settings: {
      allowPublicStories: {
        type: Boolean,
        default: true,
      },
      maxUsersPerPlan: {
        type: Number,
        default: 5,
      },
      customBranding: {
        type: Boolean,
        default: false,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    apiKey: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

tenantSchema.index({ slug: 1 });
tenantSchema.index({ apiKey: 1 });

const Tenant = mongoose.model("tenant", tenantSchema);

export { Tenant };
