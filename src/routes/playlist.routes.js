import { Router } from "express";
import {
  createPlaylist,
  deletePlaylist,
  updatePlaylist,
  addVideoToPlaylist,
  getPlaylistById,
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

router.route("/:_playlistId").get(authMiddleware, getPlaylistById);
router
  .route("/add-video/:videoId/:playlistId")
  .patch(authMiddleware, addVideoToPlaylist);

export default router;
