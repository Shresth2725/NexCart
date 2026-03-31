const express = require("express");
const { authMiddleware } = require("../middleware/auth.middleware");
const { createProduct, getProducts, updateProduct, deleteProduct, getProductById } = require("../controller/seller.controller");
const { upload } = require("../config/cloudinary");
const sellerCheckMiddleware = require("../middleware/sellerCheck.middleware");

const sellerRoute = express.Router();

sellerRoute.post("/create", authMiddleware, sellerCheckMiddleware, upload.array("images", 10), createProduct); // working
sellerRoute.get("/products", authMiddleware, sellerCheckMiddleware, getProducts); // working
sellerRoute.post("/update-product/:id" , authMiddleware, sellerCheckMiddleware, upload.array("images", 10), updateProduct); // working
sellerRoute.post("/delete-product/:id" , authMiddleware, sellerCheckMiddleware, deleteProduct); // working
sellerRoute.get("/product/:id", authMiddleware, sellerCheckMiddleware, getProductById); // working

module.exports = sellerRoute;
