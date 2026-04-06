import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      required: true,
    },
    tenant: {
      type: mongoose.Schema.ObjectId,
      ref: "tenant",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default:
        "https://thersilentboy.com/wp-content/uploads/2022/09/Blogging.jpeg",
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
  },
  { timestamps: true }
);

storySchema.index({ tenant: 1 });
storySchema.index({ tenant: 1, author: 1 });

const Story = mongoose.model("story", storySchema);

export { Story };
