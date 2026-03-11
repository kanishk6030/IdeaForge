const request = require("supertest")
const mongoose = require("mongoose")
const { MongoMemoryServer } = require("mongodb-memory-server")

const app = require("../app")
const User = require("../models/User")
const Idea = require("../models/Idea")
const generateToken = require("../utils/generateToken")

let mongoServer

const createAuthUser = async () => {
  const user = await User.create({
    name: "Test User",
    email: `user-${Date.now()}@example.com`
  })
  const token = generateToken(user._id)
  return { user, token }
}

beforeAll(async () => {
  process.env.JWT_SECRET = "test-secret"
  mongoServer = await MongoMemoryServer.create()
  await mongoose.connect(mongoServer.getUri(), {
    dbName: "test"
  })
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

beforeEach(async () => {
  await User.deleteMany({})
  await Idea.deleteMany({})
})

test("health check returns ok", async () => {
  const res = await request(app).get("/")

  expect(res.status).toBe(200)
  expect(res.body.status).toBe("OK")
})

test("create idea requires auth", async () => {
  const res = await request(app)
    .post("/api/ideas")
    .send({
      title: "New Idea",
      problem: "Problem",
      solution: "Solution"
    })

  expect(res.status).toBe(401)
})

test("create idea succeeds with valid payload", async () => {
  const { token } = await createAuthUser()

  const res = await request(app)
    .post("/api/ideas")
    .set("Authorization", `Bearer ${token}`)
    .send({
      title: "New Idea",
      problem: "Problem",
      solution: "Solution",
      techStack: ["Node.js"],
      difficulty: "beginner",
      rolesNeeded: ["Frontend"],
      tags: ["collab"]
    })

  expect(res.status).toBe(201)
  expect(res.body.success).toBe(true)
  expect(res.body.idea.title).toBe("New Idea")
})

test("update idea rejects empty title", async () => {
  const { user, token } = await createAuthUser()
  const idea = await Idea.create({
    title: "Initial",
    problem: "Problem",
    solution: "Solution",
    createdBy: user._id
  })

  const res = await request(app)
    .put(`/api/ideas/${idea._id}`)
    .set("Authorization", `Bearer ${token}`)
    .send({ title: " " })

  expect(res.status).toBe(400)
  expect(res.body.message).toMatch(/Title cannot be empty/i)
})

test("update idea rejects empty payload", async () => {
  const { user, token } = await createAuthUser()
  const idea = await Idea.create({
    title: "Initial",
    problem: "Problem",
    solution: "Solution",
    createdBy: user._id
  })

  const res = await request(app)
    .put(`/api/ideas/${idea._id}`)
    .set("Authorization", `Bearer ${token}`)
    .send({ unknownField: "value" })

  expect(res.status).toBe(400)
  expect(res.body.message).toMatch(/No valid fields/i)
})

test("update user rejects empty name", async () => {
  const { token } = await createAuthUser()

  const res = await request(app)
    .put("/api/users/me")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: " " })

  expect(res.status).toBe(400)
  expect(res.body.message).toMatch(/Name cannot be empty/i)
})

test("update user accepts bio", async () => {
  const { token } = await createAuthUser()

  const res = await request(app)
    .put("/api/users/me")
    .set("Authorization", `Bearer ${token}`)
    .send({ bio: "Hello" })

  expect(res.status).toBe(200)
  expect(res.body.user.bio).toBe("Hello")
})
