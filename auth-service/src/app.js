const express = require("express");
const connectDB = require("./config/dbConnect");
const authRouter = require("./routes/auth.route");
const {connectRabbitMQWithRetry} = require("./config/rabbitMQ");
const adminRouter = require("./routes/admin.route");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config({ path: process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev' });

const app = express();
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
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
