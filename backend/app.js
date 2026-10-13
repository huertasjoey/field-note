const path = require("path");
const fs = require("fs");
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
if (process.env.RENDER_EXTERNAL_URL) origins.push(process.env.RENDER_EXTERNAL_URL.replace(/\/$/, ""));

// Behind a reverse proxy (Render) the client IP comes from X-Forwarded-For; needed for rate limiting.
const trustProxy = process.env.TRUST_PROXY || (process.env.NODE_ENV === "production" ? "1" : "");
if (trustProxy) app.set("trust proxy", Number(trustProxy) || trustProxy);

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

// Production: serve the built React app from this same service (same origin => no CORS/cookie issues).
const dist = path.join(__dirname, "..", "frontend", "dist");
if (fs.existsSync(path.join(dist, "index.html"))) {
  app.use(express.static(dist, { index: false, maxAge: "1h" }));
  app.get(/^\/(?!api\/).*/, (req, res) => res.sendFile(path.join(dist, "index.html")));
}

app.use(notFound);
app.use(errorHandler);

module.exports = app;
