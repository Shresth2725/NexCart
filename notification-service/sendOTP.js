// import { Resend } from 'resend';
const { Resend } = require("resend");
require("dotenv").config();

const resend = new Resend(process.env.RESEND_API);

const sendOtpEmail = async (email, otp) => {
  try {
    const response = await resend.emails.send({
      from: 'NexCart <onboarding@resend.dev>',
      to: email,
      subject: 'Your OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Verify your account</h2>
          <p>Your OTP is:</p>
          <h1 style="letter-spacing: 2px;">${otp}</h1>
          <p>This OTP will expire in 5 minutes.</p>
        </div>
      `
    });

    return {
      success: true,
      data: response
    };

  } catch (error) {
    console.error('Email sending failed:', error);

    return {
      success: false,
      error
    };
  }
};

module.exports = { sendOtpEmail };