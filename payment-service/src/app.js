const express = require("express") ;
const connectDB = require("./config/dbConnect");
const cookieParser = require("cookie-parser");
require("dotenv").config({
  path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev",
});
const { connectRabbitMQWithRetry } = require("./config/rabbitMQ");
const paymentRouter = require("./routes/payment.route");

const app = express() ;

app.use(express.json());
app.use(cookieParser());

app.get("/" , (req , res) => {
  res.json({message : "Payment Service is running"});
})

app.use("/payment" , paymentRouter) ; 


connectDB();
connectRabbitMQWithRetry();

app.listen(process.env.PORT, "0.0.0.0", () => {
    console.log(`Payment Service is running on port ${process.env.PORT}`);
});