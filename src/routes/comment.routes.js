import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  addComment,
  addToReply,
  deleteComment,
  deleteReply,
  getVideoComment,
  updateComment,
  updateReply,
} from "../controllers/comment.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

//router.use(authMiddleware, upload.none());
router.route("/:_videoId").post(authMiddleware,addComment);
router.route("/:_commentId").delete(authMiddleware,deleteComment);
router.route("/reply-comment/:_parentCommentId").post(authMiddleware,addToReply);
router.route("/update-comment/:_commentId").patch(authMiddleware,updateComment);
router.route("/reply/:_replyId").patch(authMiddleware,updateReply);
router.route("/reply/:_replyId").delete(authMiddleware,deleteReply);
router.route("/:videoId").get(getVideoComment);

export default router;
