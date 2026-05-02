const Product = require("../models/products.model");
const redisClient = require("../config/redis");

const randomProductSuggestion = async (req, res) => {
    try {
        const count = parseInt(req.query.count) || 10;
        
        const products = await Product.aggregate([
            { $match: { isActive: true } },
            { $sample: { size: count } }
        ]);

        return res.status(200).json({
            success: true,
            data: products,
            message: "Products Service - Customer Controller - randomProductSuggestion - Random products fetched successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Products Service - Customer Controller - randomProductSuggestion - " + error.message,
        });
    }
};

const getProductById = async (req , res) => {
    try {
        const productId = req.params.id;
        const cachedProduct = await redisClient.get(`product:${productId}`);
        if (cachedProduct) {
            return res.status(200).json({
                success: true,
                data: JSON.parse(cachedProduct),
                message: "Products-Service - Customer Controller - getProductById - Product fetched successfully from cache",
            });
        }
        const product = await Product.findById(productId);
        if(!product){
            return res.status(404).json({
                success: false,
                message: "Products-Service - Customer Controller - getProductById - Product not found",
            });
        }
        await redisClient.setEx(`product:${productId}`, 3600, JSON.stringify(product));

        return res.status(200).json({
            success: true,
            data: product,
            message: "Products Service - Customer Controller - getProductById - Product fetched successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Products Service - Customer Controller - getProductById - " + error.message,
        });
    }
};

const filterProducts = async (req, res) => {
    try {
        let { brand, category, priceRange, rating, sort, page = 1, limit = 10 } = req.query;


        const cacheKey = JSON.stringify({ brand, category, priceRange, rating, sort, page, limit });
        const cachedProduct = await redisClient.get(`product:${cacheKey}`);
        if (cachedProduct) {
            return res.status(200).json({
                success: true,
                data: JSON.parse(cachedProduct),
                message: "Products-Service - Customer Controller - filterProducts - Products fetched successfully from cache",
            });
        }


        // convert types
        page = parseInt(page);
        limit = parseInt(limit);
        sort = sort === "desc" ? -1 : 1;

        const query = {};

        // dynamic filters
        if (brand) query.brand = brand;
        if (category) query.category = category;

        // price range (expects: priceRange[min]=100&priceRange[max]=500)
        if (priceRange?.min || priceRange?.max) {
            query.price = {};
            if (priceRange.min) query.price.$gte = Number(priceRange.min);
            if (priceRange.max) query.price.$lte = Number(priceRange.max);
        }

        // rating filter
        if (rating) {
            query.rating = { $gte: Number(rating) };
        }

        const products = await Product.find(query)
            .sort({ price: sort })
            .skip((page - 1) * limit)
            .limit(limit);

        await redisClient.setEx(`product:${cacheKey}`, 3600, JSON.stringify(products));

        return res.status(200).json({
            success: true,
            data: products,
            message: "Products fetched successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const searchProducts = async (req, res) => {
    try {
        const { query } = req.query;

        const cacheKey = JSON.stringify({ query });
        const cachedProduct = await redisClient.get(`product:${cacheKey}`);
        if (cachedProduct) {
            return res.status(200).json({
                success: true,
                data: JSON.parse(cachedProduct),
                message: "Products-Service - Customer Controller - searchProducts - Products fetched successfully from cache",
            });
        }

        const products = await Product.find({
            $text: { $search: query }
        });

        if (!products) {
            return res.status(404).json({
                success: false,
                message: "Products-Service - Customer Controller - searchProducts - No products found",
            });
        }

        await redisClient.setEx(`product:${cacheKey}`, 3600, JSON.stringify(products));

        return res.status(200).json({
            success: true,
            data: products,
            message: "Products Service - Customer Controller - searchProducts - Products searched successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Products Service - Customer Controller - searchProducts - " + error.message,
        });
    }
};

module.exports = {
    randomProductSuggestion,
    getProductById,
    filterProducts,
    searchProducts
};