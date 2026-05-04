const express = require("express");
const { authMiddleware } = require("../middleware/auth.middleware");
const { adminCheckMiddleware } = require("../middleware/admin.middleware");
const { toggleProductStatus, getAllProducts, deleteReview, deleteProduct, getAllReviews } = require("../controller/admin.controller");
const adminRoute = express.Router();

adminRoute.post("/toggleProductStatus/:id" , authMiddleware , adminCheckMiddleware , toggleProductStatus) // working
adminRoute.get("/allProducts" , authMiddleware , adminCheckMiddleware , getAllProducts) // working
adminRoute.get("/allReviews" , authMiddleware , adminCheckMiddleware , getAllReviews)
adminRoute.delete("/deleteReview/:id" , authMiddleware , adminCheckMiddleware , deleteReview)
adminRoute.delete("/deleteProduct/:id" , authMiddleware , adminCheckMiddleware , deleteProduct) // working

module.exports = adminRoute;
