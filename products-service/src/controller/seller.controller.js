const productsModel = require("../models/products.model");

const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, brand, stock } = req.body;

        if(!name || !description || !price || !category || !brand || !stock) {
            return res.status(400).json({ message: "All fields are required" });
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

        res.status(201).json({ message: "Product created successfully", product });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error });
    }
}

module.exports = { createProduct };