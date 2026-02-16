const express = require("express");
const router = express.Router();
const ValidateForm = require("../controllers/validateForm");
const {
  handleLogin,
  attemptLogin,
  attemptRegister,
} = require("../controllers/authController");
const { rateLimiter } = require("../controllers/rateLimiter");

router
  .route("/login")
  .get(handleLogin)
  .post(ValidateForm, rateLimiter(60, 3), attemptLogin);

router.post("/singup", ValidateForm, rateLimiter(60, 3), attemptRegister);

router.post("/delete", (req, res, next) => {
  // Basic wrapper to pass the request to the controller
  // In a real app we might want rate limiting here too
  next();
}, require("../controllers/authController").deleteAccount);
// router.route("/login").get(handleLogin).post(ValidateForm, attemptLogin);

// router.post("/singup", ValidateForm, attemptRegister);

module.exports = router;
