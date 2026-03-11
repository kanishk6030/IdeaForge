const User = require("../models/User")
const asyncHandler = require("../middleware/asyncHandler")

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password")

  if (!user) {
    res.status(404)
    throw new Error("User not found")
  }

  res.status(200).json({
    success: true,
    user
  })
})

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password")

  if (!user) {
    res.status(404)
    throw new Error("User not found")
  }

  res.status(200).json({
    success: true,
    user
  })
})

const updateMe = asyncHandler(async (req, res) => {
  const updates = {}

  if (typeof req.body.name === "string") {
    const trimmedName = req.body.name.trim()
    if (!trimmedName) {
      res.status(400)
      throw new Error("Name cannot be empty")
    }
    if (trimmedName.length > 100) {
      res.status(400)
      throw new Error("Name is too long")
    }
    updates.name = trimmedName
  }

  if (typeof req.body.bio === "string") {
    if (req.body.bio.length > 500) {
      res.status(400)
      throw new Error("Bio is too long")
    }
    updates.bio = req.body.bio
  }

  if (typeof req.body.avatar === "string") {
    if (req.body.avatar.length > 500) {
      res.status(400)
      throw new Error("Avatar URL is too long")
    }
    updates.avatar = req.body.avatar
  }

  if (typeof req.body.linkedinUrl === "string") {
    if (req.body.linkedinUrl.length > 300) {
      res.status(400)
      throw new Error("LinkedIn URL is too long")
    }
    updates.linkedinUrl = req.body.linkedinUrl
  }

  if (typeof req.body.githubUrl === "string") {
    if (req.body.githubUrl.length > 300) {
      res.status(400)
      throw new Error("GitHub URL is too long")
    }
    updates.githubUrl = req.body.githubUrl
  }

  if (Object.keys(updates).length === 0) {
    res.status(400)
    throw new Error("No valid fields to update")
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    { new: true, runValidators: true }
  ).select("-password")

  res.status(200).json({
    success: true,
    user
  })
})

module.exports = {
  getMe,
  getUserById,
  updateMe
}
