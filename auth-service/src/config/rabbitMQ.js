const amqp = require("amqplib");
let channel, connection;

async function connectRabbitMQWithRetry(retries = 5, delay = 3000) {
  while (retries) {
    try {
      connection = await amqp.connect("amqp://rabbitmq:5672");
      channel = await connection.createChannel();
      await channel.assertQueue("otp_received");
      console.log("Connected to RabbitMQ");
      return;
    } catch (error) {
      retries--;
      if (retries === 0) {
        throw new Error("Failed to connect to RabbitMQ");
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

function getChannel() {
  if (!channel) {
    throw new Error("Channel not initialized");
  }
  return channel;
}

module.exports = {connectRabbitMQWithRetry , getChannel}