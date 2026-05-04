// controller.js
const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const { getChannel } = require("../config/rabbitMQ");
const paymentModel = require("../models/payment.model");
const axios = require("axios");

const createPayment = async (req, res) => {
  try {
    const { orderId, amount } = req.body;
    const { userId } = req.user;

    if (!orderId || !amount) {
      return res.status(400).json({ message: "Payment Service - payment controller - createPayment - Missing fields" });
    }

    // create razorpay order
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: orderId,
      notes: { orderId },
    };

    const rpOrder = await razorpay.orders.create(options);

    // save in DB
    await paymentModel.create({
      orderId,
      userId,
      amount,
      status: "pending",
      razorpayOrderId: rpOrder.id,
    });

    res.json({
      success: true,
      razorpayOrder: rpOrder,
      message: "Payment Service - payment controller - createPayment - Payment created successfully",
    });

  } catch (error) {
    console.log("Create Payment Error:", error);
    res.status(500).json({ message: "Payment Service - payment controller - createPayment - Internal error" });
  }
};

const verifyPayment = async (req, res) => {
  try {
    console.log("Webhook HIT");
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    const signature = req.headers["x-razorpay-signature"];
    const body = JSON.stringify(req.body);

    const expected = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (signature !== expected) {
      return res.status(400).json({ message: "Payment Service - payment controller - verifyPayment - Invalid signature", success: false });
    }

    const event = req.body.event;

    // SUCCESS
    if (event === "payment.captured") {
      const paymentEntity = req.body.payload.payment.entity;

      const orderId = paymentEntity.notes.orderId;
      const razorpayOrderId = paymentEntity.order_id;

      await paymentModel.findOneAndUpdate(
        { razorpayOrderId },
        {
          status: "completed",
          transactionId: paymentEntity.id,
          paymentMethod: paymentEntity.method,
        }
      );

      // send event to RabbitMQ
      const channel = getChannel();
      await channel.assertQueue("payment_completed");

      channel.sendToQueue(
        "payment_completed",
        Buffer.from(
          JSON.stringify({
            event: "payment_completed",
            data: { orderId , email: req.user.email },
          })
        )
      );

      console.log("Payment SUCCESS:", orderId);
    }

    // FAILURE
    if (event === "payment.failed") {
      const paymentEntity = req.body.payload.payment.entity;

      const razorpayOrderId = paymentEntity.order_id;

      await paymentModel.findOneAndUpdate(
        { razorpayOrderId },
        {
          status: "failed",
          failureReason: paymentEntity.error_description,
        }
      );

      const channel = getChannel();
      await channel.assertQueue("payment_failed");

      channel.sendToQueue(
        "payment_failed",
        Buffer.from(
          JSON.stringify({
            event: "payment_failed",
            data: { orderId: paymentEntity.notes.orderId },
          })
        )
      );

      console.log("Payment FAILED:", paymentEntity.notes.orderId);
    }

    res.json({ status: "ok" , message: "Payment Service - payment controller - verifyPayment - Payment verified successfully" , success: true });

  } catch (error) {
    console.log("Webhook Error:", error);
    res.status(500).json({ message: "Payment Service - payment controller - verifyPayment - Internal error" , success: false });
  }
};

const verifyClientPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, orderId } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !orderId) {
      return res.status(400).json({ message: "Missing required fields", success: false });
    }

    // Verify signature
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      // Update payment as failed
      await paymentModel.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: "failed", failureReason: "Signature verification failed" }
      );
      return res.status(400).json({ message: "Payment verification failed", success: false });
    }

    // Update payment as completed
    await paymentModel.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        status: "completed",
        transactionId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      }
    );

    // Update order paymentStatus via order-service
    try {
      await axios.post(
        `${process.env.ORDER_SERVICE_URL || 'http://order-service:3005'}/user/updatePaymentStatus`,
        { orderId, paymentStatus: "completed" }
      );
    } catch (orderErr) {
      console.log("Failed to update order payment status:", orderErr.message);
    }

    // Send event to RabbitMQ
    try {
      const channel = getChannel();
      await channel.assertQueue("payment_completed");
      channel.sendToQueue(
        "payment_completed",
        Buffer.from(JSON.stringify({
          event: "payment_completed",
          data: { orderId, email: req.user.email },
        }))
      );
    } catch (mqErr) {
      console.log("RabbitMQ event failed:", mqErr.message);
    }

    res.json({ success: true, message: "Payment verified and completed" });

  } catch (error) {
    console.log("Client Payment Verify Error:", error);
    res.status(500).json({ message: "Payment verification internal error", success: false });
  }
};

module.exports = {createPayment , verifyPayment , verifyClientPayment}