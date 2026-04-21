const express = require("express");
const cookieParser = require("cookie-parser");
const userRouter = require("./routes/user.route");
const sellerRouter = require("./routes/seller.route");
const adminRouter = require("./routes/admin.route");
const dbConnect = require("./config/dbConnect");
const { connectRabbitMQWithRetry } = require("./config/rabbitMQ");

require("dotenv").config({
  path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev",
});

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/orders", userRouter);
app.use("/seller" , sellerRouter);
app.use("/admin" , adminRouter);

dbConnect();
connectRabbitMQWithRetry();

app.listen(process.env.PORT, () => {
  console.log(`Order service is running on port ${process.env.PORT}`);
});