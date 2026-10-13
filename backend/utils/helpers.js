import Article from "../models/Article.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function slugify(text) {
  return (
    String(text)
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "article"
  );
}

// Returns a slug no other article uses (appends -2, -3, ... when needed).
async function uniqueSlug(title, excludeId) {
  const base = slugify(title);
  let slug = base;
  let n = 2;
  const taken = (s) => {
    const query = { slug: s };
    if (excludeId) query._id = { $ne: excludeId };
    return Article.exists(query);
  };
  while (await taken(slug)) slug = `${base}-${n++}`;
  return slug;
}

function estimateReadTime(content) {
  const words = String(content).trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function isHttpUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function escapeRegex(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export { EMAIL_RE, slugify, uniqueSlug, estimateReadTime, isHttpUrl, escapeRegex };
