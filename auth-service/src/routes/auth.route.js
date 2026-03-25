const express = require("express");
const {register, getAllUser, getUser, verifyOtp, resendOTP} = require("../controller/auth.controller");

const authRouter = express.Router();

authRouter.post("/register" , register);
authRouter.get("/getAllUser" , getAllUser)
authRouter.get("/getUser" , getUser)
authRouter.post("/verifyOTP" , verifyOtp)
authRouter.post("/resendOTP" , resendOTP)

module.exports = authRouter;
