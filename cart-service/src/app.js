const express = require("express");
const cookieParser = require("cookie-parser")
const dotenv = require("dotenv");
const cors = require("cors");
const { connectRabbitMQWithRetry } = require("./config/rabbitmq");
const connectDB = require("./config/dbConnect");
const customerCartRouter = require("./routes/customer.route");

dotenv.config({ path: process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev' });
connectRabbitMQWithRetry();
connectDB();

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
    res.send("Cart Service is running");
});

app.use("/cart" , customerCartRouter)

app.listen(process.env.PORT, () => {
    console.log(`Cart Service is running on port ${process.env.PORT}`);
});

