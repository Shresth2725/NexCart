const express = require("express");
const {register, verifyUserOtp, resendOTP, login , logout , getAddresses , addAddress , removeAddress , updateAddress , updatePassword , forgetPassword , updateUser , updateSellerInfo, verifyForgetPasswordOtp, putAddressDefault, me, getUserById} = require("../controller/auth.controller");
const {protect} = require("../middleware/protectedRoute");

const authRouter = express.Router();

authRouter.post("/register" , register); // working
authRouter.post("/verifyUserOtp" , verifyUserOtp) // working
authRouter.post("/resendOTP" , resendOTP) // working
authRouter.post("/login" , login) // working
authRouter.post("/logout" , logout) // working

// protected routes
authRouter.get("/getAddresses" , protect , getAddresses) // working
authRouter.post("/putAddressDefault/:addressId" , protect , putAddressDefault) // working
authRouter.post("/addAddress" , protect , addAddress) // working
authRouter.post("/removeAddress/:addressId" , protect , removeAddress) // working
authRouter.post("/updateAddress/:addressId" , protect , updateAddress) // working
authRouter.post("/updatePassword" , protect , updatePassword) // working
authRouter.post("/forgetPassword" , protect , forgetPassword) // working
authRouter.post("/updateUser" , protect , updateUser) // working
authRouter.post("/updateSellerInfo" , protect , updateSellerInfo) // working
authRouter.post("/verifyForgetPasswordOtp" , protect , verifyForgetPasswordOtp) // working
authRouter.get("/me" , protect , me) // working
authRouter.get("/:id" , getUserById) // working

module.exports = authRouter;
