import { User } from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import fs from "fs";
import jwt from 'jsonwebtoken'

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();

    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new apiError(
      500,
      "Something went wrong while generate refresh and access token"
    );
  }
};
export const registerUser = async (req, res) => {
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

    // avatar part
    const avatarLocalPath = req.files?.avatar[0]?.path;
    if (!avatarLocalPath) {
      throw new apiError(400, "avatar file is required");
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (avatar.secure_url) {
      fs.unlinkSync(avatarLocalPath);
    }

    //coverImage part
    let coverImage_url = "";
    if (req.files?.coverImage?.length > 0) {
      const coverImagePath = req.files.coverImage[0].path;
      const coverImage = await uploadOnCloudinary(coverImagePath);

      if (coverImage?.secure_url) {
        coverImage_url = coverImage.secure_url;
        fs.unlinkSync(coverImagePath);
      }
    }

    const user = await User.create({
      fullname,
      email,
      password,
      username: username.toLowerCase(),
      avatar: avatar.secure_url,
      coverImage: coverImage_url,
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    res.status(201).json({
      message: "Created user successfully",
      data: createdUser,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!(username || email)) {
      throw new apiError(400, "username or email must require");
    }
    const user = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (!user) {
      throw new apiError(400, "user not exist");
    }
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      throw new apiError(400, "Invalid user credentials");
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        message: "user logged in successfully",
        data: { loggedInUser, accessToken, refreshToken },
        success: true,
        error: false,
      });
  } catch (error) {
    res.status(400).json({
      message: error.message || "login failed",
      success: false,
      error: true,
    });
  }
};

export const logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user_id,
      {
        $unset: {
          refreshToken: 1, // this remove the field from document
        },
      },
      {
        new: true,
      }
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json({
        message: "User logged Out successfully",
        success: true,
        error: false,
      });
  } catch (error) {
    res.status(400).json({
      message: error.message,
      success: true,
      error: false,
    });
  }
};

export const refreshAccessToken = async (req, res) => {
  const incommingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incommingRefreshToken) {
    throw new apiError(401, "unauthorized reques");
  }
  try {
    const decodeToken = jwt.verify(
      incommingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodeToken?._id).select("-password");
    if (!user) {
      throw new apiError(401, "invalid refresh Token");
    }
    if (incommingRefreshToken !== user.refreshToken) {
      throw new apiError(401, "Refresh token is expired or ussed");
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    res
      .status(200)
      .cookie("accessToken", accessToken)
      .cookie("refreshToken", refreshToken)
      .json({
        message: "access token refresh",
        data: { accessToken, refreshToken },
        success: true,
        error: false,
      });
  } catch (error) {
    res.status(400).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
};

export const changeCurrentPassword = async (req, res)=>{
  try {
    const {oldPassword, newPassword} = req.body;
    if(!(oldPassword, newPassword)){
      throw new apiError(400, "oldPassword or newPassword not found");
    }
    const user = await User.findById(req.user?._id);

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    user.password = newPassword;
    await user.save({validBeforeSave: true});

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))

  } catch (error) {
    res.status(400).json({
      message: error.message,
      success: false,
      error:true
    })
  }
}
