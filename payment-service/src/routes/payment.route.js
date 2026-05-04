const express = require("express") ;
const { createPayment , verifyPayment , verifyClientPayment } = require("../controller/payment.controller") ;
const { authMiddleware } = require("../middleware/auth.middleware") ;

const paymentRouter = express.Router() ; 

paymentRouter.post("/create" , authMiddleware , createPayment) ;
paymentRouter.post("/verify" , authMiddleware , verifyPayment) ;
paymentRouter.post("/verify-client" , authMiddleware , verifyClientPayment) ;

module.exports = paymentRouter ;
