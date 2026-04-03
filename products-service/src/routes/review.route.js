const express = require('express') ; 
const { authMiddleware } = require('../middleware/auth.middleware');
const { addReview , getReviews, editReview, deleteReview } = require('../controller/review.controller');

const reviewRoute = express.Router() ;

reviewRoute.post("/add", authMiddleware , addReview); // working
reviewRoute.get("/getReviews/:productId", getReviews); // working
reviewRoute.post("/editReview/:reviewId", authMiddleware , editReview); // working
reviewRoute.delete("/deleteReview/:reviewId", authMiddleware , deleteReview); // working


module.exports = reviewRoute ; 