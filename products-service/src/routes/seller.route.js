const express = require("express");
const { authMiddleware } = require("../middleware/auth.middleware");
const { createProduct } = require("../controller/seller.controller");
const { upload } = require("../config/cloudinary");
const sellerCheckMiddleware = require("../middleware/sellerCheck.middleware");

const sellerRoute = express.Router();

sellerRoute.post("/create", authMiddleware, sellerCheckMiddleware, upload.array("images", 10), createProduct);

module.exports = sellerRoute;
