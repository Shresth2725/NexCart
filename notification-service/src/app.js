require("dotenv").config({ path: process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev' });
const { connectRabbitMQWithRetry } = require("./config/rabbitmq");
const { startOtpConsumer } = require("./consumers/otpConsumer");
const { startProductConsumer } = require("./consumers/productConsumer");

async function start() {
  await connectRabbitMQWithRetry();
  
  await startOtpConsumer();
  await startProductConsumer();
  await startOrderConsumer();
  
  console.log("Notification Service is running and waiting for messages...");
}

start();
