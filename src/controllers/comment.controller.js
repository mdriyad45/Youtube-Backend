import mongoose, { isValidObjectId } from "mongoose";
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
    res.status(400).json({
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

export const updateComment = async (req, res) => {
  try {
    const { _commentId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(_commentId)) {
      throw new apiError(400, "Invalid comment id");
    }
    if (!content) {
      throw new apiError(400, "content must require");
    }

    const updateComment = await Comment.findOneAndUpdate(
      {
        $and: [{ _id: _commentId }, { owner: req.user?._id }],
      },
      {
        $set: {
          content,
        },
      },
      {
        new: true,
      }
    );

    if (!updateComment) {
      throw new apiError(
        400,
        "comment not found or you are not the owner of the comment"
      );
    }

    res.status(200).json({
      message: "comment update successfully",
      data: updateComment,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error(error),
      res.status(400).json({
        message: error.message,
        success: false,
        error: true,
      });
  }
};

export const addToReply = async (req, res) => {
  try {
    const { _parentCommentId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(_parentCommentId)) {
      throw new apiError(400, "Invalid parent comment id");
    }

    if (!content) {
      throw new apiError(400, "reply comment must require");
    }

    const parentComment = await Comment.findById(_parentCommentId);

    console.log("parentComment: ", parentComment);
    console.log("..................................");

    if (!parentComment) {
      throw new apiError(400, "parent comment not found");
    }

    const reply = new Comment({
      content,
      parentComment: _parentCommentId,
      video: parentComment.video,
      owner: req.user?._id,
    });
    await reply.save();

    console.log("Reply: ", reply);

    parentComment.replies.push(reply._id);
    await parentComment.save();

    res.status(200).json({
      message: "added reply comment sucessfully",
      data: reply,
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

export const updateReply = async (req, res) => {
  try {
    const { _replyId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(_replyId)) {
      throw new apiError(400, "Invalid reply comment id");
    }
    if (!content) {
      throw new apiError(400, "content must require");
    }

    const updateReply = await Comment.findOneAndUpdate(
      {
        $and: [{ _id: _replyId }, { owner: req.user?._id }],
      },
      {
        $set: {
          content,
        },
      },
      {
        new: true,
      }
    );
    if (!updateReply) {
      throw new apiError(
        400,
        "comment not found or you are not the owner of the comment"
      );
    }

    res.status(200).json({
      message: "comment update successfully",
      data: updateComment,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error(error),
      res.status(400).json({
        message: error.message,
        success: false,
        error: true,
      });
  }
};

export const deleteReply = async (req, res) => {
  try {
    const { _replyId } = req.params;

    console.log(_replyId, req.user?._id);

    if (!isValidObjectId(_replyId)) {
      throw new apiError(400, "Invalid reply comment id");
    }

    const deleteReply = await Comment.findOneAndDelete({
      $and: [{ _id: _replyId }, { owner: req.user?._id }],
    });
    console.log(deleteReply);
    if (!deleteReply) {
      throw new apiError(
        400,
        "only owner can delete by reply or reply not found"
      );
    }

    res.status(200).json({
      message: "reply delete sucessfully",
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

export const getVideoComment = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { page = 1, limit = 10, sortType = "asc" } = req.query;

    const sortTypeArray = ["asc", "dsc"];
    const userId = req.user?._id || null;

    if (userId != null) {
      if (!isValidObjectId(userId)) {
        throw new apiError(400, "Invalid userId");
      }
    }

    if (!isValidObjectId(videoId)) {
      throw new apiError(400, "Invalid video id");
    }

    const pipeline = [
      {
        $match: {
          video: videoId ? new mongoose.Types.ObjectId(videoId) : null,
          parentComment: { $exist: false }, // only top level comment match,  no match to parentComment.if reply comment does exist then parent comment exist
        },
      },
      {
        $lookup: {
          from: 'comment',
          loca
        }
      }
    ];
  } catch (error) {}
};
