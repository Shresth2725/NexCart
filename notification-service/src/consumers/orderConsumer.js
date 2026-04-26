const { getChannel } = require("../config/rabbitmq");
const { sendOrderCancelledEmail, sendOrderDeliveredEmail } = require("../services/emailService");
const axios = require("axios");

async function startOrderConsumer() {
    const channel = getChannel();
    channel.prefetch(1);
    channel.consume("order_cancelled", async (msg) => {
        if (!msg) return;
        try {
            const order = JSON.parse(msg.content.toString());
            console.log("Notification Service - Order Consumer - startOrderConsumer - Order details" , order);

            const user = await axios.get(`${process.env.AUTH_SERVICE_URL}/auth/${order.userId}`);

            if (!user.data.success) {
                throw new Error("Notification Service - Order Consumer - cancelledOrderConsumer - User not found");
            }

            const email = user.data.user.email;

            const result = await sendOrderCancelledEmail(email, order);

            if (!result.success) {
                throw new Error("Notification Service - Order Consumer - cancelledOrderConsumer - Email sending failed");
            }

            console.log("Notification Service - Order Consumer - cancelledOrderConsumer - Order confirmation email sent to " + email);
            channel.ack(msg);



        } catch (error) {
            console.log("Notification Service - Order Consumer - cancelledOrderConsumer - Error" , error);
        }
    })

    channel.consume("order_delivered", async (msg) => {
        if (!msg) return;
        try {
            const order = JSON.parse(msg.content.toString());
            console.log("Notification Service - Order Consumer - startOrderConsumer - Order details" , order);

            const user = await axios.get(`${process.env.AUTH_SERVICE_URL}/auth/${order.userId}`);

            if (!user.data.success) {
                throw new Error("Notification Service - Order Consumer - deliveredOrderConsumer - User not found");
            }

            const email = user.data.user.email;

            const result = await sendOrderDeliveredEmail(email, order);

            if (!result.success) {
                throw new Error("Notification Service - Order Consumer - deliveredOrderConsumer - Email sending failed");
            }

            console.log("Notification Service - Order Consumer - deliveredOrderConsumer - Order confirmation email sent to " + email);
            channel.ack(msg);



        } catch (error) {
            console.log("Notification Service - Order Consumer - deliveredOrderConsumer - Error" , error);
        }
    })

}

module.exports = { startOrderConsumer };