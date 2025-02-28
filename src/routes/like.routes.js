import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { commentLike, getLikedVideos, tweetLike, videoLike } from "../controllers/like.controller.js";

const router = Router();

router.route("/video/:_videoId").post(authMiddleware, videoLike)
router.route("/comment/:_commentId").post(authMiddleware, commentLike)
router.route("/tweet/:_tweetId").post(authMiddleware, tweetLike)
router.route("/videos").get(getLikedVideos)

export default router;   