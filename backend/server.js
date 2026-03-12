require("dotenv").config()

const connectDB = require("./config/db")
require("./config/passport")
const app = require("./app")
const logger = require("./utils/logger")
const { connectRedis } = require("./utils/redisClient")

// Connect Database
connectDB()
connectRedis()

const PORT = process.env.PORT || 5000

const server = app.listen(PORT, () => {
  logger.info({ port: PORT }, "Server running")
})

// Graceful shutdown
process.on("SIGINT", () => {
  logger.info("Server shutting down...")
  server.close(() => {
    process.exit(0)
  })
})