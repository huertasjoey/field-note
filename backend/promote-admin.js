// Server-side maintenance script: gives an EXISTING account the admin role. Password is not touched.
//   npm run promote-admin -- --list              show accounts (name, email, role)
//   npm run promote-admin -- you@example.com     promote that account
// Roles can only be changed here (or by create-admin.js); the web API never accepts a role from a client.
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");

async function main() {
  const arg = (process.argv[2] || "").trim();
  if (!arg) throw new Error("Usage: npm run promote-admin -- <email>   (or --list)");
  await connectDB();

  if (arg === "--list") {
    const users = await User.find().sort({ createdAt: 1 }).select("name email role");
    users.forEach((u) => console.log(`${u.role.padEnd(5)}  ${u.email}  (${u.name})`));
    console.log(`${users.length} account(s).`);
    return;
  }

  const user = await User.findOne({ email: arg.toLowerCase() });
  if (!user) throw new Error(`No account with email ${arg}. Register it first, or check --list.`);
  if (user.role === "admin") return console.log(`${user.email} is already an administrator.`);
  user.role = "admin";
  await user.save();
  console.log(`${user.email} (${user.name}) is now an administrator. Log out and back in, or refresh the page.`);
}

main()
  .catch((err) => {
    console.error("promote-admin failed:", err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
