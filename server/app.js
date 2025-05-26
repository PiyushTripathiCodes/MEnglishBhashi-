const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const mongoSanitize = require("express-mongo-sanitize")
const compression = require("compression")
require("dotenv").config()

// Import routes
const authRoutes = require("./routes/auth")
const courseRoutes = require("./routes/courses")
const progressRoutes = require("./routes/progress")

// Import middleware
const { optionalAuth } = require("./middleware/auth")
const errorHandler = require("./middleware/errorHandler")

const app = express()

// Security middleware
app.use(helmet())
app.use(mongoSanitize())
app.use(compression())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later",
  },
})
app.use("/api/", limiter)

// CORS configuration
const corsOptions = {
  origin: ["http://localhost:3000", "http://localhost:3001"],
  credentials: true,
  optionsSuccessStatus: 200,
}
app.use(cors(corsOptions))

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Database connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/learnhub", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected successfully")
    console.log(`📊 Database: ${mongoose.connection.name}`)
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err)
    process.exit(1)
  })

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🎓 LearnHub API is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  })
})

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  })
})

// API routes
app.use("/api/auth", authRoutes)
app.use("/api/courses", optionalAuth, courseRoutes)
app.use("/api/progress", progressRoutes)

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  })
})

// Global error handler
app.use(errorHandler)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`)
  console.log(`📡 API URL: http://localhost:${PORT}`)
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`)
})

module.exports = app
