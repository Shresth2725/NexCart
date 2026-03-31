const { Resend } = require("resend");
require("dotenv").config();

const resend = new Resend(process.env.RESEND_API);

const sendProductDeleteEmail = async ( email , product) => {
    const { name, description, price, category, brand, stock } = product;
  try {
    const response = await resend.emails.send({
      from: 'NexCart <onboarding@resend.dev>',
      to: email,
      subject: 'Your Product Deleted',
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Product Deleted</h2>
          <p>Your product has been deleted successfully</p>
          <p><b>Name:</b> ${name}</p>
          <p><b>Price:</b> ₹${price}</p>
          <p><b>Description:</b> ${description}</p>
          <p><b>Category:</b> ${category}</p>
          <p><b>Brand:</b> ${brand}</p>
          <p><b>Stock:</b> ${stock}</p>
        </div>
      `
    });

    return { success: true, data: response };

  } catch (error) {
    console.error("Email sending failed:", error);
    return { success: false, error };
  }
};

module.exports = { sendProductDeleteEmail };