const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const userRouter = require("./routes/user.route");
const sellerRouter = require("./routes/seller.route");
const adminRouter = require("./routes/admin.route");
const dbConnect = require("./config/dbConnect");
const { connectRabbitMQWithRetry } = require("./config/rabbitMQ");

require("dotenv").config({
  path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev",
});

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.get("/" , (req , res) => {
  return res.status(200).json({ message: "Order Service is running" , success: true });
})

app.get("/health", (req, res) => {
  const mongoose = require("mongoose");
  const dbStatus = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
  res.status(dbStatus === "Connected" ? 200 : 503).json({
    status: "UP",
    service: "order-service",
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

app.use("/user", userRouter);
app.use("/seller" , sellerRouter);
app.use("/admin" , adminRouter);

dbConnect();
connectRabbitMQWithRetry();

app.listen(process.env.PORT, "0.0.0.0", () => {
  console.log(`Order service is running on port ${process.env.PORT}`);
});