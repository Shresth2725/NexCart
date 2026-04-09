const express = require("express") ; 
const { addCartItem, getCart, updateCartItem, deleteCartItem, clearCart } = require("../controller/customer.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

const customerCartRouter = express.Router();

customerCartRouter.post("/add", authMiddleware, addCartItem); // working
customerCartRouter.get("/", authMiddleware, getCart); // working
customerCartRouter.put("/update", authMiddleware, updateCartItem); // working
customerCartRouter.delete("/delete", authMiddleware, deleteCartItem); // working
customerCartRouter.delete("/clear", authMiddleware, clearCart); // working

module.exports = customerCartRouter ;
