const express = require("express")
const protect = require("../middleware/authMiddleware")

const {
  createIdea,
  getIdeas,
  getIdeaById,
  updateIdea,
  deleteIdea
} = require("../controllers/ideaControllers")

const router = express.Router()

router.post("/", protect, createIdea)
router.get("/", getIdeas)
router.get("/:id", getIdeaById)
router.put("/:id", protect, updateIdea)
router.delete("/:id", protect, deleteIdea)

module.exports = router
