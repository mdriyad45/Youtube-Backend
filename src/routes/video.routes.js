import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  deleteVideo,
  getSearchVideo,
  updateVideo,
  uploadVideo,
} from "../controllers/video.controller.js";

const router = Router();

//router.use(authMiddleware);
router.route("/").get(getSearchVideo);
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
  uploadVideo
);
router.route('/delete-video/:_id').get(deleteVideo);
router.route('/update-video/:_id').put(upload.single('thumbnail'),updateVideo)

export default router;
