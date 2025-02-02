import { Router } from "express";
import {
  createPlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create-playlist").post(authMiddleware, createPlaylist);
router
  .route("/update-playlist/:_playlistId")
  .post(authMiddleware, updatePlaylist);

export default router;
