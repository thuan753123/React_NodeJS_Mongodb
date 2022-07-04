const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

let refreshTokens = [];
const authController = {
  //Register User
  registerUser: async (req, res) => {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(req.body.password, salt);

      // Create new user
      const newUser = await new User({
        username: req.body.username,
        email: req.body.email,
        password: hashed,
      });

      //Save to DB
      const user = await newUser.save();
      return res.status(200).json(user);
    } catch (error) {
      res.status(500).json(error);
    }
  },

  //Generate access token
  generateAccessToken: (user) => {
    return jwt.sign(
      {
        id: user.id,
        admin: user.admin,
      },
      process.env.ACCESS_TOKEN_KEY,
      { expiresIn: "30m" }
    );
  },

  //Generate refresh token
  generateRefreshToken: (user) => {
    return jwt.sign(
      {
        id: user.id,
        admin: user.admin,
      },
      process.env.REFRESH_TOKEN_KEY,
      { expiresIn: "365d" }
    );
  },
  // Login User
  loginUser: async (req, res) => {
    try {
      const user = await User.findOne({ username: req.body.username });
      if (!user) {
        return res.status(404).json("Wrong username!");
      }
      const validPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!validPassword) {
        return res.status(404).json("Wrong password");
      }
      if (user && validPassword) {
        const accessToken = authController.generateAccessToken(user);
        const refreshToken = authController.generateRefreshToken(user);
        refreshTokens.push(refreshToken);
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: false,
          path: "/",
          sameSite: "strict",
        });
        const { password, ...others } = user._doc;
        return res.status(200).json({ ...others, accessToken });
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  //REDIS
  requestRefreshToken: async (req, res) => {
    const refreshToken = await req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json("you're not authenticated");
    if (!refreshTokens.includes(refreshToken)) {
      res.status(403).json("Refresh token is not valid");
    }
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY, (err, user) => {
      if (err) {
        console.log(err);
      }
      refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
      const newAccessToken = authController.generateAccessToken(user);
      const newRefreshToken = authController.generateAccessToken(user);
      refreshTokens.push(newRefreshToken);
      res.cookie("refreshToken", newrefreshToken, {
        httpOnly: true,
        secure: false,
        path: "/",
        sameSite: "strict",
      });
      return res.status(200).json({ accessToken: newAccessToken });
    });
  },
  //Log Out
  userLogout: async (req, res) => {
    res.clearCookie("refreshToken");
    refreshTokens = refreshTokens.filter(
      (token) => token !== req.cookies.refreshToken
    );
    return res.status(200).json("Log out success");
  },
};

//STORE TOKEN
// 1 - local storage : XSS security
// 2 -  Cookies -> http onlycookies: CSRF security -> CSRF -> SAMESITE
// 3 - REDUX STORE -> ACCESSTOKEN
// HTTPONLY COOKIES -> REFRESHTOKEN
// BFF PATTERN (BACKEND FOR FRONTEND)

module.exports = authController;
