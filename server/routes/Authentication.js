const express = require('express')
const router = express.Router()

const { LoginUser, RegisterUser, LogoutUser, RefreshToken, ForgotPassword, ResetPassword } = require('../controllers/Authentication')
const LoginLimiter = require('../middleware/LoginLimiter')

router.post("/login", LoginLimiter, LoginUser);
router.post("/register", RegisterUser);
router.get("/logout", LogoutUser)
router.get("/refresh-token", RefreshToken)
router.post("/forgot-password", ForgotPassword)
router.post("/reset-password", ResetPassword)


module.exports = router