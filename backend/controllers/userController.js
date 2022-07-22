const User = require("../models/User");

const userController = {
  //Get all users
  getAllUser: async (req, res) => {
    try {
      const user = await User.find();
      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  //delete user
  deleteUser: async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      return res.status(200).json("Delete successfully");
    } catch (error) {
      return res.status(500).json(error);
    }
  },
};

module.exports = userController;
