const asyncHandler = require("../middleware/asyncHandler")
const User = require("../models/User")

// Get current logged user
const getMe = asyncHandler(async (req, res) => {

  const user = await User.findById(req.user.id).select("-password")

  res.status(200).json({
    success: true,
    user
  })

})

module.exports = {
  getMe
}