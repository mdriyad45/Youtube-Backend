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
