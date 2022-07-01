const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");

dotenv.config();
const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.listen(process.env.PORT, () => {
  console.log("server is running at: ");
});

//connect mongoose
mongoose.connect(process.env.MONGODB, () => {
  console.log("connect to mongodb successfully");
});

// Routes
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
