const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },

  password: {
    type: String
  },

  googleId: {
    type: String
  },

  githubId: {
    type: String
  },

  avatar: {
    type: String
  },

  linkedinUrl: {
    type: String,
    default: ""
  },

  githubUrl: {
    type: String,
    default: ""
  },

  bio: {
    type: String,
    default: ""
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  }
},
{
  timestamps: true
}
)

module.exports = mongoose.model("User", userSchema)