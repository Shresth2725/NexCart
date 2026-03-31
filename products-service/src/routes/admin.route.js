const express = require("express");
const { authMiddleware } = require("../middleware/auth.middleware");
const { adminCheckMiddleware } = require("../middleware/admin.middleware");
const { toggleProductStatus, getAllProducts, deleteReview, deleteProduct } = require("../controller/admin.controller");

const adminRoute = express.Router();

adminRoute.post("/toggleProductStatus/:id" , authMiddleware , adminCheckMiddleware , toggleProductStatus)

adminRoute.get("/allProducts" , authMiddleware , adminCheckMiddleware , getAllProducts)

adminRoute.delete("/deleteReview/:id" , authMiddleware , adminCheckMiddleware , deleteReview)

adminRoute.delete("/deleteProduct/:id" , authMiddleware , adminCheckMiddleware , deleteProduct)

module.exports = adminRoute;
