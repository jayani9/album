const express = require("express");
const router = express.Router();
const registerController = require("../Controllers/registerController");
const checkIsUserMiddleware = require("../Middleware/user");
const authMiddleware = require("../Middleware/authMiddleware"); // Middleware for JWT auth


// Add new user
router.post("/register",  registerController.registerUser);
router.post("/login", registerController.loginUser);

router.post("/refresh", registerController.refreshAccessToken);
router.post("/logout", registerController.logoutUser);

module.exports = router;