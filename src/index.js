import dotenv from "dotenv"
import connectDb from "./db/index.js"
import app from "./app.js"

dotenv.config({ path: "./.env" })

// Connect to database
let isConnected = false

const connectToDatabase = async () => {
  if (isConnected) {
    return
  }

  try {
    await connectDb()
    isConnected = true
    console.log("Database connected successfully")
  } catch (error) {
    console.error("Database connection failed:", error)
    throw error
  }
}

// For local development
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 4000

  connectToDatabase()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
      })
    })
    .catch((err) => {
      console.error("MongoDB Connection Failed:", err.message)
    })
}

// For Vercel serverless
export default async function handler(req, res) {
  try {
    await connectToDatabase()
    return app(req, res)
  } catch (error) {
    console.error("Handler error:", error)
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    })
  }
}
