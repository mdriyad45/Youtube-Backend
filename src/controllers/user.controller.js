import { User } from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import fs from "fs";

const registerUser = async (req, res) => {
  try {
    /**
     *get user data form body
     *validate user data: not empty
     *check if user exist
     *check for image, check for avatar
     *upload image to cloudinary for avatar
     * create user object
     * remove password and refresh token field response
     * check for user creation
     * response
     */

    const { username, email, fullname, password } = req.body;
    if (
      [username, email, fullname, password].some(
        (field) => field?.trim() === ""
      )
    ) {
      throw new apiError(400, "All field required");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new apiError(400, "Invalid email format");
    }

    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser) {
      if (existingUser.username) {
        throw new apiError(400, "username already exist");
      }
      if (existingUser.email) {
        throw new apiError(400, "email already exist");
      }
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;

    if (!avatarLocalPath) {
      throw new apiError(400, "avatar file is required");
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (avatar.secure_url) {
      fs.unlinkSync(avatarLocalPath);
    }

    const user = await User.create({
      fullname,
      email,
      password,
      username: username.toLowerCase(),
      avatar: avatar.secure_url,
    });
    console.log("User:", user);
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );
    console.log("CreateUser", createdUser);
    res.status(200).json({
      message: "Create user successfully",
      data: createdUser,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
};

export default registerUser;
