import { requireAuth } from "../middleware/auth.js";
import express from "express";
const router = express.Router();
import { subscribe } from "../controllers/newsletterController.js";

router.post("/subscribe", requireAuth, subscribe);

export default router;
