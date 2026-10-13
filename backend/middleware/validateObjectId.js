import mongoose from "mongoose";
import { HttpError } from "./errorHandler.js";

export default function validateObjectId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return next(new HttpError(400, "Invalid article ID"));
  }
  next();
};
