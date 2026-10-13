import mongoose from "mongoose";
import Article, { CATEGORIES } from "../models/Article.js";
import { HttpError } from "../middleware/errorHandler.js";
import { uniqueSlug, estimateReadTime, isHttpUrl, escapeRegex } from "../utils/helpers.js";

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Checks the body and returns cleaned fields. `partial` skips required checks (for PUT).
function validateArticle(body, partial = false) {
  const errors = [];
  const out = {};
  const text = (key, label, max) => {
    if (body[key] === undefined) {
      if (!partial) errors.push(`${label} is required`);
      return;
    }
    const v = String(body[key]).trim();
    if (!v) errors.push(`${label} is required`);
    else if (max && v.length > max) errors.push(`${label} must be at most ${max} characters`);
    else out[key] = v;
  };
  text("title", "Title", 160);
  text("excerpt", "Excerpt", 400);
  text("content", "Content");
  text("author", "Author", 80);
  text("category", "Category");
  text("image", "Image URL");
  if (out.category && !CATEGORIES.includes(out.category)) {
    errors.push(`Category must be one of: ${CATEGORIES.join(", ")}`);
  }
  if (out.image && !isHttpUrl(out.image)) errors.push("Image must be a valid http(s) URL");
  if (body.featured !== undefined) out.featured = body.featured === true || body.featured === "true";
  if (errors.length) throw new HttpError(400, "Validation failed", errors);
  return out;
}

// Only one article may be featured at a time.
async function clearOtherFeatured(exceptId) {
  await Article.updateMany({ featured: true, _id: { $ne: exceptId } }, { featured: false });
}

export const listArticles = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));
  const filter = {};

  const { category, search } = req.query;
  if (category && category !== "All") {
    const match = CATEGORIES.find((c) => c.toLowerCase() === String(category).toLowerCase());
    if (!match) throw new HttpError(400, `Unknown category. Use one of: ${CATEGORIES.join(", ")}`);
    filter.category = match;
  }
  if (search && String(search).trim()) {
    const rx = new RegExp(escapeRegex(String(search).trim().slice(0, 100)), "i");
    filter.$or = [{ title: rx }, { excerpt: rx }, { content: rx }];
  }

  const [articles, total] = await Promise.all([
    Article.find(filter)
      .select("-content")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Article.countDocuments(filter),
  ]);
  res.json({ articles, page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) });
});

export const getFeatured = asyncHandler(async (req, res) => {
  const article =
    (await Article.findOne({ featured: true }).lean()) ||
    (await Article.findOne().sort({ createdAt: -1 }).lean());
  if (!article) throw new HttpError(404, "No articles found");
  res.json(article);
});

// Accepts either a MongoDB ObjectId or a slug
export const getArticle = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const article = mongoose.isValidObjectId(id)
    ? await Article.findById(id).lean()
    : await Article.findOne({ slug: id.toLowerCase() }).lean();
  if (!article) throw new HttpError(404, "Article not found");
  res.json(article);
});

export const createArticle = asyncHandler(async (req, res) => {
  const data = validateArticle(req.body || {});
  data.slug = await uniqueSlug(data.title);
  data.readTime = estimateReadTime(data.content);
  const article = await Article.create(data);
  if (article.featured) await clearOtherFeatured(article._id);
  res.status(201).json(article);
});

export const updateArticle = asyncHandler(async (req, res) => {
  const data = validateArticle(req.body || {}, true);
  const article = await Article.findById(req.params.id);
  if (!article) throw new HttpError(404, "Article not found");

  if (data.title && data.title !== article.title) article.slug = await uniqueSlug(data.title, article._id);
  Object.assign(article, data);
  if (data.content) article.readTime = estimateReadTime(data.content);
  await article.save();
  if (article.featured) await clearOtherFeatured(article._id);
  res.json(article);
});

export const deleteArticle = asyncHandler(async (req, res) => {
  const article = await Article.findByIdAndDelete(req.params.id);
  if (!article) throw new HttpError(404, "Article not found");
  res.json({ message: "Article deleted", id: article._id });
});
