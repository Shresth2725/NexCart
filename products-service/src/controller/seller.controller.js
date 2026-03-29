const productsModel = require("../models/products.model");
const { getChannel } = require("../config/rabbitMQ");

const createProduct = async (req, res) => {
    try {
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
            seller: {name: req.user.name, storeName:req.user.sellerInfo.storeName , storeDescription:req.user.sellerInfo.storeDescription}
        });

        const channel = getChannel();
        channel.sendToQueue("product_added", Buffer.from(JSON.stringify(product)));

        res.status(201).json({ message: "Products-Service - Seller Route - Create Product API - Product created successfully", product });
    } catch (error) {
        res.status(500).json({ message: "Products-Service - Seller Route - Create Product API - Internal server error", error });
    }
}

module.exports = { createProduct };