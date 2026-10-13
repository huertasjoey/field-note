const { requireAuth } = require("../middleware/auth");
const router = require("express").Router();
const { subscribe } = require("../controllers/newsletterController");

router.post("/subscribe", requireAuth, subscribe);

module.exports = router;

app.use(express.static(frontendPath));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

module.exports = router;