import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Session from "../models/Session.js";
import { HttpError } from "../middleware/errorHandler.js";
import { createSession, clearSessionCookie } from "../middleware/auth.js";
import { EMAIL_RE } from "../utils/helpers.js";

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const BCRYPT_ROUNDS = 12;
// Compared against when the email is unknown so response time doesn't reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", BCRYPT_ROUNDS);

function passwordProblems(password) {
  const p = [];
  if (password.length < 8) p.push("Password must be at least 8 characters");
  if (password.length > 72) p.push("Password must be at most 72 characters"); // bcrypt limit
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) p.push("Password must include upper and lower case letters");
  if (!/\d/.test(password)) p.push("Password must include a number");
  return p;
}

const str = (v) => (typeof v === "string" ? v : "");

export const validatePassword = passwordProblems;

export const register = asyncHandler(async (req, res) => {
  const name = str(req.body?.name).trim();
  const email = str(req.body?.email).trim().toLowerCase();
  const password = str(req.body?.password);
  const errors = [];
  if (!name) errors.push("Name is required");
  else if (name.length > 80) errors.push("Name must be at most 80 characters");
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) errors.push("Please enter a valid email address");
  errors.push(...passwordProblems(password));
  if (errors.length) throw new HttpError(400, "Validation failed", errors);

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  let user;
  try {
    // Role is set server-side and never read from the request body.
    user = await User.create({ name, email, passwordHash, role: "user" });
  } catch (err) {
    if (err.code === 11000) throw new HttpError(409, "An account with that email already exists");
    throw err;
  }
  const csrfToken = await createSession(res, user, false);
  res.status(201).json({ user: user.toPublic(), csrfToken });
});

export const login = asyncHandler(async (req, res) => {
  const email = str(req.body?.email).trim().toLowerCase();
  const password = str(req.body?.password);
  if (!email || !password) throw new HttpError(400, "Email and password are required");

  const user = await User.findOne({ email }).select("+passwordHash");
  const ok = await bcrypt.compare(password, user ? user.passwordHash : DUMMY_HASH);
  if (!user || !ok) throw new HttpError(401, "Incorrect email or password");

  const csrfToken = await createSession(res, user, req.body?.remember === true);
  res.json({ user: user.toPublic(), csrfToken });
});

export const logout = asyncHandler(async (req, res) => {
  if (req.session) await Session.deleteOne({ _id: req.session._id });
  clearSessionCookie(res);
  res.json({ message: "Logged out" });
});

export const me = (req, res) => {
  if (!req.user) return res.json({ user: null });
  res.json({ user: req.user.toPublic(), csrfToken: req.session.csrfToken });
};
