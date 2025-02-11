import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  addComment,
  addToReply,
  deleteComment,
  updateComment,
} from "../controllers/comment.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.use(authMiddleware, upload.none());
router.route("/:_videoId").post(addComment);
router.route("/:_commentId").delete(deleteComment);
router.route("/reply-comment/:_parentCommentId").post(addToReply);
router.route("/update-comment/:_commentId").patch(updateComment);

export default router;
