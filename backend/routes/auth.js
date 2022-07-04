const router = require("express").Router();
const authController = require("../controllers/authController");
const middlewareController = require("../controllers/middlewareController");

// Register
router.post("/register", authController.registerUser);

//Login
router.post("/login", authController.loginUser);

//Refresh
router.post("/refresh", authController.requestRefreshToken);

//LOG OUT
router.post(
  "/logout",
  middlewareController.verifyToken,
  authController.userLogout
);
module.exports = router;
