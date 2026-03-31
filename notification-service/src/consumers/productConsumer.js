const { getChannel } = require("../config/rabbitmq");
const {
  sendProductAddEmail,
  sendProductUpdateEmail,
  sendProductDeleteEmail,
} = require("../services/emailService");

async function startProductConsumer() {
  const channel = getChannel();

  channel.consume("product_added", async (msg) => {
    if (!msg) return;

    try {
      const data = JSON.parse(msg.content.toString());

      if (!data.product || !data.email) {
        console.error(
          "Notification Service - Queue - product_added - Malformed message received",
          data,
        );
        channel.ack(msg);
        return;
      }

      console.log(
        `Notification Service - Queue - product_added - ${data.product.name}`,
      );
      const result = await sendProductAddEmail(data.email, data.product);
      if (result.success) {
        console.log(
          `Notification Service - Queue - product_added - Email sent for ${data.product.name}`,
        );
        channel.ack(msg);
      } else {
        throw new Error(
          "Notification Service - Queue - product_added - Email sending failed",
        );
      }
    } catch (error) {
      console.error(
        "Notification Service - Queue - product_added - Error processing message:",
        error.message,
      );
      channel.nack(msg, false, false);
    }
  });

  channel.consume("product_updated", async (msg) => {
    if (!msg) return;

    try {
      const data = JSON.parse(msg.content.toString());

      if (!data.product || !data.email) {
        console.error(
          "Notification Service - Queue - product_updated - Malformed message received",
          data,
        );
        channel.ack(msg);
        return;
      }

      console.log(
        `Notification Service - Queue - product_updated - ${data.product.name}`,
      );
      const result = await sendProductUpdateEmail(data.email, data.product);
      if (result.success) {
        console.log(
          `Notification Service - Queue - product_updated - Email sent for ${data.product.name}`,
        );
        channel.ack(msg);
      } else {
        throw new Error(
          "Notification Service - Queue - product_updated - Email sending failed",
        );
      }
    } catch (error) {
      console.error(
        "Notification Service - Queue - product_updated - Error processing message:",
        error.message,
      );
      channel.nack(msg, false, false);
    }
  });

  channel.consume("product_deleted", async (msg) => {
    if (!msg) return;

    try {
      const data = JSON.parse(msg.content.toString());

      if (!data.product || !data.email) {
        console.error(
          "Notification Service - Queue - product_deleted - Malformed message received",
          data,
        );
        channel.ack(msg);
        return;
      }

      console.log(
        `Notification Service - Queue - product_deleted - ${data.product.name}`,
      );
      const result = await sendProductDeleteEmail(data.email, data.product);
      if (result.success) {
        console.log(
          `Notification Service - Queue - product_deleted - Email sent for ${data.product.name}`,
        );
        channel.ack(msg);
      } else {
        throw new Error(
          "Notification Service - Queue - product_deleted - Email sending failed",
        );
      }
    } catch (error) {
      console.error(
        "Notification Service - Queue - product_deleted - Error processing message:",
        error.message,
      );
      channel.nack(msg, false, false);
    }
  });
}

module.exports = { startProductConsumer };
