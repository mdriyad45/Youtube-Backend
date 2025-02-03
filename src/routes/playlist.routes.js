import { Router } from "express";
import {
  createPlaylist,
  deletePlaylist,
  updatePlaylist,
  getPlaylistById
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

router.route('/playlist/:_playlistId').get(authMiddleware, getPlaylistById)

export default router;
