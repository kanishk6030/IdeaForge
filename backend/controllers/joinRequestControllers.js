const JoinRequest = require("../models/JoinRequest")
const Idea = require("../models/Idea")
const Notification = require("../models/Notification")
const User = require("../models/User")
const asyncHandler = require("../middleware/asyncHandler")
const {
  sendEmail,
  buildJoinRequestEmail,
  buildDecisionEmail
} = require("../utils/emailService")
const logger = require("../utils/logger")


// Send join request
const sendJoinRequest = asyncHandler(async (req, res) => {

  const idea = await Idea.findById(req.params.ideaId)

  if (!idea) {
    res.status(404)
    throw new Error("Idea not found")
  }

  const existing = await JoinRequest.findOne({
    ideaId: req.params.ideaId,
    userId: req.user._id
  })

  if (existing) {
    res.status(400)
    throw new Error("Join request already sent")
  }

  const request = await JoinRequest.create({
    ideaId: req.params.ideaId,
    userId: req.user._id,
    requestedRole: req.body.requestedRole
  })

  // Create notification for idea owner
  await Notification.create({
  userId: idea.createdBy,
  senderId: req.user._id,
  ideaId: idea._id,
  type: "join_request",
  message: "Someone requested to join your project"
})

  try {
    const owner = await User.findById(idea.createdBy).select("name email")
    if (owner?.email) {
      const appUrl = process.env.APP_URL || process.env.FRONTEND_URL || ""
      const ideaUrl = appUrl ? `${appUrl}/ideas/${idea._id}` : ""
      const profileUrl = appUrl ? `${appUrl}/users/${req.user._id}` : ""
      const emailPayload = buildJoinRequestEmail({
        ownerName: owner.name,
        requesterName: req.user.name || "Someone",
        role: request.requestedRole,
        ideaTitle: idea.title,
        ideaUrl,
        profileUrl
      })
      await sendEmail({ to: owner.email, ...emailPayload })
    }
  } catch (err) {
    logger.error({ err }, "Join request email failed")
  }

  res.status(201).json({
    success: true,
    request
  })

})


// Get join requests for idea
const getIdeaRequests = asyncHandler(async (req, res) => {

  const idea = await Idea.findById(req.params.ideaId)

  if (!idea) {
    res.status(404)
    throw new Error("Idea not found")
  }

  if (idea.createdBy.toString() !== req.user._id.toString()) {
    res.status(403)
    throw new Error("Not authorized to view requests for this idea")
  }

  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 20
  const skip = (page - 1) * limit

  const filter = { ideaId: req.params.ideaId }

  const [requests, total] = await Promise.all([
    JoinRequest.find(filter)
      .populate("userId", "name avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    JoinRequest.countDocuments(filter)
  ])

  res.status(200).json({
    success: true,
    page,
    totalPages: Math.ceil(total / limit),
    totalRequests: total,
    count: requests.length,
    requests
  })

})


// Approve request
const approveRequest = asyncHandler(async (req, res) => {

  const request = await JoinRequest.findById(req.params.id)

  if (!request) {
    res.status(404)
    throw new Error("Request not found")
  }

  const idea = await Idea.findById(request.ideaId)

  if (!idea) {
    res.status(404)
    throw new Error("Idea not found")
  }

  if (idea.createdBy.toString() !== req.user._id.toString()) {
    res.status(403)
    throw new Error("Not authorized to approve this request")
  }

  if (request.status !== "pending") {
    res.status(400)
    throw new Error("Request has already been processed")
  }

  request.status = "accepted"

  await request.save()

  // Create notification for requester
  await Notification.create({
  userId: request.userId,
  senderId: req.user._id,
  ideaId: request.ideaId,
  type: "request_approved",
  message: "Your join request was approved"
})

  try {
    const [requester, owner] = await Promise.all([
      User.findById(request.userId).select("name email"),
      User.findById(idea.createdBy).select("name email")
    ])
    if (requester?.email) {
      const appUrl = process.env.APP_URL || process.env.FRONTEND_URL || ""
      const ideaUrl = appUrl ? `${appUrl}/ideas/${idea._id}` : ""
      const emailPayload = buildDecisionEmail({
        requesterName: requester.name,
        ownerName: owner?.name,
        ideaTitle: idea.title,
        decision: "approved",
        ideaUrl
      })
      await sendEmail({ to: requester.email, ...emailPayload })
    }
  } catch (err) {
    logger.error({ err }, "Join request approval email failed")
  }

  res.status(200).json({
    success: true,
    request
  })

})


// Reject request
const rejectRequest = asyncHandler(async (req, res) => {

  const request = await JoinRequest.findById(req.params.id)

  if (!request) {
    res.status(404)
    throw new Error("Request not found")
  }

  const idea = await Idea.findById(request.ideaId)

  if (!idea) {
    res.status(404)
    throw new Error("Idea not found")
  }

  if (idea.createdBy.toString() !== req.user._id.toString()) {
    res.status(403)
    throw new Error("Not authorized to reject this request")
  }

  if (request.status !== "pending") {
    res.status(400)
    throw new Error("Request has already been processed")
  }

  request.status = "rejected"

  await request.save()

  try {
    const [requester, owner] = await Promise.all([
      User.findById(request.userId).select("name email"),
      User.findById(idea.createdBy).select("name email")
    ])
    if (requester?.email) {
      const appUrl = process.env.APP_URL || process.env.FRONTEND_URL || ""
      const ideaUrl = appUrl ? `${appUrl}/ideas/${idea._id}` : ""
      const emailPayload = buildDecisionEmail({
        requesterName: requester.name,
        ownerName: owner?.name,
        ideaTitle: idea.title,
        decision: "rejected",
        ideaUrl
      })
      await sendEmail({ to: requester.email, ...emailPayload })
    }
  } catch (err) {
    logger.error({ err }, "Join request rejection email failed")
  }

  res.status(200).json({
    success: true,
    request
  })

})

module.exports = {
  sendJoinRequest,
  getIdeaRequests,
  approveRequest,
  rejectRequest
}