const express = require("express"); 
const { getOrders , getOrderById , updateOrderStatus } = require("../controller/admin.controller");
const {adminCheckMiddleware} = require("../middleware/admin.middleware");
const {authMiddleware} = require("../middleware/auth.middleware");

const adminRouter = express.Router();

adminRouter.get("/orders" , authMiddleware , adminCheckMiddleware , getOrders);
adminRouter.get("/orders/:id" , authMiddleware , adminCheckMiddleware , getOrderById);
adminRouter.put("/orders/:id" , authMiddleware , adminCheckMiddleware , updateOrderStatus);

module.exports = adminRouter;
