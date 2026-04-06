import { Story } from "../models/story.js";
import { Usage } from "../models/usage.js";
import { Subscription } from "../models/subscription.js";

export const addStory = async (req, res) => {
  try {
    const { title, summary, content, image, status } = req.body;

    if (!title || !summary || !content) {
      return res.status(400).json({
        error: "Title, Summary and Content are required",
      });
    }

    // Check story limit for tenant
    if (req.tenant) {
      const subscription = await Subscription.findOne({
        tenant: req.tenant._id,
      }).populate("plan");

      if (subscription?.plan?.limits?.maxStories > 0) {
        const storyCount = await Story.countDocuments({
          tenant: req.tenant._id,
        });
        if (storyCount >= subscription.plan.limits.maxStories) {
          return res.status(403).json({
            error:
              "Story limit reached for your plan. Please upgrade to create more stories.",
          });
        }
      }
    }

    const newStory = new Story({
      author: req.user._id,
      tenant: req.tenant?._id,
      title,
      summary,
      content,
      status: status || "draft",
      image:
        image ||
        "https://thersilentboy.com/wp-content/uploads/2022/09/Blogging.jpeg",
    });

    await newStory.save();

    // Track usage
    if (req.tenant) {
      const today = new Date().toISOString().split("T")[0];
      await Usage.findOneAndUpdate(
        { tenant: req.tenant._id, date: today },
        { $inc: { storiesCreated: 1 } },
        { upsert: true }
      );
    }

    return res.status(201).json({
      message: "Story added successfully",
      data: newStory,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAllStories = async (req, res) => {
  try {
    const filter = {};

    // Scope stories to tenant if present
    if (req.tenant) {
      filter.tenant = req.tenant._id;
    }

    // Allow filtering by status
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const stories = await Story.find(filter)
      .populate("author", "firstName lastName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Story.countDocuments(filter);

    return res.status(200).json({
      message: "Stories retrieved successfully",
      data: stories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getStoryById = async (req, res) => {
  try {
    const storyId = req.params.id;
    const story = await Story.findById(storyId).populate(
      "author",
      "firstName lastName"
    );

    if (!story) {
      return res.status(404).json({
        message: "Story not found",
        success: false,
      });
    }

    // Ensure story belongs to tenant
    if (
      req.tenant &&
      story.tenant?.toString() !== req.tenant._id.toString()
    ) {
      return res.status(404).json({
        message: "Story not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Story retrieved successfully",
      data: story,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const editStory = async (req, res) => {
  try {
    const storyId = req.params.id;
    const { title, summary, content, image, status } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (summary) updateData.summary = summary;
    if (content) updateData.content = content;
    if (image) updateData.image = image;
    if (status) updateData.status = status;

    const filter = { _id: storyId };
    if (req.tenant) {
      filter.tenant = req.tenant._id;
    }

    const updatedStory = await Story.findOneAndUpdate(filter, updateData, {
      new: true,
    });

    if (!updatedStory) {
      return res.status(404).json({
        message: "Story not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Story updated successfully",
      data: updatedStory,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteStory = async (req, res) => {
  try {
    const storyId = req.params.id;

    const filter = { _id: storyId };
    if (req.tenant) {
      filter.tenant = req.tenant._id;
    }

    const deletedStory = await Story.findOneAndDelete(filter);

    if (!deletedStory) {
      return res.status(404).json({
        message: "Story not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Story deleted successfully",
      data: deletedStory,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
