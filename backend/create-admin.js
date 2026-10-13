// Creates (or promotes) the initial administrator from environment variables.
//   ADMIN_EMAIL, ADMIN_PASSWORD (required), ADMIN_NAME (optional)
// Usage: npm run create-admin     (remove ADMIN_PASSWORD from .env afterwards)
import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import { validatePassword } from "./controllers/authController.js";
import { EMAIL_RE } from "./utils/helpers.js";

async function main() {
  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";
  const name = (process.env.ADMIN_NAME || "Site Admin").trim();
  if (!EMAIL_RE.test(email)) throw new Error("Set ADMIN_EMAIL to a valid email address in backend/.env");
  const problems = validatePassword(password);
  if (problems.length) throw new Error(`ADMIN_PASSWORD is not strong enough: ${problems.join("; ")}`);

  await connectDB();
  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = "admin";
    existing.passwordHash = passwordHash;
    await existing.save();
    console.log(`Updated existing user ${email}: role=admin, password reset.`);
  } else {
    await User.create({ name, email, passwordHash, role: "admin" });
    console.log(`Created administrator ${email}.`);
  }
}

main()
  .catch((err) => {
    console.error("create-admin failed:", err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
