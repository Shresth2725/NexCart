const orderModel = require("../models/order.model");
const {getChannel} = require("../config/rabbitMQ");

const getOrders = async (req , res) => {
    try {
        const orders = await orderModel.find();
        if(!orders){
            return res.status(404).json({ message: "Order-Service - Admin Controller - getOrders - Orders not found" , success: false});
        }
        return res.status(200).json({count: orders.length ,  orders , success: true });
    } catch (error) {
        return res.status(500).json({ message: "Order-Service - Admin Controller - getOrders - Internal Server Error" , success: false});
    }
}

const getOrderById = async (req , res) => {
    try {
        const { id } = req.params;
        if(!id){
            return res.status(400).json({ message: "Order-Service - Admin Controller - getOrderById - Order ID is required" , success: false});
        }
        const order = await orderModel.findById(id);
        if(!order){
            return res.status(404).json({ message: "Order-Service - Admin Controller - getOrderById - Order not found" , success: false});
        }
        return res.status(200).json({ order , success: true });
    } catch (error) {
        return res.status(500).json({ message: "Order-Service - Admin Controller - getOrderById - Internal Server Error" , success: false});
    }
}

const updateOrderStatus = async (req , res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if(!id){
            return res.status(400).json({ message: "Order-Service - Admin Controller - updateOrderStatus - Order ID is required" , success: false});
        }
        if(!status){
            return res.status(400).json({ message: "Order-Service - Admin Controller - updateOrderStatus - Status is required" , success: false});
        }
        const order = await orderModel.findById(id);
        if(!order){
            return res.status(404).json({ message: "Order-Service - Admin Controller - updateOrderStatus - Order not found" , success: false});
        }

        if (order.status === status) {
            return res.status(400).json({ message: "Order-Service - Admin Controller - updateOrderStatus - Order is already in this status" , success: false});
        }
            
        order.status = status;

        if (status === "delivered") {
            const channel = getChannel ();
            channel.sendToQueue(
                "order_delivered",
                Buffer.from(JSON.stringify(order))
            );
        }

        if (status === "cancelled") {
            const channel = getChannel ();
            channel.sendToQueue(
                "order_cancelled",
                Buffer.from(JSON.stringify(order))
            );
        }

        await order.save();
        return res.status(200).json({ order , success: true });
    } catch (error) {
        return res.status(500).json({ message: "Order-Service - Admin Controller - updateOrderStatus - Internal Server Error" , success: false});
    }
}

module.exports = { getOrders , getOrderById , updateOrderStatus };