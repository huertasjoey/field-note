const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const ctrl = require("../controllers/authController");

const limiter = (max) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many attempts. Please wait a few minutes and try again." },
  });

router.post("/register", limiter(20), ctrl.register);
router.post("/login", limiter(10), ctrl.login);
router.post("/logout", ctrl.logout);
router.get("/me", ctrl.me);

module.exports = router;
