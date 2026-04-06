import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { dataBaseConnection } from "./config/database.js";
import { indexRoutes } from "./routes/index.js";
import customErrorHandler from "./middleware/customErrorHandler.js";
import { apiRateLimiter } from "./middleware/rateLimiter.js";
import path from "path";

// Configure environment variables
dotenv.config();

// Server Setup
const app = express();
const PORT = process.env.PORT || 5005;

// Middlewares
app.use(express.json());
app.use(cors());
app.use(apiRateLimiter);
app.use(customErrorHandler);

// Serve static files
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "public")));

// Database Connection
dataBaseConnection();

// Health Check
app.get("/", async (req, res) => {
  return res.status(200).json({
    name: "SaaS API",
    version: "1.0.0",
    description: "Multi-tenant Blogging Platform as a Service",
    status: "running",
  });
});

// Routes
app.use("/api", indexRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`SaaS Server running on port ${PORT}`);
});
