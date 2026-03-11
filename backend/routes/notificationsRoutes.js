const express = require("express")
const rateLimit = require("express-rate-limit")
const protect = require("../middleware/authMiddleware")

const {
  getNotifications,
  markAsRead,
  deleteNotification
} = require("../controllers/notificationControllers")

const router = express.Router()

const notificationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false
})

router.get("/", protect, notificationLimiter, getNotifications)

router.put("/:id/read", protect, notificationLimiter, markAsRead)

router.delete("/:id", protect, notificationLimiter, deleteNotification)

module.exports = router