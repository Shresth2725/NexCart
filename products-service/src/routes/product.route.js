const express = require("express");
const { getProductById } = require("../controller/product.controller");

const productRoute = express.Router();

productRoute.get("/:id", getProductById);

module.exports = productRoute;
