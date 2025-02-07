import mongoose, { mongo } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new mongoose.Schema(
  {
    content: {
      tyep: String,
    },
    video: {
      type: mongoose.Types.ObjectId,
      ref: "Video",
    },
    tweet: {
      type: mongoose.Types.ObjectId,
      ref: "Tweet",
    },
    owner: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    parentComment: {
      type: mongoose.Types.ObjectId,
      ref: "Comment",
    },
    replies: [
      {
        types: mongoose.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  {
    timestamps: true,
  }
);
commentSchema.plugin(mongooseAggregatePaginate);
export const Comment = mongoose.model("comments", commentSchema);
