import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { rateLimit } from 'express-rate-limit'

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
})

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(helmet());
app.use(limiter)

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
