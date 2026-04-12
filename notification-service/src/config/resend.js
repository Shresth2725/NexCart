const { Resend } = require("resend");
require("dotenv").config({ path: process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev' });

const resend = new Resend(process.env.RESEND_API);

module.exports = resend;
