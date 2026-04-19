const express = require("express") ; 
const { authMiddleware } = require("../middleware/authMiddleware");
const sellerCheckMiddleware = require("../middleware/seller.middlware");
const { getOrders } = require("../controller/seller.controller");

const sellerRouter = express.Router() ; 

sellerRouter.get("/" ,authMiddleware, sellerCheckMiddleware, getOrders);



module.exports = sellerRouter ; 
