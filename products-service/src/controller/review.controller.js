const productsModel = require("../models/products.model");
const Review = require("../models/review.model");

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
        res.status(201).json({ success: true, data: review , message: "product service - review - addReview - Review added successfully"});
    } catch (error) {
        res.status(500).json({ success: false, message: "product service - review - addReview - " + error.message });
    }
}

const getReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!productId) {
            return res.status(400).json({ success: false, message: "product service - review - getReviews - Product ID is required" });
        }


        // get random 5 reviews
        const reviews = await Review.aggregate([
            { $match: { productId } },
            { $sample: { size: 5 } },

        ]);

        // get user details but it is in auth service so we need to make a request to auth service and merge in reviews
        const users = await axios.get(`http://localhost:3001/auth/${reviews.map(review => review.userId)}`);

        // merge reviews and users
        const mergedReviews = reviews.map(review => {
            const user = users.find(user => user._id === review.userId);
            return {
                ...review,
                user
            }
        });

        res.status(200).json({ success: true, data: mergedReviews , message: "product service - review - getReviews - Reviews fetched successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "product service - review - getReviews - " + error.message });
    }
}

const editReview = async (req, res) => {
    try {
        const { reviewId, rating, comment } = req.body;

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

        await review.remove();

        res.status(200).json({ success: true, message: "product service - review - deleteReview - Review deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "product service - review - deleteReview - " + error.message });
    }
}

module.exports = {addReview , getReviews , editReview , deleteReview}