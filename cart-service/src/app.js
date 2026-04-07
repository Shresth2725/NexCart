const express = require("express");
const cookieParser = require("cookie-parser")
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
    res.send("Cart Service is running");
});

app.listen(process.env.PORT, () => {
    console.log(`Cart Service is running on port ${process.env.PORT}`);
});

