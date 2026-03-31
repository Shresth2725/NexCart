const { connectRabbitMQWithRetry, getChannel } = require("./rabbitMQ");
const { sendOtpEmail } = require("./sendOTP.js");
const { sendProductAddEmail } = require("./sendProductAdd.js");
const { sendProductDeleteEmail } = require("./sendProductDeleteEmail.js");
const { sendProductUpdateEmail } = require("./sendProductUpdateEmail.js");
require("dotenv").config();

async function start() {
  await connectRabbitMQWithRetry();
  const channel = getChannel();

  await channel.assertQueue("otp_received", { durable: true });

  channel.prefetch(1);

  channel.consume("otp_received", async (msg) => {
    if (!msg) return;

    try {
      const data = JSON.parse(msg.content.toString());

      const result = await sendOtpEmail(data.email, data.otp);

      if (result.success) {
        console.log(`OTP sent to ${data.email}`);
        channel.ack(msg);
      } else {
        throw new Error("Email sending failed");
      }

    } catch (error) {
      const retries = msg.properties.headers?.["x-retries"] || 0;

      if (retries >= 3) {
        console.error("Max retries reached. Dropping message.");
        channel.ack(msg);
      } else {
        console.log(`Retrying... attempt ${retries + 1}`);

        channel.nack(msg, false, false);

        channel.sendToQueue("otp_received", msg.content, {
          headers: { "x-retries": retries + 1 }
        });
      }
    }
  });

  channel.consume("product_added", async (msg) => {
    if (!msg) return;

    try {
      const data = JSON.parse(msg.content.toString());
      
      if (!data.product || !data.email) {
        console.error("Malformed message received, discarding...", data);
        channel.ack(msg);
        return;
      }

      console.log(`Product added: ${data.product.name}`);
      const result = await sendProductAddEmail(data.email, data.product);
      if (result.success) {
        console.log(`Product added email sent: ${data.product.name}`);
        channel.ack(msg);
      } else {
        throw new Error("Email sending failed");
      }
    } catch (error) {
      console.log("Error processing message:", error.message);
      // Discard the message on error instead of requeuing infinitely
      channel.nack(msg, false, false);
    }
  });

  channel.consume("product_updated", async (msg) => {
    if (!msg) return;

    try {
      const data = JSON.parse(msg.content.toString());
      
      if (!data.product || !data.email) {
        console.error("Malformed message received, discarding...", data);
        channel.ack(msg);
        return;
      }

      console.log(`Product updated: ${data.product.name}`);
      const result = await sendProductUpdateEmail(data.email, data.product);
      if (result.success) {
        console.log(`Product updated email sent: ${data.product.name}`);
        channel.ack(msg);
      } else {
        throw new Error("Email sending failed");
      }
    } catch (error) {
      console.log("Error processing message:", error.message);
      channel.nack(msg, false, false);
    }
  });

  channel.consume("product_deleted", async (msg) => {
    if (!msg) return;

    try{
      const data = JSON.parse(msg.content.toString());
      
      if (!data.product || !data.email) {
        console.error("Malformed message received, discarding...", data);
        channel.ack(msg);
        return;
      }

      console.log(`Product deleted: ${data.product.name}`);
      const result = await sendProductDeleteEmail(data.email, data.product);
      if (result.success) {
        console.log(`Product deleted email sent: ${data.product.name}`);
        channel.ack(msg);
      } else {
        throw new Error("Email sending failed");
      }
    } catch (error) {
      console.log("Error processing message:", error.message);
      channel.nack(msg, false, false);
    }
  });
}

start();