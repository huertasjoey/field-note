const router = require("express").Router();
const ctrl = require("../controllers/articleController");
const validateObjectId = require("../middleware/validateObjectId");

router.get("/", ctrl.listArticles);
router.get("/featured", ctrl.getFeatured); // must come before "/:id"
router.post("/", ctrl.createArticle);
router.get("/:id", ctrl.getArticle);
router.put("/:id", validateObjectId, ctrl.updateArticle);
router.delete("/:id", validateObjectId, ctrl.deleteArticle);

module.exports = router;
