const express = require("express");
const { randomProductSuggestion , getProductById, searchProducts } = require("../controller/customer.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

const customerRoute = express.Router(); 

customerRoute.get("/randomProductSuggestion", authMiddleware, randomProductSuggestion);

customerRoute.get("/product/:id" , authMiddleware , getProductById)

customerRoute.get("/search" , authMiddleware , searchProducts)

module.exports = customerRoute;