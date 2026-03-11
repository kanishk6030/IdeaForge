const express = require("express")
const rateLimit = require("express-rate-limit")
const protect = require("../middleware/authMiddleware")

const {
  addReaction,
  removeReaction,
  getReactions
} = require("../controllers/reactionContollers")

const router = express.Router()

const reactionWriteLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false
})

const reactionReadLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false
})

router.post("/:ideaId", protect, reactionWriteLimiter, addReaction)
router.delete("/:ideaId", protect, reactionWriteLimiter, removeReaction)
router.get("/:ideaId", reactionReadLimiter, getReactions)

module.exports = router