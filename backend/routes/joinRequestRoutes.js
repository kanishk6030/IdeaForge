const express = require("express")
const rateLimit = require("express-rate-limit")
const protect = require("../middleware/authMiddleware")

const {
  sendJoinRequest,
  getIdeaRequests,
  approveRequest,
  rejectRequest
} = require("../controllers/joinRequestControllers")

const router = express.Router()

const joinRequestLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false
})

router.post("/:ideaId", protect, joinRequestLimiter, sendJoinRequest)

router.get("/idea/:ideaId", protect, joinRequestLimiter, getIdeaRequests)

router.put("/:id/approve", protect, joinRequestLimiter, approveRequest)
router.put("/:id/reject", protect, joinRequestLimiter, rejectRequest)

module.exports = router