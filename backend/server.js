import path from "path";
import { fileURLToPath } from "url";
import express from "express";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const frontendPath = path.resolve(__dirname, "../frontend/dist");

require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Fieldnote API listening on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
