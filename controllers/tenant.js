import { Tenant } from "../models/tenant.js";
import { Plan } from "../models/plan.js";
import { Subscription } from "../models/subscription.js";
import { User } from "../models/user.js";
import crypto from "crypto";

export const createTenant = async (req, res) => {
  try {
    const { name, slug, domain } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ error: "Name and slug are required" });
    }

    const existingTenant = await Tenant.findOne({ slug });
    if (existingTenant) {
      return res.status(400).json({ error: "Slug already in use" });
    }

    const apiKey = `sk_${crypto.randomBytes(32).toString("hex")}`;

    const tenant = await new Tenant({
      name,
      slug,
      domain,
      owner: req.user._id,
      apiKey,
    }).save();

    // Update the user to be tenant_owner
    await User.findByIdAndUpdate(req.user._id, {
      tenant: tenant._id,
      role: "tenant_owner",
    });

    // Assign free plan by default
    const freePlan = await Plan.findOne({ name: "free" });
    if (freePlan) {
      await new Subscription({
        tenant: tenant._id,
        plan: freePlan._id,
        status: "active",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      }).save();
    }

    return res.status(201).json({
      message: "Tenant created successfully",
      data: tenant,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id).populate(
      "owner",
      "firstName lastName email"
    );

    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    return res.status(200).json({
      message: "Tenant retrieved successfully",
      data: tenant,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateTenant = async (req, res) => {
  try {
    const { name, domain, logo, settings } = req.body;
    const tenant = await Tenant.findById(req.params.id);

    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    if (tenant.owner.toString() !== req.user._id) {
      return res.status(403).json({ error: "Only the tenant owner can update" });
    }

    if (name) tenant.name = name;
    if (domain) tenant.domain = domain;
    if (logo) tenant.logo = logo;
    if (settings) tenant.settings = { ...tenant.settings, ...settings };

    await tenant.save();

    return res.status(200).json({
      message: "Tenant updated successfully",
      data: tenant,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);

    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    if (tenant.owner.toString() !== req.user._id) {
      return res.status(403).json({ error: "Only the tenant owner can delete" });
    }

    tenant.isActive = false;
    await tenant.save();

    return res.status(200).json({
      message: "Tenant deactivated successfully",
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const regenerateApiKey = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);

    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    if (tenant.owner.toString() !== req.user._id) {
      return res
        .status(403)
        .json({ error: "Only the tenant owner can regenerate the API key" });
    }

    tenant.apiKey = `sk_${crypto.randomBytes(32).toString("hex")}`;
    await tenant.save();

    return res.status(200).json({
      message: "API key regenerated successfully",
      data: { apiKey: tenant.apiKey },
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const inviteUser = async (req, res) => {
  try {
    const { email, role } = req.body;
    const tenantId = req.params.id;

    if (!email || !role) {
      return res.status(400).json({ error: "Email and role are required" });
    }

    const validRoles = ["admin", "editor", "viewer"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ error: "User not found. They must register first." });
    }

    if (user.tenant) {
      return res
        .status(400)
        .json({ error: "User already belongs to a tenant" });
    }

    user.tenant = tenantId;
    user.role = role;
    await user.save();

    return res.status(200).json({
      message: "User invited successfully",
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getTenantMembers = async (req, res) => {
  try {
    const members = await User.find({ tenant: req.params.id }).select(
      "firstName lastName email role isActive createdAt"
    );

    return res.status(200).json({
      message: "Members retrieved successfully",
      data: members,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
