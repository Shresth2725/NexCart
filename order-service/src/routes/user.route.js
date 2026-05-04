const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { createOrder, getOrders, getOrderById, cancelOrder, updatePaymentStatus } = require("../controller/user.controller");

const userRouter = express.Router();

userRouter.post("/", authMiddleware, createOrder); // working
userRouter.get("/", authMiddleware, getOrders); // working
userRouter.get("/:orderId", getOrderById); // working
userRouter.post("/cancel/:orderId" , authMiddleware , cancelOrder); // working
userRouter.post("/updatePaymentStatus", updatePaymentStatus); // internal service call

module.exports = userRouter;