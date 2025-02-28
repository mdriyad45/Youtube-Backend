import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//import routes

import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import playlist from "./routes/playlist.routes.js";
import comment from "./routes/comment.routes.js";
import like from "./routes/like.routes.js";

app.use("/api/v1/user", userRouter);
app.use("/api/v1/video", videoRouter);
app.use("/api/v1/playlist", playlist);
app.use("/api/v1/comment/", comment);
app.use("/api/v1/like/", like);

export default app;
