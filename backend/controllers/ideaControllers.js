const Idea = require("../models/Idea")
const asyncHandler = require("../middleware/asyncHandler")

// Create Idea
const createIdea = asyncHandler(async (req, res) => {

  const {
    title,
    problem,
    solution,
    techStack,
    difficulty,
    rolesNeeded,
    tags
  } = req.body

  const trimmedTitle = typeof title === "string" ? title.trim() : ""
  const trimmedProblem = typeof problem === "string" ? problem.trim() : ""
  const trimmedSolution = typeof solution === "string" ? solution.trim() : ""

  if (!trimmedTitle || !trimmedProblem || !trimmedSolution) {
    res.status(400)
    throw new Error("Title, problem, and solution are required")
  }

  const allowedDifficulties = new Set([
    "beginner",
    "intermediate",
    "advanced"
  ])

  if (difficulty && !allowedDifficulties.has(difficulty)) {
    res.status(400)
    throw new Error("Invalid difficulty")
  }

  // Normalize string arrays and validate that they are arrays of strings
  const normalizeStringArray = (value) => {
    if (value === undefined) return undefined
    if (!Array.isArray(value)) return null
    return value
      .filter((item) => typeof item === "string")
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
  }

  const normalizedTechStack = normalizeStringArray(techStack)
  const normalizedRolesNeeded = normalizeStringArray(rolesNeeded)
  const normalizedTags = normalizeStringArray(tags)

  if (normalizedTechStack === null ||
      normalizedRolesNeeded === null ||
      normalizedTags === null) {
    res.status(400)
    throw new Error("techStack, rolesNeeded, and tags must be arrays of strings")
  }

  const idea = await Idea.create({
    title: trimmedTitle,
    problem: trimmedProblem,
    solution: trimmedSolution,
    techStack: normalizedTechStack,
    difficulty,
    rolesNeeded: normalizedRolesNeeded,
    tags: normalizedTags,
    createdBy: req.user._id
  })

  res.status(201).json({
    success: true,
    idea
  })
})


// Get All Ideas with Pagination + Filters
const getIdeas = asyncHandler(async (req, res) => {

  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10
  const skip = (page - 1) * limit

  const filter = {}

  if (req.query.techStack) {
    filter.techStack = req.query.techStack
  }

  if (req.query.difficulty) {
    filter.difficulty = req.query.difficulty
  }

  if (req.query.search) {
    filter.title = {
      $regex: req.query.search,
      $options: "i"
    }
  }

  const ideas = await Idea.find(filter)
    .populate("createdBy", "name avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)

  const total = await Idea.countDocuments(filter)

  res.status(200).json({
    success: true,
    page,
    totalPages: Math.ceil(total / limit),
    totalIdeas: total,
    ideas
  })

})


// Get Single Idea
const getIdeaById = asyncHandler(async (req, res) => {

  const idea = await Idea.findById(req.params.id)
    .populate("createdBy", "name avatar")

  if (!idea) {
    res.status(404)
    throw new Error("Idea not found")
  }

  res.status(200).json({
    success: true,
    idea
  })

})


// Update Idea
const updateIdea = asyncHandler(async (req, res) => {

  const idea = await Idea.findById(req.params.id)

  if (!idea) {
    res.status(404)
    throw new Error("Idea not found")
  }

  if (idea.createdBy.toString() !== req.user._id.toString()) {
    res.status(403)
    throw new Error("Not authorized to update this idea")
  }

  const updates = {}

  // Validate and prepare updates
  //Why to use Object.prototype.hasOwnProperty.call instead of just checking if (req.body.title) ? Because if the client sends an empty string for title, it would be falsy and we would skip the validation and not update the title at all. By using hasOwnProperty, we can check if the field is present in the request body regardless of its value, allowing us to validate empty strings properly.
  if (Object.prototype.hasOwnProperty.call(req.body, "title")) {
    if (typeof req.body.title !== "string") {
      res.status(400)
      throw new Error("Title must be a string")
    }
    const trimmedTitle = req.body.title.trim()
    if (!trimmedTitle) {
      res.status(400)
      throw new Error("Title cannot be empty")
    }
    updates.title = trimmedTitle
  }

  if (Object.prototype.hasOwnProperty.call(req.body, "problem")) {
    if (typeof req.body.problem !== "string") {
      res.status(400)
      throw new Error("Problem must be a string")
    }
    const trimmedProblem = req.body.problem.trim()
    if (!trimmedProblem) {
      res.status(400)
      throw new Error("Problem cannot be empty")
    }
    updates.problem = trimmedProblem
  }

  if (Object.prototype.hasOwnProperty.call(req.body, "solution")) {
    if (typeof req.body.solution !== "string") {
      res.status(400)
      throw new Error("Solution must be a string")
    }
    const trimmedSolution = req.body.solution.trim()
    if (!trimmedSolution) {
      res.status(400)
      throw new Error("Solution cannot be empty")
    }
    updates.solution = trimmedSolution
  }

  if (Object.prototype.hasOwnProperty.call(req.body, "difficulty")) {
    const allowedDifficulties = new Set([
      "beginner",
      "intermediate",
      "advanced"
    ])
    if (req.body.difficulty && !allowedDifficulties.has(req.body.difficulty)) {
      res.status(400)
      throw new Error("Invalid difficulty")
    }
    updates.difficulty = req.body.difficulty
  }

  const normalizeStringArray = (value) => {
    if (!Array.isArray(value)) return null
    return value
      .filter((item) => typeof item === "string")
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
  }

  if (Object.prototype.hasOwnProperty.call(req.body, "techStack")) {
    const normalizedTechStack = normalizeStringArray(req.body.techStack)
    if (normalizedTechStack === null) {
      res.status(400)
      throw new Error("techStack must be an array of strings")
    }
    updates.techStack = normalizedTechStack
  }

  if (Object.prototype.hasOwnProperty.call(req.body, "rolesNeeded")) {
    const normalizedRolesNeeded = normalizeStringArray(req.body.rolesNeeded)
    if (normalizedRolesNeeded === null) {
      res.status(400)
      throw new Error("rolesNeeded must be an array of strings")
    }
    updates.rolesNeeded = normalizedRolesNeeded
  }

  if (Object.prototype.hasOwnProperty.call(req.body, "tags")) {
    const normalizedTags = normalizeStringArray(req.body.tags)
    if (normalizedTags === null) {
      res.status(400)
      throw new Error("tags must be an array of strings")
    }
    updates.tags = normalizedTags
  }

  if (Object.keys(updates).length === 0) {
    res.status(400)
    throw new Error("No valid fields to update")
  }

  const updatedIdea = await Idea.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  )

  res.status(200).json({
    success: true,
    idea: updatedIdea
  })

})


// Delete Idea
const deleteIdea = asyncHandler(async (req, res) => {

  const idea = await Idea.findById(req.params.id)

  if (!idea) {
    res.status(404)
    throw new Error("Idea not found")
  }

  if (idea.createdBy.toString() !== req.user._id.toString()) {
    res.status(403)
    throw new Error("Not authorized to delete this idea")
  }

  await idea.deleteOne()

  res.status(200).json({
    success: true,
    message: "Idea deleted successfully"
  })

})

module.exports = {
  createIdea,
  getIdeas,
  getIdeaById,
  updateIdea,
  deleteIdea
}