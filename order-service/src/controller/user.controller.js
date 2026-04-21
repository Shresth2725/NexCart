const orderModel = require("../models/order.model");
const {getChannel} = require("../config/rabbitMQ");

const createOrder = async (req, res) => {
  const { items, totalAmount, addressId } = req.body;
  const {userId , email} = req.user;

  try {

    if (!userId || !items || !totalAmount || !addressId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const response = await axios.get(
    `${process.env.USER_SERVICE_URL}/users/${userId}/address/${addressId}`
    );

    if (!response.data.success) {
      return res.status(400).json({ message: "Address not found" });
    }

    const address = response.data.address;
 
    const order = await orderModel.create({
    userId,
    items,
    totalAmount,
    shippingAddress: address,
  });

  const eventPayload = {
      event: "order_created",
      data: {
        orderId: order._id,
        userId,
        email,
        totalAmount,
      },
    };

  const channel = getChannel();
  channel.sendToQueue(
    "order_created",
    Buffer.from(JSON.stringify(eventPayload))
  );

  res.json(order);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getOrders = async (req, res) => {
  try {
    const {userId} = req.user;
    const orders = await orderModel.find({userId});
    if (!orders) {
      return res.status(404).json({message : "Order-Service - Order Route - Get Orders API - Orders not found" , success : false})
    }
    return res.status(200).json({message : "Order-Service - Order Route - Get Orders API - Orders fetched successfully" , success : true , orders})
  } catch (error) {
    return res.status(500).json({message : `Order-Service - Order Route - Get Orders API - ${error.message}` , success : false})
  }
}

const getOrderById = async (req, res) => {
  try {
    const {orderId} = req.params;
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({message : "Order-Service - Order Route - Get Order By Id API - Order not found" , success : false})
    }
    return res.status(200).json({message : "Order-Service - Order Route - Get Order By Id API - Order fetched successfully" , success : true , order})
  } catch (error) {
    return res.status(500).json({message : `Order-Service - Order Route - Get Order By Id API - ${error.message}` , success : false})
  }
}

const cancelOrder = async (req, res) => {
  try {
    const {orderId} = req.params;
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({message : "Order-Service - Order Route - Cancel Order API - Order not found" , success : false})
    }

    if (order.userId !== req.user.userId) {
      return res.status(403).json({message : "Order-Service - Order Route - Cancel Order API - Unauthorized" , success : false})
    }

    if (order.status !== "created") {
      return res.status(400).json({message : "Order-Service - Order Route - Cancel Order API - Order cannot be cancelled" , success : false})
    }
    order.status = "cancelled";
    await order.save();

    const channel = getChannel();
    channel.sendToQueue(
      "order_cancelled",
      Buffer.from(JSON.stringify(order))
    );
    return res.status(200).json({message : "Order-Service - Order Route - Cancel Order API - Order cancelled successfully" , success : true , order})
  } catch (error) {
    return res.status(500).json({message : `Order-Service - Order Route - Cancel Order API - ${error.message}` , success : false})
  }
}

module.exports = { createOrder , getOrders , getOrderById , cancelOrder };