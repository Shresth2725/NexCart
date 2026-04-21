// models/Payment.js
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      index: true,
    },

    userId: {
      type: String,
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "INR",
    },

    paymentMethod: {
      type: String, // card, upi, netbanking
    },

    status: {
      type: String,
      enum: ["created", "pending", "completed", "failed"],
      default: "created",
      index: true,
    },

    transactionId: {
      type: String, // Razorpay payment_id
    },

    razorpayOrderId: {
      type: String, // Razorpay order_id
    },

    razorpaySignature: {
      type: String,
    },

    failureReason: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);