require("dotenv").config({ path: process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev' });
const { connectRabbitMQWithRetry } = require("./config/rabbitmq");
const { startOtpConsumer } = require("./consumers/otpConsumer");
const { startProductConsumer } = require("./consumers/productConsumer");
const { startOrderConsumer } = require("./consumers/orderConsumer");
const http = require("http");

async function start() {
  await connectRabbitMQWithRetry();
  
  await startOtpConsumer();
  await startProductConsumer();
  await startOrderConsumer();
  
  console.log("Notification Service is running and waiting for messages...");

  // Health Check Server
  const server = http.createServer((req, res) => {
    if (req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        status: "UP",
        service: "notification-service",
        timestamp: new Date().toISOString()
      }));
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  const PORT = process.env.PORT || 3002;
  server.listen(PORT, () => {
    console.log(`Health check server running on port ${PORT}`);
  });
}

start();
