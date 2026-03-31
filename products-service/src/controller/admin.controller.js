const Product = require("../models/products.model");

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

module.exports = {
    toggleProductStatus,
    getAllProducts
}