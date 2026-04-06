const { getChannel } = require("../config/rabbitMQ");
const Product = require("../models/products.model");
const Review = require("../models/review.model");

const toggleProductStatus = async (req , res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);
        if(!product){
            return res.status(404).json({
                success: false,
                message: "Products-Service - Admin Controller - toggleProductStatus - Product not found",
            });
        }
        product.isActive = !product.isActive;
        await product.save();

        // publish event to rabbitmq
        const channel = getChannel();
        channel.sendToQueue("product_status_updated", Buffer.from(JSON.stringify({product , email: product.seller.email})));

        return res.status(200).json({
            success: true,
            data: product,
            message: "Products-Service - Admin Controller - toggleProductStatus - Product status toggled successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Products-Service - Admin Controller - toggleProductStatus - " + error.message,
        });
    }
}

const getAllProducts = async (req , res) => {
    try {
        const products = await Product.find();
        if (!products){
            return res.status(404).json({
                success: false,
                message: "Products-Service - Admin Controller - getAllProducts - Products not found",
            });
        }
        return res.status(200).json({
            success: true,
            data: products,
            message: "Products-Service - Admin Controller - getAllProducts - Products fetched successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Products-Service - Admin Controller - getAllProducts - " + error.message,
        });
    }
}

const deleteReview = async (req , res) => {
    try {
        const reviewId = req.params.id;
        const review = await Review.findById(reviewId);
        if(!review){
            return res.status(404).json({
                success: false,
                message: "Products-Service - Admin Controller - deleteReview - Review not found",
            });
        }
        await Review.findByIdAndDelete(reviewId);

        // publish event to rabbitmq
        const channel = getChannel();
        channel.sendToQueue("review_deleted", Buffer.from(JSON.stringify({review , email: req.user.email})));

        return res.status(200).json({
            success: true,
            message: "Products-Service - Admin Controller - deleteReview - Review deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Products-Service - Admin Controller - deleteReview - " + error.message,
        });
    }
}

const deleteProduct = async (req , res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);
        if(!product){
            return res.status(404).json({
                success: false,
                message: "Products-Service - Admin Controller - deleteProduct - Product not found",
            });
        }
        await Product.findByIdAndDelete(productId);

        // publish event to rabbitmq
        const channel = getChannel();
        channel.sendToQueue("product_deleted_by_admin", Buffer.from(JSON.stringify({product , email: req.user.email})));

        return res.status(200).json({
            success: true,
            message: "Products-Service - Admin Controller - deleteProduct - Product deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Products-Service - Admin Controller - deleteProduct - " + error.message,
        });
    }
}

module.exports = {
    toggleProductStatus,
    getAllProducts,
    deleteReview,
    deleteProduct
}