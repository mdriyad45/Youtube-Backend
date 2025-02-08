import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { Like } from "./like.model.js";

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      require: true,
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
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
    replies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  {
    timestamps: true,
  }
);

commentSchema.plugin(mongooseAggregatePaginate);

commentSchema.post("findOneAndDelete", async (comment, next) => {
  if (comment) {
    await Like.findByIdAndDelete(comment._id);

    if (comment.parentComment) {
      await mongoose
        .model("Comment")
        .updateOne(
          { _id: comment.parentComment },
          { $pull: { replies: comment._id } }
        );
    }

    if (comment.replies.length > 0) {
      await mongoose
        .model("Comment")
        .deleteMany({ _id: { $in: comment.replies } });
    }
  }
  next();
});
export const Comment = mongoose.model("comments", commentSchema);
