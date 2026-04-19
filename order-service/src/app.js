const express = require("express");
const cookieParser = require("cookie-parser");
const userRouter = require("./routes/user.route");

require("dotenv").config({
  path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev",
});

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/orders", userRouter);

app.listen(process.env.PORT, () => {
  console.log(`Order service is running on port ${process.env.PORT}`);
});