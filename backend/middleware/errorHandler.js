class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let status = err.status || 500;
  let message = err.message || "Server error";
  let details = err.details;

  if (err.type === "entity.parse.failed") {
    status = 400;
    message = "Request body contains invalid JSON";
  } else if (err.name === "ValidationError" && err.errors) {
    status = 400;
    message = "Validation failed";
    details = Object.values(err.errors).map((e) => e.message);
  } else if (err.name === "CastError") {
    status = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  } else if (err.code === 11000) {
    status = 409;
    message = "A record with that value already exists";
  }

  if (status >= 500) {
    console.error(err);
    message = "Internal server error";
    details = undefined;
  }
  res.status(status).json({ message, ...(details ? { details } : {}) });
}

module.exports = { HttpError, notFound, errorHandler };
