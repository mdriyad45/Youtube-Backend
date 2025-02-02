import { Router } from "express";
import {
  createPlaylist,
  deletePlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create-playlist").post(authMiddleware, createPlaylist);
router
  .route("/update-playlist/:_playlistId")
  .post(authMiddleware, updatePlaylist);
router
  .route("/delete-playlist/:_playlistId")
  .delete(authMiddleware, deletePlaylist);

export default router;
