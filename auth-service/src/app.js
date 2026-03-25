const express = require("express");
const connectDB = require("./config/dbConnect");
const authRouter = require("./routes/auth.route");
const {connectRabbitMQWithRetry} = require("./config/rabbitMQ");
require("dotenv").config();

const app = express();

const start = async () => {
  await connectRabbitMQWithRetry();
}

start();

app.use(express.json());

app.get("/" , (req , res) => {
  res.send("Auth service is running");
})
app.use("/auth" , authRouter)

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
  connectDB();
});
