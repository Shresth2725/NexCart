const express = require("express") ;
const connectDB = require("./config/dbConnect");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config({
  path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev",
});
const { connectRabbitMQWithRetry } = require("./config/rabbitMQ");
const paymentRouter = require("./routes/payment.route");

const app = express() ;

app.use(cors({
  origin: ["http://localhost:8080", "http://localhost:3000"],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.get("/" , (req , res) => {
  res.json({message : "Payment Service is running"});
})

app.get("/health", (req, res) => {
  const mongoose = require("mongoose");
  const dbStatus = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
  res.status(dbStatus === "Connected" ? 200 : 503).json({
    status: "UP",
    service: "payment-service",
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

app.use("/payment" , paymentRouter) ; 


connectDB();
connectRabbitMQWithRetry();

app.listen(process.env.PORT, "0.0.0.0", () => {
    console.log(`Payment Service is running on port ${process.env.PORT}`);
});