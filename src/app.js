import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import helmet from "helmet"
import { rateLimit } from "express-rate-limit"

const app = express()

// CORS configuration for production
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true)

    const allowedOrigins = [
      process.env.CORS_ORIGIN || "http://localhost:5173",
      "https://your-frontend-domain.vercel.app", // Add your frontend domain
      /\.vercel\.app$/, // Allow all Vercel preview deployments
    ]

    const isAllowed = allowedOrigins.some((allowedOrigin) => {
      if (typeof allowedOrigin === "string") {
        return origin === allowedOrigin
      }
      return allowedOrigin.test(origin)
    })

    if (isAllowed) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
}

app.use(cors(corsOptions))

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: true,
  legacyHeaders: false,
})

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(cookieParser())
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
)
app.use(limiter)

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to YouTube API",
    status: "Server is running",
    timestamp: new Date().toISOString(),
  })
})

// Import routes
import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.routes.js"
import playlist from "./routes/playlist.routes.js"
import comment from "./routes/comment.routes.js"
import like from "./routes/like.routes.js"

app.use("/api/v1/user", userRouter)
app.use("/api/v1/video", videoRouter)
app.use("/api/v1/playlist", playlist)
app.use("/api/v1/comment", comment)
app.use("/api/v1/like", like)

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  })
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Global error handler:", error)
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  })
})

export default app
