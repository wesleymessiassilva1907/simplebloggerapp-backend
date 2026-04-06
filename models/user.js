import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    tenant: {
      type: mongoose.Schema.ObjectId,
      ref: "tenant",
    },
    role: {
      type: String,
      enum: ["super_admin", "tenant_owner", "admin", "editor", "viewer"],
      default: "viewer",
    },
    activationToken: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    randomString: String,
    randomStringExpires: Date,
  },
  { timestamps: true }
);

userSchema.index({ tenant: 1 });
userSchema.index({ email: 1, tenant: 1 });

const User = mongoose.model("user", userSchema);

export { User };
