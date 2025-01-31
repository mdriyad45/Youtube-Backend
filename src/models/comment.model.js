import mongoose, { mongo } from "mongoose";

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
  },
  {
    timestamps: true,
  }
);

export const Comment = mongoose.model("comments", commentSchema);
