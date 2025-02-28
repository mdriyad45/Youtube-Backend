import { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { apiError } from "../utils/apiError.js";

export const videoLike = async (req, res) => {
  try {
    const { _videoId } = req.params;
    const userId = req.user?._id;

    if (!isValidObjectId(_videoId)) {
      throw new apiError(400, "Invalid video ID");
    }

    // Attempt to remove a like if it exists
    const deletedLike = await Like.findOneAndDelete({
      likedBy: userId,
      video: _videoId,
    });

    if (deletedLike) {
      return res.status(200).json({
        message: "Video like removed successfully",
        data: [],
        success: true,
        error: false,
      });
    }

    // Create a like if none was found to delete
    const like = await Like.create({
      likedBy: userId,
      video: _videoId,
    });

    if (!like) {
      throw new apiError(400, "Error while creating like");
    }

    return res.status(200).json({
      message: "Video liked successfully",
      data: [],
      success: true,
      error: false,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
};

export const commentLike = async (req, res) => {
  try {
    const { _commentId } = req.params;
    const userId = req.user?._id;

    if (!isValidObjectId(_commentId)) {
      throw new apiError(400, "Invalid comment ID");
    }

    const deletedLike = await Like.findOneAndDelete({
      likedBy: userId,
      comment: _commentId,
    });

    if (deletedLike) {
      return res.status(200).json({
        message: "comment like removed successfully",
        data: [],
        success: true,
        error: false,
      });
    }

    const like = await Like.create({
      likedBy: userId,
      comment: _commentId,
    });

    if (!like) {
      throw new apiError(400, "Error while creating like");
    }

    return res.status(200).json({
      message: "comment liked successfully",
      data: [],
      success: true,
      error: false,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
};

export const tweetLike = async (req, res) => {
    try {
      const { _tweetId } = req.params;
      const userId = req.user?._id;
  
      if (!isValidObjectId(_tweetId)) {
        throw new apiError(400, "Invalid tweet ID");
      }
  
      const deletedLike = await Like.findOneAndDelete({
        likedBy: userId,
        tweet: _tweetId,
      });
  
      if (deletedLike) {
        return res.status(200).json({
          message: "tweet like removed successfully",
          data: [],
          success: true,
          error: false,
        });
      }
  
      const like = await Like.create({
        likedBy: userId,
        tweet: _tweetId,
      });
  
      if (!like) {
        throw new apiError(400, "Error while creating like");
      }
  
      return res.status(200).json({
        message: "tweet liked successfully",
        data: [],
        success: true,
        error: false,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        message: error.message,
        success: false,
        error: true,
      });
    }
  };

  export const getLikedVideos = async (req, res) => {
    try {
      const { page = 1, limit = 10, sort = "desc" } = req.query; // Pagination and sorting from query params
      const skip = (page - 1) * limit;
  
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
        {
          $sort: {
            createdAt: sort === "asc" ? 1 : -1, // Sort by creation date
          },
        },
        {
          $skip: skip, // Pagination: skip first (page - 1) * limit items
        },
        {
          $limit: parseInt(limit), // Limit the number of results
        },
      ]);
  
      const totalVideos = await Like.countDocuments({
        likedBy: req.user?._id,
        video: { $exists: true },
      });
  
      if (videos.length < 1) {
        return res.status(404).json({
          message: "User has not liked any videos yet",
          data: [],
          success: true,
          error: false,
        });
      }
  
      return res.status(200).json({
        message: "Liked videos fetched successfully",
        data: videos,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalVideos / limit),
          totalVideos,
        },
        success: true,
        error: false,
      });
  
    } catch (error) {
      console.error(error);
      return res.status(400).json({
        message: error.message || "Failed to fetch liked videos",
        success: false,
        error: true,
      });
    }
  };
