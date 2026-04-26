const {getChannel} = require("../config/rabbitmq") ; 
const { sendPaymentFailedEmail, sendPaymentSuccessEmail } = require("../services/emailService");

async function startPaymentConsumer() {
    const channel = getChannel() ;
    
    channel.consume("payment_completed" , async (msg) => {
        if(!msg) return ;
        try {
            const data = JSON.parse(msg.content.toString()) ;
            
            if(!data.orderId || !data.email) {
                console.error("Notification Service - Queue - payment_completed - Malformed message received", data);
                channel.ack(msg);
                return;
            }

            const order = await axios.get(`${process.env.ORDER_SERVICE_URL}/order/${data.orderId}`);

            console.log("Notification Service - Queue - payment_completed - Order fetched successfully", order.data.order);
            
            const result = await sendPaymentSuccessEmail(data.email, order.data.order);
            if (result.success) {
                console.log("Notification Service - Queue - payment_completed - Email sent for " + data.orderId);
                channel.ack(msg);
            } else {
                throw new Error("Notification Service - Queue - payment_completed - Email sending failed");
            }
        } catch (error) {
            console.error("Notification Service - Queue - payment_completed - Error processing message:", error.message);
            channel.nack(msg, false, false);
        }
    })

    channel.consume("payment_failed" , async (msg) => {
        if(!msg) return ;
        try {
            const data = JSON.parse(msg.content.toString()) ;
            
            if(!data.orderId || !data.email) {
                console.error("Notification Service - Queue - payment_failed - Malformed message received", data);
                channel.ack(msg);
                return;
            }

            const order = await axios.get(`${process.env.ORDER_SERVICE_URL}/order/${data.orderId}`);

            console.log("Notification Service - Queue - payment_failed - Order fetched successfully", order.data.order);
            
            const result = await sendPaymentFailedEmail(data.email, order.data.order);
            if (result.success) {
                console.log("Notification Service - Queue - payment_failed - Email sent for " + data.orderId);
                channel.ack(msg);
            } else {
                throw new Error("Notification Service - Queue - payment_failed - Email sending failed");
            }
        } catch (error) {
            console.error("Notification Service - Queue - payment_failed - Error processing message:", error.message);
            channel.nack(msg, false, false);
        }
    })
};

module.exports = {startPaymentConsumer}