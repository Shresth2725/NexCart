const express = require("express") ; 
const { addCartItem, getCart, updateCartItem, deleteCartItem } = require("../controller/customer.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

const customerCartRouter = express.Router();

customerCartRouter.post("/add", authMiddleware, addCartItem);
customerCartRouter.get("/", authMiddleware, getCart);
customerCartRouter.put("/update", authMiddleware, updateCartItem);
customerCartRouter.delete("/delete", authMiddleware, deleteCartItem);


module.exports = customerCartRouter ;
