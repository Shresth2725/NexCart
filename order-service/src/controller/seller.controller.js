const Order = require("../models/order.model");

const getOrders = async (req , res) => {
    try {
        const sellerId = req.user.userId;
        const orders = await Order.find({ "items.sellerId": sellerId });
        
        if(!orders || orders.length === 0){
            return res.status(404).json({ message: "Order-Service - Seller Controller - getOrders - Orders not found" , success: false});
        }
        
        return res.status(200).json({ orders , success: true });
    } catch (error) {
        return res.status(500).json({ message: "Order-Service - Seller Controller - getOrders - Internal Server Error" , success: false});
    }
}

module.exports = { getOrders }