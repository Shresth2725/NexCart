// controller.js
const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const { getChannel } = require("../config/rabbitMQ");
const paymentModel = require("../models/payment.model");

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
      await channel.assertQueue("payment.completed");

      channel.sendToQueue(
        "payment.completed",
        Buffer.from(
          JSON.stringify({
            event: "payment.completed",
            data: { orderId },
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
      await channel.assertQueue("payment.failed");

      channel.sendToQueue(
        "payment.failed",
        Buffer.from(
          JSON.stringify({
            event: "payment.failed",
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

module.exports = {createPayment , verifyPayment}