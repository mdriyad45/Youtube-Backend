import { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model";
import { apiError } from "../utils/apiError";

const videoLike = async (req, res) => {
  try {
    const { _videoId } = req.params;
    const userId = req.user?._id;

    if (!isValidObjectId(_videoId)) {
      throw new apiError(400, "Invalid video id");
    }

    const deletedLike = await Like.findByIdAndDelete({
      likeBy: userId,
      video: _videoId,
    });

    if (!deletedLike) {
      const like = await Like.create({
        likeBy: userId,
        video: _videoId,
      });

      console.log(like);
      if (!like) {
        throw new apiError(400, "Error while creating like");
      }
    }

    res.status(200).json({
      message: "create video like successfully",
      data: [],
      success: true,
      error: false,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
};

const commentLike = async (req, res) => {
  try {
    const { _commentId } = req.params;
    const userId = req.user?._id;

    if (!isValidObjectId(_videoId)) {
      throw new apiError(400, "Invalid comment id");
    }

    const deletedLike = await Like.findByIdAndDelete({
      likeBy: userId,
      video: _commentId,
    });

    if (!deletedLike) {
      const like = await Like.create({
        likeBy: userId,
        video: _commentId,
      });

      console.log(like);
      if (!like) {
        throw new apiError(400, "Error while creating like");
      }
    }

    res.status(200).json({
      message: "create comment like successfully",
      data: [],
      success: true,
      error: false,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
};

const postLike = async (req, res) => {
  try {
    const { _postId } = req.params;
    const userId = req.user?._id;

    if (!isValidObjectId(_videoId)) {
      throw new apiError(400, "Invalid post id");
    }

    const deletedLike = await Like.findByIdAndDelete({
      likeBy: userId,
      video: _postId,
    });

    if (!deletedLike) {
      const like = await Like.create({
        likeBy: userId,
        video: _postId,
      });

      console.log(like);
      if (!like) {
        throw new apiError(400, "Error while creating like");
      }
    }

    res.status(200).json({
      message: "create post like successfully",
      data: [],
      success: true,
      error: false,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
};

const getLikedVideos = async (req, res) => {
  try {
    const videos = await Like.aggregate([
      {
        $match: {
          likedBy: req.user?._id,
          video: { $exists: true },
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "video",
          foreignField: "_id",
          as: "video",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                  {
                    $project: {
                      username: 1,
                      fullName: 1,
                      avatar: 1,
                    },
                  },
                ],
              },
            },
            {
              $addFields: {
                owner: { $first: "$owner" },
              },
            },
          ],
        },
      },
      {
        $unwind: "$video",
      },
      {
        $replaceRoot: {
          newRoot: "$video",
        },
      },
    ]);

    if (videos.length < 1) {
      throw new apiError(400, "User has not liked any videos yet");
    }

    res.status(200).json({
      message: "Liked video fetch successfully",
      data: videos,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error(error);
    res.status(200).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
};
