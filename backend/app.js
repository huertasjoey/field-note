const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const articleRoutes = require("./routes/articleRoutes");
const newsletterRoutes = require("./routes/newsletterRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

const origins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({ origin: origins }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  res.json({ status: "ok", database: states[mongoose.connection.readyState] || "unknown", uptime: process.uptime() });
});
app.use("/api/articles", articleRoutes);
app.use("/api/newsletter", newsletterRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
