const mongoose = require("mongoose");
const { HttpError } = require("./errorHandler");

module.exports = function validateObjectId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return next(new HttpError(400, "Invalid article ID"));
  }
  next();
};
