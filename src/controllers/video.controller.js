import { error } from "console";
import { Video } from "../models/videos.model.js";
import { apiError } from "../utils/apiError.js";
import {
  deleteOnCloudinaryByPublicId,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import fs from "fs";
import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { User } from "../models/user.model.js";
// get all videos based on query, sort, pagination, view , duration

export const getSearchVideo = async (req, res) => {
  try {
    const { query, autocomplete, category, tags, sortBy, limit, skip } =
      req.query;

    const pipeline = [];
    //AutoComplete with fuzzy search
    if (autocomplete === true) {
      pipeline.push({
        $search: {
          index: "videoSearch",
          autocomplete: {
            query: query,
            path: ["title", "description", "category", "tags"],
            tokenOrder: "sequential",
            fuzzy: {
              maxEdit: 2, // Number of character changes allowed,
              prefixLength: 1, // Number of characters at the start that must match exactly
              maxExpansion: 100, // : Limits the number of variations MongoDB generates for the fuzzy match.
            },
          },
        },
      });
    } else {
      const compoundQuery = { must: [], should: [], filter: [] };

      if (query) {
        compoundQuery.must.push({
          text: {
            query: query,
            path: ["title", "description", "category", "tags"],
          },
        });
      }
      //filter by categary
      // Boost relevance for matches in this category
      if (category) {
        compoundQuery.should.push({
          text: {
            query: category,
            path: "category",
            score: { boost: { value: 3 } },
          },
        });
      }

      if (tags) {
        compoundQuery.filter.push({
          text: {
            query: tags.split(","),
            path: "tags",
          },
        });
      }

      pipeline.push({
        $search: {
          index: "videoSearch",
          compound: compoundQuery,
        },
      });
    }

    //sorting
    if (sortBy) {
      pipeline.push({
        $sort: {
          [sortBy]: -1,
        },
      });
    }

    const resultsLimit = parseInt(limit) || 10;
    const resultSkip = parseInt(skip) || 0;
    pipeline.push({ $limit: resultsLimit });
    pipeline.push({ $skip: resultSkip });

    const videos = await Video.aggregate(pipeline);

    res.status(200).json({
      message: "get search",
      dataLength: videos.length,
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

export const uploadVideo = async (req, res) => {
  try {
    const { title, description, category, tags } = req.body;
    const tag = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag !== "");

    if ([title, description].some((field) => field?.trim() === "")) {
      throw new apiError(400, "title and description field must required");
    }

    const videoLocalPath = req.files?.video[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

    if (!videoLocalPath) {
      throw new apiError(400, "videoLocalPath is required");
    }
    const uploadVideo = await uploadOnCloudinary(videoLocalPath);

    if (!uploadVideo) {
      throw new apiError(400, "video file not found");
    }

    if (uploadVideo.secure_url) {
      fs.unlinkSync(videoLocalPath);
    }
    if (!thumbnailLocalPath) {
      throw new apiError(400, "thumbnailLocalPath is required");
    }
    const uploadThumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!uploadThumbnail) {
      throw new apiError(400, "thumbnail not found");
    }
    if (uploadThumbnail.secure_url) {
      fs.unlinkSync(thumbnailLocalPath);
    }

    const video = await Video.create({
      title,
      description,
      category,
      tags: tag,
      duration: uploadVideo.duration,
      videoFile: {
        secure_url: uploadVideo.secure_url,
        public_id: uploadVideo.public_id,
      },
      thumbnailFile: {
        secure_url: uploadThumbnail.secure_url,
        public_id: uploadThumbnail.public_id,
      },
      owner: req.user?._id,
      isPublished: false,
    });

    console.log(video);
    res.status(200).json({
      message: "video upload successfully",
      data: video,
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

//like and comment o delete korte hobe pore
export const deleteVideo = async (req, res) => {
  try {
    const videoId = req.params._id;

    if (!isValidObjectId(videoId)) {
      throw new ApiError(400, "Invalid videoId");
    }
    const video = await Video.findByIdAndDelete(videoId);

    if (!video) {
      throw new apiError(400, "video is not found");
    }
    const videoPublicKey = video.videoFile.public_id;
    const thumbnailPublicKey = video.thumbnailFile.public_id;

    const cloudinaryDeleteVideo = await deleteOnCloudinaryByPublicId(
      videoPublicKey,
      { resource_type: "video" }
    );

    if (!cloudinaryDeleteVideo) {
      throw new apiError(400, "Error for cloudinary delete video ");
    }

    const cloudinaryDeleteThumnail = await deleteOnCloudinaryByPublicId(
      thumbnailPublicKey,
      { resource_type: "image" }
    );

    if (!cloudinaryDeleteThumnail) {
      throw new apiError(400, "Error for cloudinary delete thumnail ");
    }

    res.status(200).json({
      message: "video has been deleted",
      data: video,
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

//update video like title, description, category, tag
export const updateVideo = async (req, res) => {
  try {
    const { title, description, category, tags } = req.body;
    const videoId = req.params._id;
    const thumbnailLocalPath = req.file?.path;

    if (!isValidObjectId(videoId)) {
      throw new apiError(400, "video id not found");
    }

    const video = await Video.findById(videoId);
    if (!video) {
      throw new apiError(400, "Video not found");
    }

    //new thumnail update and old thumnail delete from cloudinary
    const updateThubnail = await uploadOnCloudinary(thumbnailLocalPath, {
      resource_type: "image",
    });

    if (!updateThubnail) {
      throw new apiError(400, "thumbnail upload error from cloudinary");
    }
    console.log(updateThubnail);
    if (updateThubnail.secure_url) {
      fs.unlinkSync(thumbnailLocalPath);
    }

    //old thumnail delete from cloudinary

    const oldThumbnailDelete = await deleteOnCloudinaryByPublicId(
      video.thumbnailFile.public_id,
      { resource_type: "image" }
    );

    if (!oldThumbnailDelete) {
      throw new apiError(400, "Error for old thumbnail delete from cloudinary");
    }

    const updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      {
        $set: {
          title,
          description,
          category,
          tags,
          thumbnailFile: {
            secure_url: updateThubnail.secure_url,
            public_id: updateThubnail.public_id,
          },
        },
      },
      {
        new: true,
      }
    );
    res.status(200).json({
      message: "video updated successfully",
      data: updatedVideo,
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

export const getVideoById = async (req, res) => {
  try {
    const videoId = req.params._id;

    console.log(videoId);
    if (!isValidObjectId(videoId)) {
      throw new apiError(400, "videoId Invalid");
    }
    const userId = req.user?._id;

    if (!isValidObjectId(userId)) {
      throw new apiError(400, "Invalid user");
    }

    const video = await Video.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(videoId) },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "video",
          as: "likes",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
          pipeline: [
            {
              $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers",
              },
            },
            {
              $addFields: {
                subscriberCount: {
                  $size: {
                    $ifNull: ["$subscribers", []],
                  },
                },
                isSubscribe: {
                  $cond: {
                    if: {
                      $in: [req.user?._id, { $ifNull: ["$subscribers", []] }],
                    },
                    then: true,
                    else: false,
                  },
                },
              },
            },
            {
              $project: {
                username: 1,
                "avatar.url": 1,
                subscriberCount: 1,
                isSubscribe: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          likesCount: { $size: "$likes" },
          owner: { $first: "$owner" },
          isLike: {
            $cond: {
              if: {
                $in: [req.user?._id, { $ifNull: ["$likes.likedBy", []] }],
              },
              then: true,
              else: false
            },
          },
        },
      },
      {
        $project: {
          "videoFile.secure_url": 1,
          title: 1,
          description: 1,
          views: 1,
          createdAt: 1,
          duration: 1,
          comments: 1,
          owner: 1,
          likesCount: 1,
          isLiked: 1,
        },
      },
    ]);

    if (!video) {
      throw new apiError(400, "fail to video fetch");
    }

    await Video.findByIdAndUpdate(videoId, {
      $inc: {
        views: 1,
      },
    });

    await User.findByIdAndUpdate(req.user?._id, {
      $addToSet: {
        watchHistory: videoId,
      },
    });
    console.log(video);

    res.status(200).json({
      message: "video fetch successfully",
      data: video[0],
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
