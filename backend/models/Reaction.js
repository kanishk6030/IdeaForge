const mongoose = require("mongoose")

const reactionSchema = new mongoose.Schema(
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

  type: {
    type: String,
    enum: ["like", "upvote"],
    default: "like"
  }
},
{
  timestamps: true
}
)

reactionSchema.index({ ideaId: 1, userId: 1 }, { unique: true })

module.exports = mongoose.model("Reaction", reactionSchema)