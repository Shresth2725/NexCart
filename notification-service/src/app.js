require("dotenv").config();
const { connectRabbitMQWithRetry } = require("./config/rabbitmq");
const { startOtpConsumer } = require("./consumers/otpConsumer");
const { startProductConsumer } = require("./consumers/productConsumer");

async function start() {
  await connectRabbitMQWithRetry();
  
  await startOtpConsumer();
  await startProductConsumer();
  
  console.log("Notification Service is running and waiting for messages...");
}

start();
