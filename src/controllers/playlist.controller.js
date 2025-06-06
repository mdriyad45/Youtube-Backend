import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/videos.model.js";
import { apiError } from "../utils/apiError.js";

export const createPlaylist = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!(name, description)) {
      throw new apiError(400, "name and description must required");
    }
    const playlist = await Playlist.create({
      name,
      description,
      owner: req.user?._id,
    });
    if (!playlist) {
      throw new apiError(400, "faild to create playlist");
    }

    res.status(200).json({
      message: "playlist created successfully",
      data: playlist,
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

export const updatePlaylist = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!(name, description)) {
      throw new apiError(400, "name and description must required!");
    }
    const playlistId = req.params._playlistId;

    if (!isValidObjectId(playlistId)) {
      throw new apiError(400, "playlistId not found");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      throw new apiError(400, "playlist not found");
    }
    if (playlist.owner.toString() !== req.user?._id.toString()) {
      throw new apiError("only owner can edit the playlist");
    }

    const updatePlaylist = await Playlist.findByIdAndUpdate(
      playlistId,
      {
        $set: {
          name,
          description,
        },
      },
      { new: true }
    );

    res.status(200).json({
      message: "Playlist update successfully",
      data: updatePlaylist,
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

export const deletePlaylist = async (req, res) => {
  try {
    const playlistId = req.params._playlistId;

    if (!isValidObjectId(playlistId)) {
      throw new apiError(400, "Invalid playlistId");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      throw new apiError(400, "playlist not found");
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
      throw new apiError(400, "only owner can delete playlist");
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

    res.status(400).json({
      message: "playlist deleted successfully",
      data: deletePlaylist,
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

export const addVideoToPlaylist = async (req, res) => {
  try {
    const { videoId, playlistId } = req.params;

    if (!isValidObjectId(videoId)) {
      throw new apiError(400, "Invalid videoId");
    }

    if (!isValidObjectId(playlistId)) {
      throw new apiError(400, "Invalid playlistId");
    }

    const playlist = await Playlist.findById(playlistId);
    const videos = await Video.findById(videoId);

    if (!playlist) {
      throw new apiError(400, "playlist does not exist");
    }

    if (!videos) {
      throw new apiError(400, "videos does not exist");
    }

    const addVideoToPlaylist = await Playlist.findByIdAndUpdate(
      playlistId,
      {
        $addToSet: {
          videos: videoId,
        },
      },
      {
        new: true,
      }
    );

    if (!addVideoToPlaylist) {
      throw new apiError(400, "videos does not exist");
    }

    res.status(200).json({
      message: "add video to playlist successfully",
      data: addVideoToPlaylist,
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

export const getPlaylistById = async (req, res) => {
  try {
    const playlistId = req.params._playlistId;

    if (!isValidObjectId(playlistId)) {
      throw new apiError(400, "Invalid playlistId");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      throw new apiError(400, "This playlis is not exist");
    }

    const playlistVideos = await Playlist.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(playlistId),
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "videos",
          foreignField: "_id",
          as: "videos",
        },
      },
      {
        $addFields: {
          videos: {
            $filter: {
              input: "$videos",
              as: "video",
              cond: { $eq: ["$$video.isPublished", true] },
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
        },
      },
      {
        $addFields: {
          totalVideos: { $size: "$videos" },
          totalViews: {
            $sum: {
              $map: {
                input: "$videos",
                as: "video",
                in: { $ifNull: ["$$video.views", 0] },
              },
            },
          },
          owner: { $first: "$owner" },
        },
      },
      {
        $project: {
          name: 1,
          description: 1,
          createdAt: 1,
          updatedAt: 1,
          totalViews: 1,
          totalVideos: 1,
          videos: {
            _id: 1,
            "videoFile.secure_url": 1,
            "thumbnail.secure_url": 1,
            title: 1,
            description: 1,
            duration: 1,
            views: 1,
            createdAt: 1,
            updatedAt: 1,
          },
          owner: {
            _id: 1,
            username: 1,
            fullname: 1,
            avatar: 1,
          },
        },
      },
    ]);
    console.log(playlistVideos);

    res.status(200).json({
      message: "playlist successfully fetch",
      data: playlistVideos[0],
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

export const getUserPlaylist = async (req, res) => {
  try {
    const userId = req.params._userId;

    if (!isValidObjectId(userId)) {
      throw new apiError(400, "Invalid user id");
    }

    const playlist = await Playlist.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "videos",
          foreignField: "_id",
          as: "videos",
        },
      },
      {
        $addFields: {
          totalVideos: {
            $size: "$videos",
          },
          totalViews: {
            $sum: "$videos.views",
          },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          totalVideos: 1,
          totalViews: 1,
          updatedAt: 1,
        },
      },
    ]);

    if (!playlist) {
      throw new apiError(400, "no playlist this user");
    }

    res.status(200).json({
      message: "playlist fetch successfully",
      data: playlist,
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
