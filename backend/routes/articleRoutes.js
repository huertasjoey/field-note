import express from "express";
const router = express.Router();
import * as ctrl from "../controllers/articleController.js";
import validateObjectId from "../middleware/validateObjectId.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

// The whole site requires login: reads need any signed-in user; every write (create, edit, delete, set featured) is admin-only.
router.get("/", requireAuth, ctrl.listArticles);
router.get("/featured", requireAuth, ctrl.getFeatured); // must come before "/:id"
router.post("/", requireAdmin, ctrl.createArticle);
router.get("/:id", requireAuth, ctrl.getArticle);
router.put("/:id", requireAdmin, validateObjectId, ctrl.updateArticle);
router.delete("/:id", requireAdmin, validateObjectId, ctrl.deleteArticle);

export default router;
