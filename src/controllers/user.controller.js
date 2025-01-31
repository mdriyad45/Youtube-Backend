import { User } from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/cloudinary.js";
import fs from "fs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

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
    const avatar = await uploadOnCloudinary(avatarLocalPath, {
      resource_type: "image",
      folder: "avatarImages/",
    });
    if (avatar.secure_url) {
      fs.unlinkSync(avatarLocalPath);
    }

    //coverImage part
    let coverImage_url = "";
    if (req.files?.coverImage?.length > 0) {
      const coverImagePath = req.files.coverImage[0].path;
      const coverImage = await uploadOnCloudinary(coverImagePath, {
        resource_type: "image",
        folder: "coverImages/",
      });

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

export const changeCurrentPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!(oldPassword, newPassword)) {
      throw new apiError(400, "oldPassword or newPassword not found");
    }
    const user = await User.findById(req.user?._id);

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
      throw new apiError(400, "Old password is incorrect");
    }
    user.password = newPassword;
    await user.save({ validBeforeSave: true });

    return res.status(200).json({
      message: "password change successfully",
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

export const getUser = async (req, res) => {
  res.status(200).json({
    message: "user get successfully",
    data: req.user,
    success: true,
    error: false,
  });
};

export const updateAccountDetails = async (req, res) => {
  try {
    const { name, fullname } = req.body;

    if (!(email, fullname)) {
      throw new apiError(400, "All fields are required");
    }

    const user = await User.findByIdAndUpdate(
      {
        $set: {
          fullname,
          email: email,
        },
      },
      { new: true }
    ).select("-passwordd -refreshToken");

    res.status(200).json({
      message: "Account details updated successfully",
      data: user,
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

export const updateUserAvatar = async (req, res) => {
  try {
    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) {
      throw new apiError(400, "Avatar file is missing");
    }
    const updateAvatar = await uploadOnCloudinary(avatarLocalPath, {
      resource_type: "image",
      folder: "avatarImages/",
    });
    if (!updateAvatar.secure_url) {
      throw new apiError(400, "Error while uploading on avatar");
    }
    if (updateAvatar.secure_url) {
      fs.unlinkSync(avatarLocalPath);
      const { avatar } = await User.findById(req.user?._id).select(
        "-password -username -email -refreshToken -fullname -coverImage"
      );
      const deleteImage = await deleteOnCloudinary(avatar, {
        resource_type: "image",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          avatar: updateAvatar.secure_url,
        },
      },
      { new: true }
    ).select("-password");

    res.status(200).json({
      messgae: "Avatar image updated successfully",
      data: user,
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

export const updateUserCoverImage = async (req, res) => {
  try {
    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
      throw new apiError(400, "CoverImage file is missing");
    }
    const updateCoverImage = await uploadOnCloudinary(coverImageLocalPath, {
      resource_type: "image",
      folder: "coverImages/",
    });
    if (!updateCoverImage.secure_url) {
      throw new apiError(400, "Error while uploading on avatar");
    }
    if (updateCoverImage.secure_url) {
      fs.unlinkSync(coverImageLocalPath);
      const { coverImage } = await User.findById(req.user?._id).select(
        "-password -username -email -refreshToken -fullname -avatar"
      );
      const deleteImage = await deleteOnCloudinary(coverImage, {
        resource_type: "image",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          coverImage: updateCoverImage.secure_url,
        },
      },
      { new: true }
    ).select("-password");
    res.status(200).json({
      messgae: "Cover image updated successfully",
      data: user,
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

export const deleteUserAccount = async (req, res) => {
  try {
    const userId = req.user?._id;
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      throw new apiError(400, "Error occur when user account is deletting");
    }

    const avatar = await deleteOnCloudinary(user.avatar, {
      resource_type: "image",
    });
    const coverImage = await deleteOnCloudinary(user.coverImage, {
      resource_type: "image",
    });

    if (avatar.error || coverImage.error) {
      throw new ApiError(500, "Error while deleting on cloudinary");
    }
    return res.status(200).json({
      message: "Account deleted",
      data: {},
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

export const getUserChannelProfile = async (req, res) => {
  try {
    const { username } = req.params;
    if (!username.trim()) {
      throw new apiError(400, "username required");
    }
    const channel = await User.aggregate([
      {
        $match: {
          username: username?.toLowerCase(),
        },
      },
      {
        $lookup: {
          from: "Subscription",
          localField: "_id",
          foreignField: "channel",
          as: "subscribers",
        },
      },
      {
        $lookup: {
          from: "Subscription",
          localField: "_id",
          foreignField: "subscriber",
          as: "subscribedTo",
        },
      },
      {
        $addFields: {
          subscribersCount: {
            $size: {
              $ifNull: ["$subscribes", []], // Ensure `subscribes` is always an array
            },
          },
          channelSubscribedToCount: {
            $size: {
              $ifNull: ["$subscriber", []], // Ensure `subscriber` is always an array for counting
            },
          },
          isSubscribed: {
            $cond: {
              if: {
                $in: [
                  req.user?._id,
                  { $ifNull: ["$subscriber", []] }, // Ensure `subscriber` is always an array
                ],
              },
              then: true,
              else: false,
            },
          },
        },
      },
    ]);
    console.log(channel);
    res.status(200).json({
      message: "channel count",
      data: channel,
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

export const getWatchHistory = async (req, res) => {
  try {
    const user = await User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.user._id),
        },
      },
      {
        $lookup: {
          from: "Video",
          localField: "watchHistory",
          foreignField: "_id",
          as: "watchHistory",
          pipeline: [
            {
              $lookup: {
                from: "User",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                  {
                    $project: {
                      fullName: 1,
                      username: 1,
                      avatar: 1,
                    },
                  },
                ],
              },
            },
            {
              $addFields: {
                owner: {
                  $first: "$owner",
                },
              },
            },
          ],
        },
      },
      {
        $project: {
          fullname: 1,
          username: 1,
          avatar: 1,
          watchHistory: 1,
        },
      },
    ]);
    console.log(user);
    res.status(200).json({
      message: "Watch history fetched successfully",
      data: user[0].watchHistory,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
};
