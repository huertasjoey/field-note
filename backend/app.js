const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const { loadSession, csrfProtection } = require("./middleware/auth");
const articleRoutes = require("./routes/articleRoutes");
const newsletterRoutes = require("./routes/newsletterRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

const origins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

// Set TRUST_PROXY=1 behind a reverse proxy so rate limiting sees real client IPs.
if (process.env.TRUST_PROXY) app.set("trust proxy", Number(process.env.TRUST_PROXY) || process.env.TRUST_PROXY);

app.use(cors({ origin: origins, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(loadSession);
app.use(csrfProtection(origins));

app.get("/api/health", (req, res) => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  res.json({ status: "ok", database: states[mongoose.connection.readyState] || "unknown", uptime: process.uptime() });
});
app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/newsletter", newsletterRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
