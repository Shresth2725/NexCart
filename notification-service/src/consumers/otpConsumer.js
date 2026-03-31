const { getChannel } = require("../config/rabbitmq");
const { sendOtpEmail } = require("../services/emailService");

async function startOtpConsumer() {
  const channel = getChannel();

  channel.prefetch(1);

  channel.consume("otp_received", async (msg) => {
    if (!msg) return;

    try {
      const data = JSON.parse(msg.content.toString());

      const result = await sendOtpEmail(data.email, data.otp);

      if (result.success) {
        console.log(
          `Notification Service - Queue - otp_received - OTP sent to ${data.email}`,
        );
        channel.ack(msg);
      } else {
        throw new Error(
          "Notification Service - Queue - otp_received - Email sending failed",
        );
      }
    } catch (error) {
      const retries = msg.properties.headers?.["x-retries"] || 0;

      if (retries >= 3) {
        console.error(
          "Notification Service - Queue - otp_received - Max retries reached",
        );
        channel.ack(msg);
      } else {
        console.log(
          `Notification Service - Queue - otp_received - Retrying attempt ${retries + 1}`,
        );

        channel.nack(msg, false, false);

        channel.sendToQueue("otp_received", msg.content, {
          headers: { "x-retries": retries + 1 },
        });
      }
    }
  });
}

module.exports = { startOtpConsumer };
