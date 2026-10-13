const mongoose = require("mongoose");

// Server-side session. Only a SHA-256 hash of the cookie token is stored, so a database leak
// cannot be used to hijack sessions. Deleting the row (logout) invalidates the session.
const sessionSchema = new mongoose.Schema({
  tokenHash: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  csrfToken: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } }, // TTL: Mongo removes expired rows
});

module.exports = mongoose.model("Session", sessionSchema);
