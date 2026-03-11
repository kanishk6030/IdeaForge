const Idea = require("../models/Idea")
const Reaction = require("../models/Reaction")
const Notification = require("../models/Notification")
const asyncHandler = require("../middleware/asyncHandler")

// Add reaction
const addReaction = asyncHandler(async (req, res) => {

  const idea = await Idea.findById(req.params.ideaId)

  if (!idea) {
    res.status(404)
    throw new Error("Idea not found")
  }

  const existing = await Reaction.findOne({
    ideaId: req.params.ideaId,
    userId: req.user._id
  })

  if (existing) {
    res.status(400)
    throw new Error("You already reacted to this idea")
  }

  const reaction = await Reaction.create({
    ideaId: req.params.ideaId,
    userId: req.user._id,
    type: "like"
  })

  // Create notification if reactor is NOT the idea owner
  if (idea.createdBy.toString() !== req.user._id.toString()) {

    await Notification.create({
      userId: idea.createdBy,
      senderId: req.user._id,
      ideaId: idea._id,
      type: "reaction",
      message: "Someone liked your idea"
    })

  }

  res.status(201).json({
    success: true,
    reaction
  })

})


// Remove reaction
const removeReaction = asyncHandler(async (req, res) => {

  const reaction = await Reaction.findOne({
    ideaId: req.params.ideaId,
    userId: req.user._id
  })

  if (!reaction) {
    res.status(404)
    throw new Error("Reaction not found")
  }

  await reaction.deleteOne()

  res.status(200).json({
    success: true,
    message: "Reaction removed"
  })

})


// Get reactions for idea
const getReactions = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 20
  const skip = (page - 1) * limit

  const filter = { ideaId: req.params.ideaId }

  const [reactions, total] = await Promise.all([
    Reaction.find(filter)
      .skip(skip)
      .limit(limit),
    Reaction.countDocuments(filter)
  ])

  res.status(200).json({
    success: true,
    page,
    totalPages: Math.ceil(total / limit),
    totalReactions: total,
    count: reactions.length,
    reactions
  })

})

module.exports = {
  addReaction,
  removeReaction,
  getReactions
}