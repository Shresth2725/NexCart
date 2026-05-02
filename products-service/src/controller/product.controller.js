const productModel = require("../models/products.model");
const redisClient = require("../config/redis");

const getProductById = async (req , res) => {
    try {

        
        const cachedProduct = await redisClient.get(`product:${req.params.id}`);
        if (cachedProduct) {
            return res.status(200).json({
                success: true,
                data: JSON.parse(cachedProduct),
                message: "Products-Service - Product Route - Get Product By ID API - Product fetched successfully from cache",
            });
        }
        const productId = req.params.id;
        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        await redisClient.setEx(`product:${productId}`, 3600, JSON.stringify(product));

        return res.status(200).json({ message: "Product found successfully", product });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {getProductById}