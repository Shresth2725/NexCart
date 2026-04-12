const express = require("express");
const connectDB = require("./config/dbConnect");
const sellerRoute = require("./routes/seller.route");
const { connectRabbitMQWithRetry } = require("./config/rabbitMQ");
const cookieParser = require("cookie-parser");
require("dotenv").config({ path: process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev' });
const cors = require("cors");
const customerRoute = require("./routes/customer.route");
const adminRoute = require("./routes/admin.route");
const reviewRoute = require("./routes/review.route");
const productRoute = require("./routes/product.route");

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3001",
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
  
connectDB();
connectRabbitMQWithRetry();

app.get("/", (req, res) => {
  res.send("Products Service is running");
});

app.use("/seller", sellerRoute);
app.use("/customer", customerRoute);
app.use("/admin", adminRoute);
app.use("/reviews", reviewRoute);
app.use("/product", productRoute);

app.listen(process.env.PORT, () => {
  console.log(`Products Service is running on port ${process.env.PORT}`);
});