const { createClient } = require("redis");
require("dotenv").config();

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("error", (err) => console.log("Redis Error", err));

redisClient.connect().catch((err) => console.log("Redis connection error", err));

module.exports = redisClient;