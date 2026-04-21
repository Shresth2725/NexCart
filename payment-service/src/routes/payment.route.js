const express = require("express") ;
const { createPayment , verifyPayment } = require("../controller/payment.controller") ;

const paymentRouter = express.Router() ; 

paymentRouter.post("/create" , createPayment) ;
paymentRouter.post("/verify" , verifyPayment) ;

module.exports = paymentRouter ;
