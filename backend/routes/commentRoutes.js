const express = require("express")
const rateLimit = require("express-rate-limit")
const protect = require("../middleware/authMiddleware")

const {
  createComment,
  getComments,
  deleteComment
} = require("../controllers/commentControllers")

const router = express.Router()

const commentWriteLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false
})

const commentReadLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false
})

router.post("/:ideaId", protect, commentWriteLimiter, createComment)
router.get("/:ideaId", commentReadLimiter, getComments)
router.delete("/:id", protect, commentWriteLimiter, deleteComment)

module.exports = router