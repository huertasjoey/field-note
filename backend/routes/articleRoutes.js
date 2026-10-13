const router = require("express").Router();
const ctrl = require("../controllers/articleController");
const validateObjectId = require("../middleware/validateObjectId");
const { requireAuth, requireAdmin } = require("../middleware/auth");

// The whole site requires login: reads need any signed-in user; every write (create, edit, delete, set featured) is admin-only.
router.get("/", requireAuth, ctrl.listArticles);
router.get("/featured", requireAuth, ctrl.getFeatured); // must come before "/:id"
router.post("/", requireAdmin, ctrl.createArticle);
router.get("/:id", requireAuth, ctrl.getArticle);
router.put("/:id", requireAdmin, validateObjectId, ctrl.updateArticle);
router.delete("/:id", requireAdmin, validateObjectId, ctrl.deleteArticle);

module.exports = router;
