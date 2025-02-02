import { Router } from "express";
import { createPlaylist } from "../controllers/playlist.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create-playlist").post(authMiddleware, createPlaylist);

export default router;
