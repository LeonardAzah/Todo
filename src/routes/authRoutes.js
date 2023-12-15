const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticateUser } = require("../middleware/authentication");

router.post("/register", authController.register);
router.post("/register-admin", authController.registerAdmin);
router.post("/login", authController.login);
router.delete("/logout", authenticateUser, authController.logout);

module.exports = router;
