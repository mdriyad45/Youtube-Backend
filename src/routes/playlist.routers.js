import { Router } from "express";
import { createPlaylist } from "../controllers/playlist.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

Router.route("/create-playlist").post(authMiddleware, createPlaylist);

export default router;
