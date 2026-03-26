const express = require("express");
const connectDB = require("./config/dbConnect");
const authRouter = require("./routes/auth.route");
const {connectRabbitMQWithRetry} = require("./config/rabbitMQ");
const adminRouter = require("./routes/admin.route");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();
app.use(cookieParser());

const start = async () => {
  await connectRabbitMQWithRetry();
}

start();

app.use(express.json());

app.get("/" , (req , res) => {
  res.send("Auth service is running");
})

app.use("/auth" , authRouter)
app.use("/admin" , adminRouter)

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
  connectDB();
});
