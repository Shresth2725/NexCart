const { connectRabbitMQWithRetry, getChannel } = require("./rabbitMQ");
const { sendOtpEmail } = require("./sendOTP.js");
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
}

start();