const express = require("express");
const {register, getAllUser, getUser, verifyUserOtp, resendOTP, login , logout , getAddresses , addAddress , removeAddress , updateAddress , updatePassword , forgetPassword , updateUser , updateSellerInfo, verifyForgetPasswordOtp} = require("../controller/auth.controller");

const authRouter = express.Router();

authRouter.post("/register" , register);
authRouter.get("/getAllUser" , getAllUser)
authRouter.get("/getUser" , getUser)
authRouter.post("/verifyUserOtp" , verifyUserOtp)
authRouter.post("/resendOTP" , resendOTP)
authRouter.post("/login" , login)
authRouter.post("/logout" , logout)
authRouter.post("/getAddresses" , getAddresses)
authRouter.post("/addAddress" , addAddress)
authRouter.post("/removeAddress" , removeAddress)
authRouter.post("/updateAddress" , updateAddress)
authRouter.post("/updatePassword" , updatePassword)
authRouter.post("/forgetPassword" , forgetPassword)
authRouter.post("/updateUser" , updateUser)
authRouter.post("/updateSellerInfo" , updateSellerInfo)
authRouter.post("/verifyForgetPasswordOtp" , verifyForgetPasswordOtp)

module.exports = authRouter;
