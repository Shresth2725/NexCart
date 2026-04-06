const express = require("express");
const { randomProductSuggestion , getProductById, searchProducts, filterProducts } = require("../controller/customer.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

const customerRoute = express.Router(); 

customerRoute.get("/randomProductSuggestion", authMiddleware, randomProductSuggestion); // working

customerRoute.get("/product/:id" , authMiddleware , getProductById) // working

customerRoute.get("/filter" , authMiddleware , filterProducts) // working

customerRoute.get("/search" , authMiddleware , searchProducts) // working

module.exports = customerRoute; 