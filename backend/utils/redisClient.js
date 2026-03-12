const { createClient } = require("redis")
const logger = require("./logger")

let redisClient

const buildRedisUrl = () => {
  if (process.env.REDIS_INTERNAL_URL) return process.env.REDIS_INTERNAL_URL
  if (process.env.REDIS_URL) return process.env.REDIS_URL
  const host = process.env.REDIS_HOST || "127.0.0.1"
  const port = process.env.REDIS_PORT || "6379"
  return `redis://${host}:${port}`
}

const connectRedis = async () => {
  if (redisClient && redisClient.isOpen) return redisClient

  const url = buildRedisUrl()
  redisClient = createClient({
    url
  })

  redisClient.on("error", (err) => {
    logger.error({ err }, "Redis error")
  })

  try {
    await redisClient.connect()
    logger.info({ url }, "Redis connected")
  } catch (err) {
    logger.warn({ err }, "Redis connection failed")
  }

  return redisClient
}

const isRedisReady = () => Boolean(redisClient && redisClient.isOpen)

const getCache = async (key) => {
  if (!isRedisReady()) return null
  return redisClient.get(key)
}

const setCache = async (key, value, ttlSeconds) => {
  if (!isRedisReady()) return false
  await redisClient.setEx(key, ttlSeconds, value)
  return true
}

const deleteKeysByPattern = async (pattern) => {
  if (!isRedisReady()) return 0

  let cursor = 0
  let deleted = 0

  do {
    const result = await redisClient.scan(cursor, {
      MATCH: pattern,
      COUNT: 100
    })

    cursor = Number(result.cursor)
    const keys = result.keys || []

    if (keys.length > 0) {
      deleted += await redisClient.del(keys)
    }
  } while (cursor !== 0)

  return deleted
}

module.exports = {
  connectRedis,
  isRedisReady,
  getCache,
  setCache,
  deleteKeysByPattern
}