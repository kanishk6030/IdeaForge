const mongoose = require("mongoose")

const notificationSchema = new mongoose.Schema(
{
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  type: {
    type: String,
    enum: [
      "comment",
      "reaction",
      "join_request",
      "request_approved",
      "request_rejected"
    ],
    required: true
  },

  ideaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Idea"
  },

  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  message: {
    type: String
  },

  read: {
    type: Boolean,
    default: false
  }
},
{
  timestamps: true
}
)

module.exports = mongoose.model("Notification", notificationSchema)