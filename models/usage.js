import mongoose from "mongoose";

const usageSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.ObjectId,
      ref: "tenant",
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    apiRequests: {
      type: Number,
      default: 0,
    },
    storiesCreated: {
      type: Number,
      default: 0,
    },
    storageUsedMB: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

usageSchema.index({ tenant: 1, date: 1 }, { unique: true });

const Usage = mongoose.model("usage", usageSchema);

export { Usage };
