const cartModel = require("../models/cart.model");

// correct the message like "Cart Service - addCartItem - Internal server error" to "Cart Service - addCartItem - Internal server error"

const addCartItem = async (req , res) => {
    try {
        const userId = req.user.id;
        const {productId , quantity} = req.body;
        
        const cart = await cartModel.findOne({ userId });

        if (!cart) {
            // create a cart
            const newCart = new cartModel({
                userId,
                items: [{ productId, quantity }],
                totalPrice: quantity * product.price
            });
            await newCart.save();
            return res.status(201).json({ message: "Cart Service - addCartItem - Cart created successfully", cart: newCart });
        }

        // if cart exists
        const existingItem = cart.items.find(item => item.productId.toString() === productId);

        if (existingItem) {
            existingItem.quantity = quantity;
        } else {
            cart.items.push({ productId, quantity });
        }

        cart.totalPrice = cart.items.reduce((total, item) => total + item.quantity * item.price, 0);
        await cart.save();
        return res.status(200).json({ message: "Cart Service - addCartItem - Cart updated successfully", cart });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Cart Service - addCartItem - Internal server error" });
    }
}

const getCart = async (req , res) => {
    try {
        const userId = req.user.id;
        const cart = await cartModel.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: "Cart Service - getCart - Cart not found" });
        }
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
        return res.status(200).json({ message: "Cart Service - deleteCartItem - Cart updated successfully", cart });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Cart Service - deleteCartItem - Internal server error" });
    }
}

const clearCart = async (req , res) => {
    try {
        const userId = req.user.id;
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