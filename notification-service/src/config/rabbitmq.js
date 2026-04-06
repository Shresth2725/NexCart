const amqp = require("amqplib");

let channel, connection;

async function connectRabbitMQWithRetry(retries = 5, delay = 3000) {
  while (retries) {
    try {
      connection = await amqp.connect("amqp://localhost:5672");
      channel = await connection.createChannel();
      await channel.assertQueue("otp_received", { durable: true });
      await channel.assertQueue("product_added");
      await channel.assertQueue("product_updated");
      await channel.assertQueue("product_deleted");
      await channel.assertQueue("product_deleted_by_admin");
      await channel.assertQueue("product_status_updated");
      console.log(
        "Notification Service - RabbitMQ - connectRabbitMQWithRetry - Connected to RabbitMQ",
      );
      return;
    } catch (error) {
      retries--;
      if (retries === 0) {
        throw new Error(
          "Notification Service - RabbitMQ - connectRabbitMQWithRetry - Failed to connect to RabbitMQ",
        );
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

function getChannel() {
  if (!channel) {
    throw new Error(
      "Notification Service - RabbitMQ - getChannel - Channel not initialized",
    );
  }
  return channel;
}

module.exports = { connectRabbitMQWithRetry, getChannel };
