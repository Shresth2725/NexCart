const productsModel = require("../models/products.model");
const Review = require("../models/review.model");
const axios = require("axios");
const redisClient = require("../config/redis");
const addReview = async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;

        if (!productId || !rating || !comment) {
            return res.status(400).json({ success: false, message: "product service - review - addReview - All fields are required" });
        }

        const userId = req.user.id;

        const product = await productsModel.findById(productId);

        if (!product) {
            return res.status(404).json({ success: false, message: " product service - review - addReview - Product not found" });
        }

        const existingReview = await Review.findOne({ productId, userId });
        
        if (existingReview) {
            return res.status(400).json({ success: false, message: "product service - review - addReview - You have already reviewed this product" });
        }

        const review = await Review.create({ productId, userId, rating, comment });
        
        // delete the cache
        await redisClient.del(`review:${JSON.stringify({ productId })}`);

        res.status(201).json({ success: true, data: review , message: "product service - review - addReview - Review added successfully"});
    } catch (error) {
        res.status(500).json({ success: false, message: "product service - review - addReview - " + error.message });
    }
}

const getReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        const cacheKey = JSON.stringify({ productId });
        const cachedProduct = await redisClient.get(`review:${cacheKey}`);
        if (cachedProduct) {
            return res.status(200).json({
                success: true,
                data: JSON.parse(cachedProduct),
                message: "Products-Service - review service - getReviews - Reviews fetched successfully from cache",
            });
        }

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });
        }

        // 🎯 Get all reviews
        const reviews = await Review.find({ productId })
            .select("userId rating comment createdAt");

        await redisClient.setEx(`review:${cacheKey}`, 3600, JSON.stringify(reviews));

        return res.status(200).json({
            success: true,
            data: reviews,
            message: "All reviews fetched successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "getReviews error: " + error.message
        });
    }
};

const editReview = async (req, res) => {
    try {
        console.log(req.body);
        const {rating, comment } = req.body;
        const {reviewId} = req.params;

        if (!reviewId || !rating || !comment) {
            return res.status(400).json({ success: false, message: "product service - review - editReview - All fields are required" });
        }

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({ success: false, message: "product service - review - editReview - Review not found" });
        }

        if (review.userId !== req.user.id) {
            return res.status(403).json({ success: false, message: "product service - review - editReview - You are not authorized to edit this review" });
        }

        review.rating = rating;
        review.comment = comment;
        await review.save();

        // delete the cache
        await redisClient.del(`review:${JSON.stringify({ productId: review.productId })}`);

        res.status(200).json({ success: true, data: review, message: "product service - review - editReview - Review updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "product service - review - editReview - " + error.message });
    }
}

const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        if (!reviewId) {
            return res.status(400).json({ success: false, message: "product service - review - deleteReview - Review ID is required" });
        }   

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({ success: false, message: "product service - review - deleteReview - Review not found" });
        }

        if (review.userId !== req.user.id) {
            return res.status(403).json({ success: false, message: "product service - review - deleteReview - You are not authorized to delete this review" });
        }

        await Review.findByIdAndDelete(reviewId);

        // delete the cache
        await redisClient.del(`review:${JSON.stringify({ productId: review.productId })}`);

        res.status(200).json({ success: true, message: "product service - review - deleteReview - Review deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "product service - review - deleteReview - " + error.message });
    }
}

module.exports = {addReview , getReviews , editReview , deleteReview}