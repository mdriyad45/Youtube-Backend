import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  deleteVideo,
  getSearchVideo,
  getVideoById,
  updateVideo,
  uploadVideo,
} from "../controllers/video.controller.js";

const router = Router();

//router.use(authMiddleware);
router.route("/").get(authMiddleware, getSearchVideo);
router.route("/upload-video").post(
  upload.fields([
    {
      name: "video",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  authMiddleware,
  uploadVideo
);
router.route("/delete-video/:_id").get(authMiddleware, deleteVideo);
router
  .route("/update-video/:_id")
  .put(upload.single("thumbnail"), authMiddleware, updateVideo);
router.route("/:_id").get(authMiddleware, getVideoById);

export default router;
