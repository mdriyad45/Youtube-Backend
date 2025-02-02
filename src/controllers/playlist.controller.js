import { Playlist } from "../models/playlist.model.js";
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

    if (!playlistId) {
      throw new apiError(400, "playlistId not found");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      throw new apiError(400, "playlist not found");
    }
    if (playlist.owner.tostring() !== req.user?._id.tostring()) {
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
