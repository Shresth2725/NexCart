const express = require("express"); 
const { getOrders , getOrderById , updateOrderStatus } = require("../controller/admin.controller");

const adminRouter = express.Router();

adminRouter.get("/orders" , getOrders);
adminRouter.get("/orders/:id" , getOrderById);
adminRouter.put("/orders/:id" , updateOrderStatus);

module.exports = adminRouter;
