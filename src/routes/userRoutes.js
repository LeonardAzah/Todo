const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authentication");

const userController = require("../controllers/userController");

router.get(
  "/",
  authenticateUser,
  authorizePermissions("ADMIN"),
  userController.getAllUsers
);

router.get("/showMe", authenticateUser, userController.showCurrentUser);
router.patch("/:id", authenticateUser, userController.updateUser);
router.delete(
  "/:id",
  authenticateUser,
  authorizePermissions("ADMIN"),
  userController.deleteUser
);
router.get("/:id", authenticateUser, userController.getSingleUser);

module.exports = router;
