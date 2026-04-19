const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { createOrder, getOrders, getOrderById, cancelOrder } = require("../controller/user.controller");

const userRouter = express.Router();

userRouter.post("/", authMiddleware, createOrder);
userRouter.get("/", authMiddleware, getOrders);
userRouter.get("/:orderId", getOrderById);
userRouter.post("/cancel/:orderId" , authMiddleware , cancelOrder);

module.exports = userRouter;