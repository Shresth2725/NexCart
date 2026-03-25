const { connectRabbitMQWithRetry, getChannel } = require("./rabbitMQ");
const { sendOtpEmail } = require("./sendOTP.js");
require("dotenv").config();

async function start() {
  await connectRabbitMQWithRetry();

  const channel = getChannel();

  channel.consume("otp_received", async (msg) => {
    if (!msg) return;

    try {
      const data = JSON.parse(msg.content.toString());

      const result = await sendOtpEmail(data.email, data.otp);

      if (result.success) {
        console.log("OTP send successfully");

        channel.ack(msg);
      } else {
        console.error("Email failed, requeueing...");
        channel.nack(msg, false, true);
      }

    } catch (error) {
      console.error("Processing error:", error);

      channel.nack(msg, false, true);
    }
  });
}

start();