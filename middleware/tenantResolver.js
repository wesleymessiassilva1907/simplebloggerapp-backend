import { Tenant } from "../models/tenant.js";

export const resolveTenant = async (req, res, next) => {
  try {
    // Try to resolve tenant from header
    const tenantSlug = req.header("X-Tenant-Slug");
    const apiKey = req.header("X-API-Key");

    let tenant = null;

    if (apiKey) {
      tenant = await Tenant.findOne({ apiKey, isActive: true });
    } else if (tenantSlug) {
      tenant = await Tenant.findOne({ slug: tenantSlug, isActive: true });
    }

    if (!tenant) {
      return res.status(400).json({
        error: "Tenant not found. Provide X-Tenant-Slug or X-API-Key header.",
      });
    }

    req.tenant = tenant;
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Tenant resolution failed" });
  }
};
