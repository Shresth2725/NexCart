const express = require("express"); 
const { getOrders , getOrderById , updateOrderStatus } = require("../controller/admin.controller");
const {adminCheckMiddleware} = require("../middleware/admin.middleware");
const {authMiddleware} = require("../middleware/authMiddleware");

const adminRouter = express.Router();

adminRouter.get("/orders" , authMiddleware , adminCheckMiddleware , getOrders); //workings
adminRouter.get("/orders/:id" , authMiddleware , adminCheckMiddleware , getOrderById); // working
adminRouter.put("/orders/:id" , authMiddleware , adminCheckMiddleware , updateOrderStatus); // working

module.exports = adminRouter;
