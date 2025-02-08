import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  addComment,
  deleteComment,
} from "../controllers/comment.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.use(authMiddleware, upload.none());
router.route("/:_videoId").post(addComment);
router.route("/:_commentId").delete(deleteComment);

export default router;
