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
    console.log(deleteReply)
    if (!deleteReply) {
      throw new apiError(400, "only owner can delete by reply or reply not found");
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

export const getVideoComments = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { page = 1, limit = 10, sortType = "asc" } = req.query;
  
    const sortTypeArr = ["asc", "dsc"];
  
    if (!sortTypeArr.includes(sortType)) {
      throw new apiError(400, "Please send valid fields for sortType");
    }
  
    if (!mongoose.isValidObjectId(videoId)) {
      throw new apiError(400, "Invalid VideoId");
    }
  
    let userID;
    try {
      const token =
        req.signedCookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      if (decodedToken) {
        const user = await User.findById(decodedToken?._id);
        userID = user._id;
      }
    } catch (error) {
      console.log(error);
    }
  
    const aggregateComment = Comment.aggregate([
      {
        $match: {
          video: videoId ? new mongoose.Types.ObjectId(videoId) : null,
          parentComment: { $exists: false },
        },
      },
      {
        $lookup: {
          from: "comments",
          let: { mainCommentId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$parentComment", "$$mainCommentId"] },
              },
            },
            {
              $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
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
                    $project: {
                      fullName: 1,
                      username: 1,
                      avatar: 1,
                    },
                  },
                ],
              },
            },
            {
              $addFields: {
                likesOnComment: { $size: "$likes" },
                owner: { $first: "$owner" },
                isLiked: {
                  $cond: {
                    if: { $in: [userID, "$likes.likedBy"] },
                    then: true,
                    else: false,
                  },
                },
              },
            },
            {
              $project: {
                _id: 1,
                content: 1,
                owner: 1,
                createdAt: 1,
                updatedAt: 1,
                likesOnComment: 1,
                isLiked: 1,
              },
            },
          ],
          as: "replies",
        },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "comment",
          as: "likes",
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
          owner: { $arrayElemAt: ["$owner", 0] },
          likesOnComment: { $size: "$likes" },
          isLiked: {
            $cond: {
              if: { $in: [userID, "$likes.likedBy"] },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          content: 1,
          owner: {
            _id: 1,
            username: 1,
            fullName: 1,
            avatar: 1,
          },
          createdAt: 1,
          updatedAt: 1,
          likesOnComment: 1,
          replies: 1,
          isLiked: 1,
        },
      },
      {
        $sort: {
          createdAt: sortType === "dsc" ? -1 : 1,
        },
      },
    ]);
  
    const comments = await Comment.aggregatePaginate(aggregateComment, {
      page,
      limit,
      customLabels: {
        totalDocs: "totalComments",
        docs: "comments",
      },
    });
  
    if (comments.totalComments === 0) {
      throw new apiError(404, "Video not found or no comments on the video yet");
    }
    res.status(200).json({
      message: "All comments are fetched",
      data: comments,
      success: true,
      error: false,
    });
    
  } catch (error) {
    
    res.status(400).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
};
