import mongoose from "mongoose";

export const CATEGORIES = ["Culture", "Places", "Ideas", "Lifestyle", "Technology", "Stories"];

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt: { type: String, required: true, trim: true, maxlength: 400 },
    content: { type: String, required: true, trim: true },
    category: { type: String, required: true, enum: CATEGORIES },
    image: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true, maxlength: 80 },
    readTime: { type: Number, required: true, min: 1, default: 1 },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

articleSchema.index({ createdAt: -1 });

export default mongoose.model("Article", articleSchema);
