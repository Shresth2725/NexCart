const productsModel = require("../models/products.model");
const { getChannel } = require("../config/rabbitMQ");
const redisClient = require("../config/redis");

const createProduct = async (req, res) => {
    try {

        // clear  cache
        const keys = await redisClient.keys("product:*");
        if (keys.length > 0) await redisClient.del(keys);

        const { name, description, price, category, brand, stock } = req.body;

        if(!name || !description || !price || !category || !brand || !stock) {
            return res.status(400).json({ message: "Products-Service - Seller Route - Create Product API - All fields are required" });
        }

        const product = await productsModel.create({
            name,
            description,
            price,
            category,
            brand,
            stock,
            sellerId: req.user.id,
            images: req.files ? req.files.map((file) => file.path) : [],
            seller: {name: req.user.name, email: req.user.email, storeName:req.user.sellerInfo.storeName , storeDescription:req.user.sellerInfo.storeDescription}
        });

        const channel = getChannel();
        channel.sendToQueue("product_added", Buffer.from(JSON.stringify({ product, email: req.user.email })));

        res.status(201).json({ message: "Products-Service - Seller Route - Create Product API - Product created successfully", product });
    } catch (error) {
        res.status(500).json({ message: "Products-Service - Seller Route - Create Product API - Internal server error", error });
    }
}

const getProducts = async (req, res) => {
    try {
        const products = await productsModel.find({ sellerId: req.user.id });
        if(!products) {
            return res.status(404).json({ message: "Products-Service - Seller Route - Get Products API - No products found" });
        }
        res.status(200).json({ message: "Products-Service - Seller Route - Get Products API - Products fetched successfully", products , count: products.length });
    } catch (error) {
        res.status(500).json({ message: "Products-Service - Seller Route - Get Products API - Internal server error", error });
    }
}

const updateProduct = async (req, res) => {
    try {

        // clear  cache
        const keys = await redisClient.keys("product:*");
        if (keys.length > 0) await redisClient.del(keys);

        const { id } = req.params;
        const { name, description, price, category, brand, stock } = req.body;
        const product = await productsModel.findByIdAndUpdate(id, {
            name,
            description,
            price,
            category,
            brand,
            stock,
            images: req.files ? req.files.map((file) => file.path) : [],
        }, { new: true });
        if(!product) {
            return res.status(404).json({ message: "Products-Service - Seller Route - Update Product API - Product not found" });
        }

        const channel = getChannel();
        channel.sendToQueue("product_updated", Buffer.from(JSON.stringify({ product, email: req.user.email })));

        res.status(200).json({ message: "Products-Service - Seller Route - Update Product API - Product updated successfully", product });
    } catch (error) {
        res.status(500).json({ message: "Products-Service - Seller Route - Update Product API - Internal server error", error });
    }
}

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // clear  cache
        const keys = await redisClient.keys("product:*");
        if (keys.length > 0) await redisClient.del(keys);

        if (!id) {
            return res.status(400).json({ message: "Products-Service - Seller Route - Delete Product API - Product ID is required" });
        }

        const product = await productsModel.findById(id);
        if(!product) {
            return res.status(404).json({ message: "Products-Service - Seller Route - Delete Product API - Product not found" });
        }

        if(product.sellerId !== req.user.id) {
            return res.status(403).json({ message: "Products-Service - Seller Route - Delete Product API - Unauthorized" });
        }

        const channel = getChannel();
        channel.sendToQueue("product_deleted", Buffer.from(JSON.stringify({ product, email: req.user.email })));

        const deletedProduct = await productsModel.findByIdAndDelete(id);
        if(!deletedProduct) {
            return res.status(404).json({ message: "Products-Service - Seller Route - Delete Product API - Product not found" });
        }
        res.status(200).json({ message: "Products-Service - Seller Route - Delete Product API - Product deleted successfully", deletedProduct });
    } catch (error) {
        res.status(500).json({ message: "Products-Service - Seller Route - Delete Product API - Internal server error", error });
    }
}

const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Products-Service - Seller Route - Get Product By ID API - Product ID is required" });
        }
        const product = await productsModel.findById(id);
        if(!product) {
            return res.status(404).json({ message: "Products-Service - Seller Route - Get Product By ID API - Product not found" });
        }
        res.status(200).json({ message: "Products-Service - Seller Route - Get Product By ID API - Product fetched successfully", product });
    } catch (error) {
        res.status(500).json({ message: "Products-Service - Seller Route - Get Product By ID API - Internal server error", error });
    }
}

module.exports = { createProduct, getProducts, updateProduct, deleteProduct, getProductById };