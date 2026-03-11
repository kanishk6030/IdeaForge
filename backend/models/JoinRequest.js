const mongoose = require("mongoose")

const joinRequestSchema = new mongoose.Schema(
{
  ideaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Idea",
    required: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  requestedRole: {
    type: String,
    required: true
  },

  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending"
  }
},
{
  timestamps: true
}
)

module.exports = mongoose.model("JoinRequest", joinRequestSchema)