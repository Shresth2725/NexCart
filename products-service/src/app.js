const express = require("express");
const connectDB = require("./config/dbConnect");
require("dotenv").config();

const app = express();
app.use(express.json());

connectDB();

app.get("/", (req, res) => {
  res.send("Products Service is running");
});

app.listen(process.env.PORT, () => {
  console.log(`Products Service is running on port ${process.env.PORT}`);
});