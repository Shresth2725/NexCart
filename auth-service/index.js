const express = require("express");
const connectDB = require("./src/config/dbConnect");
require("dotenv").config();

const app = express();

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
  connectDB();
});
