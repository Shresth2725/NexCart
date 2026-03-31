const express = require('express') ; 
const { authMiddleware } = require('../middleware/auth.middleware');
const { addReview , getReviews, editReview } = require('../controller/review.controller');

const reviewRoute = express.Router() ;

reviewRoute.post("/add", authMiddleware , addReview);
reviewRoute.get("/getReviews/:productId", getReviews);
reviewRoute.put("/editReview", authMiddleware , editReview);
reviewRoute.delete("/deleteReview/:reviewId", authMiddleware , deleteReview);


module.exports = reviewRoute ; 