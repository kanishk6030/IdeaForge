const Notification = require("../models/Notification")
const asyncHandler = require("../middleware/asyncHandler")

// Get user notifications
const getNotifications = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 20
  const skip = (page - 1) * limit

  const filter = { userId: req.user._id }

  const [notifications, total] = await Promise.all([
    Notification.find(filter)
      .populate("senderId", "name avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments(filter)
  ])

  res.status(200).json({
    success: true,
    page,
    totalPages: Math.ceil(total / limit),
    totalNotifications: total,
    count: notifications.length,
    notifications
  })

})


// Mark notification as read
const markAsRead = asyncHandler(async (req, res) => {

  const notification = await Notification.findById(req.params.id)

  if (!notification) {
    res.status(404)
    throw new Error("Notification not found")
  }

  if (notification.userId.toString() !== req.user._id.toString()) {
    res.status(403)
    throw new Error("Not authorized to update this notification")
  }

  notification.read = true

  await notification.save()

  res.status(200).json({
    success: true,
    notification
  })

})


// Delete notification
const deleteNotification = asyncHandler(async (req, res) => {

  const notification = await Notification.findById(req.params.id)

  if (!notification) {
    res.status(404)
    throw new Error("Notification not found")
  }

  if (notification.userId.toString() !== req.user._id.toString()) {
    res.status(403)
    throw new Error("Not authorized to delete this notification")
  }

  await notification.deleteOne()

  res.status(200).json({
    success: true,
    message: "Notification deleted"
  })

})

module.exports = {
  getNotifications,
  markAsRead,
  deleteNotification
}