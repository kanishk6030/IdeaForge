const express = require("express")
const protect = require("../middleware/authMiddleware")

const {
  getMe,
  getUserById,
  updateMe
} = require("../controllers/userControllers")

const router = express.Router()

router.get("/me", protect, getMe)
router.put("/me", protect, updateMe)
router.get("/:id", getUserById)

module.exports = router
