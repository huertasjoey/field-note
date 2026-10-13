const { requireAuth } = require("../middleware/auth");
const router = require("express").Router();
const { subscribe } = require("../controllers/newsletterController");

router.post("/subscribe", requireAuth, subscribe);

module.exports = router;
