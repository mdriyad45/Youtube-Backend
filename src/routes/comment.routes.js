import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { addComment } from "../controllers/comment.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.use(authMiddleware, upload.none());
router.route('/:_videoId').post(addComment)


export default router;