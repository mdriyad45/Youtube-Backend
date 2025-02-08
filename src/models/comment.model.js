import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { Like } from "./like.model.js";

const commentSchema = new Schema(
  {
    content: {
      type: String,
      require: true,
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    tweet: {
      type: Schema.Types.ObjectId,
      ref: "Tweet",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      //default: null,
    },
    replies: [
      {
        type: Schema.Types.ObjectId,
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
