const Comment = require("../models/Comment")
const Idea = require("../models/Idea")
const asyncHandler = require("../middleware/asyncHandler")
const Notification = require("../models/Notification")

// Add comment
const createComment = asyncHandler(async (req, res) => {

  const idea = await Idea.findById(req.params.ideaId)

  if (!idea) {
    res.status(404)
    throw new Error("Idea not found")
  }

  const comment = await Comment.create({
    ideaId: req.params.ideaId,
    userId: req.user._id,
    content: req.body.content
  })

  // Create notification for idea owner if commenter is not the owner 

  if (idea.createdBy.toString() !== req.user._id.toString()) {

  await Notification.create({
    userId: idea.createdBy,
    senderId: req.user._id,
    ideaId: idea._id,
    type: "comment",
    message: "Someone commented on your idea"
  })

}

  res.status(201).json({
    success: true,
    comment
  })

})


// Get comments for idea
const getComments = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 20
  const skip = (page - 1) * limit

  const filter = { ideaId: req.params.ideaId }

  const [comments, total] = await Promise.all([
    Comment.find(filter)
      .populate("userId", "name avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Comment.countDocuments(filter)
  ])

  res.status(200).json({
    success: true,
    page,
    totalPages: Math.ceil(total / limit),
    totalComments: total,
    count: comments.length,
    comments
  })

})


// Delete comment
const deleteComment = asyncHandler(async (req, res) => {

  const comment = await Comment.findById(req.params.id)

  if (!comment) {
    res.status(404)
    throw new Error("Comment not found")
  }

  if (comment.userId.toString() !== req.user._id.toString()) {
    res.status(403)
    throw new Error("Not authorized to delete this comment")
  }

  await comment.deleteOne()

  res.status(200).json({
    success: true,
    message: "Comment deleted"
  })

})

module.exports = {
  createComment,
  getComments,
  deleteComment
}