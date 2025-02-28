import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { commentLike, getLikedVideos, postLike, videoLike } from "../controllers/like.controller";

const router = Router();

router.route("/:_videoId").post(authMiddleware, videoLike)
router.route("/:_commentId").post(authMiddleware, commentLike)
router.route("/:_postId").post(authMiddleware, postLike)
router.route("/videos").get(getLikedVideos)

export default router;