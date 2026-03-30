const express = require("express");
const { authMiddleware } = require("../middleware/auth.middleware");
const { createProduct, getProducts, updateProduct, deleteProduct } = require("../controller/seller.controller");
const { upload } = require("../config/cloudinary");
const sellerCheckMiddleware = require("../middleware/sellerCheck.middleware");

const sellerRoute = express.Router();

sellerRoute.post("/create", authMiddleware, sellerCheckMiddleware, upload.array("images", 10), createProduct);
sellerRoute.get("/products", authMiddleware, sellerCheckMiddleware, getProducts);
sellerRoute.post("/update-product/:id" , authMiddleware, sellerCheckMiddleware, upload.array("images", 10), updateProduct);
sellerRoute.post("/delete-product/:id" , authMiddleware, sellerCheckMiddleware, deleteProduct);

module.exports = sellerRoute;
