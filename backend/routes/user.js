const userController = require("../controllers/userController");

const router = require("express").Router();

//Get all users
router.get("/", userController.getAllUser);

// Delete users
router.delete("/:id", userController.deleteUser);
module.exports = router;
