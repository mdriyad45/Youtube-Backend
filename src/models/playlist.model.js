import mongoose from "mongoose";

const playListSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, "play list name require"],
    },
    description: {
      type: String,
      require: [true, "play list description require"],
    },
    videos: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Video",
      },
    ],
    owner: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);
export const Playlist = mongoose.model("playlist", playListSchema);
