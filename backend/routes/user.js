const userController = require("../controllers/userController");
const middlewareController = require("../controllers/middlewareController");

const router = require("express").Router();

//Get all users
router.get("/", middlewareController.verifyToken, userController.getAllUser);

// Delete users
router.delete(
  "/:id",
  middlewareController.verifyTokenAndAdmin,
  userController.deleteUser
);
module.exports = router;
