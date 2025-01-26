import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { getSearchVideo } from "../controllers/video.controller.js";

const router = Router();

//router.use(authMiddleware);
router.route('/').get( getSearchVideo)


export default router;