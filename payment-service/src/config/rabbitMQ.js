const amqp = require("amqplib");
let channel, connection;

async function connectRabbitMQWithRetry(retries = 5, delay = 3000) {
  while (retries) {
    try {
      // connection = await amqp.connect("amqp://localhost:5672")
      connection = await amqp.connect(process.env.RABBITMQ_URL);
      channel = await connection.createChannel();
      await channel.assertQueue("order_created");
      await channel.assertQueue("order_updated");
      await channel.assertQueue("order_deleted");
      await channel.assertQueue("order_deleted_by_admin");
      await channel.assertQueue("order_status_updated");
      await channel.assertQueue("payment.completed");
      await channel.assertQueue("payment.failed");
      console.log("Connected to RabbitMQ");
      return;
    } catch (error) {
      retries--;  
      if (retries === 0) {
        throw new Error("Failed to connect to RabbitMQ" + error);
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