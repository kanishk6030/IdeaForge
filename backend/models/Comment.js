const mongoose = require("mongoose")

const commentSchema = new mongoose.Schema(
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

  content: {
    type: String,
    required: true
  }
},
{
  timestamps: true
}
)

module.exports = mongoose.model("Comment", commentSchema)