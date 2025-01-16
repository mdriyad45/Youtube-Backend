import { Router } from "express";
import {
  loginUser,
  registerUser,
  logout,
  refreshAccessToken,
  changeCurrentPassword,
  getUser,
  updateAccountDetails
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);
router.route("/login").post(loginUser);

//secure route

router.route("/logout").get(authMiddleware, logout);
router.route("/refresh-token").get(authMiddleware, refreshAccessToken);
router.route("/forget-password").post(authMiddleware, changeCurrentPassword);
router.route("/getUser").get(authMiddleware, getUser);
router.route("/update-account").post(authMiddleware, updateAccountDetails);

export default router;
