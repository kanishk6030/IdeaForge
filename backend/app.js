require("dotenv").config()

const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const crypto = require("crypto")
const mongoose = require("mongoose")
const client = require("prom-client")

const logger = require("./utils/logger")

const authRoutes = require("./routes/authRoutes")
const ideaRoutes = require("./routes/ideaRoutes")
const commentRoutes = require("./routes/commentRoutes")
const reactionRoutes = require("./routes/reactionRoutes")
const joinRequestRoutes = require("./routes/joinRequestRoutes")
const userRoutes = require("./routes/userRoutes")
const notificationRoutes = require("./routes/notificationsRoutes")

const app = express()


// Trust proxy (important for deployment)
app.set("trust proxy", 1)

// Security middleware
app.use(helmet())

// Request logging + tracing
app.use((req, res, next) => {
  req.requestId = req.headers["x-request-id"] || crypto.randomUUID()
  res.setHeader("x-request-id", req.requestId)
  const startTime = Date.now()

  res.on("finish", () => {
    const durationMs = Date.now() - startTime
    logger.info({
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs
    }, "HTTP request")
  })

  next()
})

// CORS
const corsOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (corsOrigins.length === 0) {
      return callback(null, process.env.NODE_ENV !== "production")
    }
    return callback(null, corsOrigins.includes(origin))
  },
  credentials: true
}

app.use(cors(corsOptions))

// Body parser
app.use(express.json({ limit: "10kb" }))
app.use(express.urlencoded({ extended: true }))

// Metrics & health checks (not rate limited)
client.collectDefaultMetrics()

app.get("/api/health", (req, res) => {
  const dbReadyState = mongoose.connection.readyState
  const dbStatusMap = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting"
  }

  res.status(200).json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
    database: dbStatusMap[dbReadyState] || "unknown"
  })
})

app.get("/api/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType)
  res.end(await client.register.metrics())
})

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
})

app.use("/api", limiter)

// Health check route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "IdeaForge API running",
    status: "OK"
  })
})

// API routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/ideas", ideaRoutes)
app.use("/api/comments", commentRoutes)
app.use("/api/reactions", reactionRoutes)
app.use("/api/join-requests", joinRequestRoutes)
app.use("/api/notifications", notificationRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  })
})

// Global error handler
app.use((err, req, res, next) => {
  logger.error({ err, requestId: req.requestId }, "Unhandled error")

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server Error",
    requestId: req.requestId
  })
})

module.exports = app
