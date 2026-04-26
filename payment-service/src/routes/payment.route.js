const express = require("express") ;
const { createPayment , verifyPayment } = require("../controller/payment.controller") ;
const { authMiddleware } = require("../middlewares/auth.middleware") ;

const paymentRouter = express.Router() ; 

paymentRouter.post("/create" , authMiddleware , createPayment) ;
paymentRouter.post("/verify" , authMiddleware , verifyPayment) ;

module.exports = paymentRouter ;
