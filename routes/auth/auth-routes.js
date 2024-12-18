const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  authMiddleware,
  verifyOtp,
} = require("../../controllers/auth/auth-controller");

const router = express.Router();

router.post("/register", registerUser);
router.post("/verifyotp", verifyOtp);

router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/check-auth", authMiddleware(false), (req, res) => {
  const user = req.user;
  const token = req.token

  res.cookie("token", token, { httpOnly: true, secure: false }).status(200).json({
    success: true,
    message: "Authenticated user!",
    user,
  });
});

module.exports = router;
