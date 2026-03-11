const mongoose = require("mongoose")

const ideaSchema = new mongoose.Schema(
{
  title: {
    type: String,
    required: true,
    trim: true
  },

  problem: {
    type: String,
    required: true
  },

  solution: {
    type: String,
    required: true
  },

  techStack: [
    {
      type: String
    }
  ],

  difficulty: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"]
  },

  rolesNeeded: [
    {
      type: String
    }
  ],

  tags: [
    {
      type: String
    }
  ],

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
},
{
  timestamps: true
}
)

module.exports = mongoose.model("Idea", ideaSchema)