const cartModel = require("../models/cart.model");
const axios = require("axios");
const redisClient = require("../config/redis");

// correct the message like "Cart Service - addCartItem - Internal server error" to "Cart Service - addCartItem - Internal server error"

const addCartItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity } = req.body;

        const cart = await cartModel.findOne({ userId });

        const response = await axios.get(`${process.env.PRODUCTS_SERVICE_URL}/product/${productId}`);
        const product = response.data.product;

        if (!product) {
            return res.status(404).json({ message: "Cart Service - addCartItem - Product not found" });
        }

        const price = product.price;

        if (!cart) {
            const newCart = new cartModel({
                userId,
                items: [{ productId, quantity, price }],
                totalPrice: quantity * price
            });

            await newCart.save();
            await redisClient.del(`cart:${userId}`);
            return res.status(201).json({
                message: "Cart Service - addCartItem - Cart created successfully",
                cart: newCart
            });
        }

        const existingItem = cart.items.find(
            item => item.productId.toString() === productId
        );

        if (existingItem) {
            existingItem.quantity = quantity;
        } else {
            cart.items.push({ productId, quantity, price });
        }

        cart.totalPrice = cart.items.reduce(
            (total, item) => total + item.quantity * item.price,
            0
        );

        await cart.save();
        await redisClient.del(`cart:${userId}`);

        return res.status(200).json({
            message: "Cart Service - addCartItem - Cart updated successfully",
            cart
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Cart Service - addCartItem - Internal server error - " + error.message
        });
    }
};

const getCart = async (req, res) => {
    try {
        const userId = req.user.id;

        // check in redis first 
        const redisCart = await redisClient.get(`cart:${userId}`);
        if (redisCart) {
            return res.status(200).json({ message: "Cart Service - getCart - Cart found successfully", cart : JSON.parse(redisCart) });
        }

        const cart = await cartModel.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: "Cart Service - getCart - Cart not found" });
        }

        // set in redis
        await redisClient.setEx(`cart:${userId}`, 60 * 60 * 24, JSON.stringify(cart));

        return res.status(200).json({ message: "Cart Service - getCart - Cart found successfully", cart });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Cart Service - getCart - Internal server error" });
    }
}

const updateCartItem = async (req , res) => {
    try {
        const userId = req.user.id;
        const {productId , quantity} = req.body;
        
        const cart = await cartModel.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: "Cart Service - updateCartItem - Cart not found" });
        }
        const existingItem = cart.items.find(item => item.productId.toString() === productId);
        if (!existingItem) {
            return res.status(404).json({ message: "Cart Service - updateCartItem - Item not found in cart" });
        }
        existingItem.quantity = quantity;
        cart.totalPrice = cart.items.reduce((total, item) => total + item.quantity * item.price, 0);
        await cart.save();

        // set in redis
        await redisClient.del(`cart:${userId}`);

        return res.status(200).json({ message: "Cart Service - updateCartItem - Cart updated successfully", cart });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Cart Service - updateCartItem - Internal server error" });
    }
}

const deleteCartItem = async (req , res) => {
    try {
        const userId = req.user.id;
        const {productId} = req.body;

        // clear cache
        await redisClient.del(`cart:${userId}`);
        
        const cart = await cartModel.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: "Cart Service - deleteCartItem - Cart not found" });
        }
        const existingItem = cart.items.find(item => item.productId.toString() === productId);
        if (!existingItem) {
            return res.status(404).json({ message: "Cart Service - deleteCartItem - Item not found in cart" });
        }
        cart.items = cart.items.filter(item => item.productId.toString() !== productId);
        cart.totalPrice = cart.items.reduce((total, item) => total + item.quantity * item.price, 0);
        await cart.save();

        // set in redis
        await redisClient.del(`cart:${userId}`);
        return res.status(200).json({ message: "Cart Service - deleteCartItem - Cart updated successfully", cart });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Cart Service - deleteCartItem - Internal server error" });
    }
}

const clearCart = async (req , res) => {
    try {
        const userId = req.user.id;

        // clear cache
        await redisClient.del(`cart:${userId}`);
        
        const cart = await cartModel.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }
        cart.items = [];
        cart.totalPrice = 0;
        await cart.save();
        return res.status(200).json({ message: "Cart cleared successfully", cart });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Cart Service - clearCart - Internal server error" });
    }
}

module.exports = {addCartItem , getCart , updateCartItem , deleteCartItem , clearCart}