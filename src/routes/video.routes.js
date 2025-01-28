import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  getSearchVideo,
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

export default router;
