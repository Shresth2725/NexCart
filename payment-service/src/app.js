const express = require("express") ;
const connectDB = require("./config/dbConnect");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express() ;

app.use(express.json());
app.use(cookieParser());

app.use("/payment" , paymentRouter) ; 


connectDB();

app.listen(process.env.PORT , () => {
    console.log(`Payment Service is running on port ${process.env.PORT}`);
});