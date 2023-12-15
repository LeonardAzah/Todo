const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const { authenticateUser } = require("../middleware/authentication");

router.post("/", authenticateUser, taskController.createTask);
router.get("/", authenticateUser, taskController.getTasks);
router.patch("/:id", authenticateUser, taskController.updateTask);
router.delete("/:id", authenticateUser, taskController.deleteTask);
router.get("/:id", authenticateUser, taskController.getSingleTask);

module.exports = router;
