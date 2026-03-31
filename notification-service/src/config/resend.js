const { Resend } = require("resend");
require("dotenv").config();

const resend = new Resend(process.env.RESEND_API);

module.exports = resend;
