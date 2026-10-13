import crypto from "crypto";
import Session from "../models/Session.js";
import { HttpError } from "./errorHandler.js";

const COOKIE_NAME = "fieldnote_sid";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
const REMEMBER_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const hashToken = (t) => crypto.createHash("sha256").update(t).digest("hex");

function cookieOptions(maxAge) {
  const isProd = process.env.NODE_ENV === "production";
  // Use COOKIE_SAMESITE=none only when the frontend and API are on different sites (requires HTTPS).
  const sameSite = (process.env.COOKIE_SAMESITE || "lax").toLowerCase();
  return {
    httpOnly: true,
    secure: isProd || sameSite === "none",
    sameSite,
    path: "/",
    ...(maxAge ? { maxAge } : {}), // no maxAge => browser-session cookie
  };
}

async function createSession(res, user, remember) {
  const token = crypto.randomBytes(32).toString("base64url");
  const csrfToken = crypto.randomBytes(24).toString("base64url");
  const ttl = remember ? REMEMBER_TTL_MS : SESSION_TTL_MS;
  await Session.create({ tokenHash: hashToken(token), user: user._id, csrfToken, expiresAt: new Date(Date.now() + ttl) });
  res.cookie(COOKIE_NAME, token, cookieOptions(remember ? REMEMBER_TTL_MS : undefined));
  return csrfToken;
}

function clearSessionCookie(res) {
  res.clearCookie(COOKIE_NAME, cookieOptions());
}

// Attaches req.user / req.session when a valid session cookie is present. Never rejects.
async function loadSession(req, res, next) {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (typeof token !== "string" || !token) return next();
    const session = await Session.findOne({ tokenHash: hashToken(token), expiresAt: { $gt: new Date() } }).populate("user");
    if (session?.user) {
      req.session = session;
      req.user = session.user;
    } else if (session) {
      await session.deleteOne(); // user was deleted
    }
    next();
  } catch (err) {
    next(err);
  }
}

function requireAuth(req, res, next) {
  if (!req.user) return next(new HttpError(401, "Please log in to continue"));
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user) return next(new HttpError(401, "Please log in to continue"));
  if (req.user.role !== "admin") return next(new HttpError(403, "You do not have permission to do that"));
  next();
}

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

// CSRF defence for cookie auth: (1) Origin must be an allowed frontend origin when present,
// (2) authenticated unsafe requests must echo the per-session token in X-CSRF-Token.
function csrfProtection(allowedOrigins) {
  return (req, res, next) => {
    if (SAFE_METHODS.has(req.method)) return next();
    const origin = req.get("origin");
    let sameHost = false;
    try {
      sameHost = !!origin && new URL(origin).host === req.get("host"); // site served by this same service
    } catch {
      // malformed Origin => not allowed
    }
    if (origin && !sameHost && !allowedOrigins.includes(origin)) return next(new HttpError(403, "Request origin not allowed"));
    if (req.session) {
      const a = Buffer.from(req.get("x-csrf-token") || "");
      const b = Buffer.from(req.session.csrfToken);
      if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
        return next(new HttpError(403, "Invalid or missing CSRF token. Refresh the page and try again."));
      }
    }
    next();
  };
}

export { COOKIE_NAME, createSession, clearSessionCookie, loadSession, requireAuth, requireAdmin, csrfProtection };
