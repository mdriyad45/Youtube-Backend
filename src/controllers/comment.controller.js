import { isValidObjectId } from "mongoose";
import { apiError } from "../utils/apiError.js";
import { Comment } from "../models/comment.model.js";

export const addComment = async (req, res) => {
  try {
    const videoId = req.params._videoId;
    const { commentContent } = req.body;

    if (!isValidObjectId(videoId)) {
      throw new apiError(400, "Invalid video id");
    }

    if (!content) {
      throw new apiError(400, "commentContent not found");
    }

    const comment = await Comment.create({
      content: commentContent,
      video: videoId,
      owner: req.user?._id,
    });

    if (!comment) {
      throw new apiError(400, "try again");
    }

    res.status(200).json({
      message: "Comment add successfully",
      data: comment,
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
