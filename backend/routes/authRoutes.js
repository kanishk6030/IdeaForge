const router = require("express").Router()
const passport = require("passport")
const rateLimit = require("express-rate-limit")
const generateToken = require("../utils/generateToken")
const { getMe } = require("../controllers/authControllers")
const protect = require("../middleware/authMiddleware")

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false
})

router.get(
  "/google",
  authLimiter,
  passport.authenticate("google", { scope: ["profile", "email"] })
)

router.get(
  "/google/callback",
  authLimiter,
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = generateToken(req.user._id)

    const frontendUrl = process.env.FRONTEND_URL
    if (frontendUrl) {
      const redirectUrl = new URL("/login", frontendUrl)
      redirectUrl.searchParams.set("token", token)
      return res.redirect(redirectUrl.toString())
    }

    res.json({
      message: "Login successful",
      token,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar
      }
    })
  }
)

// Get current user
router.get("/me", protect, getMe)

module.exports = router