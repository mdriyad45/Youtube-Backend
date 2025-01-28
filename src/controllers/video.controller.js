
import { Video } from "../models/videos.model.js";
import { apiError } from "../utils/apiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import fs from "fs";
// get all videos based on query, sort, pagination, view , duration

export const getSearchVideo = async (req, res) => {
  try {
    const { query, autocomplete, category, tags, sortBy, limit, skip } = req.query;

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
