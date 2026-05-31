const winston = require("winston")

const isDev = process.env.NODE_ENV !== "production"

const errorReplacer = (key, value) => {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack
    }
  }
  return value
}

const baseLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isDev ? "debug" : "info"),
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()]
})

if (isDev) {
  baseLogger.format = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ level, message, timestamp, ...meta }) => {
      const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta, errorReplacer)}` : ""
      return `${timestamp} ${level}: ${message}${metaString}`
    })
  )
}

const normalizeArgs = (args) => {
  if (args.length >= 2 && typeof args[0] === "object" && typeof args[1] === "string") {
    return [args[1], args[0], ...args.slice(2)]
  }
  return args
}

const logger = new Proxy(baseLogger, {
  get(target, prop) {
    const value = target[prop]
    if (typeof value !== "function" || !["error", "warn", "info", "debug"].includes(prop)) {
      return value
    }

    return (...args) => value.apply(target, normalizeArgs(args))
  }
})

module.exports = logger
