import { isValidObjectId } from "mongoose";
import { apiError } from "../utils/apiError.js";
import { Comment } from "../models/comment.model.js";

export const addComment = async (req, res) => {
  try {
    const videoId = req.params._videoId;
    const { content } = req.body;
    console.log(content);
    

    if (!isValidObjectId(videoId)) {
      throw new apiError(400, "Invalid video id");
    }

    if (!content) {
      throw new apiError(400, "Content not found");
    }

    const createComment = await Comment.create({
      content,
      video: videoId,
      owner: req.user?._id,
    });
    const comment = await Comment.findById(createComment._id);

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

export const deleteComment = async (req, res) => {
  try {
    const { _commentId } = req.params;
    if (!isValidObjectId(_commentId)) {
      throw new apiError(400, "Invalid comment id");
    }

    const deleteComment = await Comment.findOneAndDelete({
      $and: [{ _id: _commentId }, { owner: req.user?._id }],
    });

    if (!deleteComment) {
      throw new apiError(
        400,
        "only owner can delete by comment or Comment not found"
      );
    }

    res.status(200).json({
      message: "Comment delete sucessfully",
      data: {},
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
