const express = require("express");
const connectDB = require("./config/dbConnect");
const sellerRoute = require("./routes/seller.route");
const { connectRabbitMQWithRetry } = require("./config/rabbitMQ");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const cors = require("cors");

const app = express();
app.use(cors({
  origin: "http://localhost:3001",
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

connectDB();
connectRabbitMQWithRetry();

app.get("/", (req, res) => {
  res.send("Products Service is running");
});

app.use("/seller", sellerRoute);

app.listen(process.env.PORT, () => {
  console.log(`Products Service is running on port ${process.env.PORT}`);
});