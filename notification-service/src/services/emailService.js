const resend = require("../config/resend");

const sendOtpEmail = async (email, otp) => {
  try {
    const response = await resend.emails.send({
      from: "NexCart <onboarding@resend.dev>",
      to: email,
      subject: "Your OTP Code",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Verify your account</h2>
          <p>Your OTP is:</p>
          <h1 style="letter-spacing: 2px;">${otp}</h1>
          <p>This OTP will expire in 5 minutes.</p>
        </div>
      `,
    });

    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error(
      "Notification Service - Resend - sendOtpEmail - Email sending failed:",
      error,
    );

    return {
      success: false,
      error,
    };
  }
};

const sendProductAddEmail = async (email, product) => {
  const { name, description, price, category, brand, stock } = product;
  try {
    const response = await resend.emails.send({
      from: "NexCart <onboarding@resend.dev>",
      to: email,
      subject: "Your Product Added",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Product Added</h2>
          <p>Your product has been added successfully</p>
          <p><b>Name:</b> ${name}</p>
          <p><b>Price:</b> ₹${price}</p>
          <p><b>Description:</b> ${description}</p>
          <p><b>Category:</b> ${category}</p>
          <p><b>Brand:</b> ${brand}</p>
          <p><b>Stock:</b> ${stock}</p>
        </div>
      `,
    });

    return { success: true, data: response };
  } catch (error) {
    console.error(
      "Notification Service - Resend - sendProductAddEmail - Email sending failed:",
      error,
    );
    return { success: false, error };
  }
};

const sendProductUpdateEmail = async (email, product) => {
  const { name, description, price, category, brand, stock } = product;
  try {
    const response = await resend.emails.send({
      from: "NexCart <onboarding@resend.dev>",
      to: email,
      subject: "Your Product Updated",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Product Updated</h2>
          <p>Your product has been updated successfully</p>
          <p><b>Name:</b> ${name}</p>
          <p><b>Price:</b> ₹${price}</p>
          <p><b>Description:</b> ${description}</p>
          <p><b>Category:</b> ${category}</p>
          <p><b>Brand:</b> ${brand}</p>
          <p><b>Stock:</b> ${stock}</p>
        </div>
      `,
    });

    return { success: true, data: response };
  } catch (error) {
    console.error(
      "Notification Service - Resend - sendProductUpdateEmail - Email sending failed:",
      error,
    );
    return { success: false, error };
  }
};

const sendProductDeleteEmail = async (email, product) => {
  const { name, description, price, category, brand, stock } = product;
  try {
    const response = await resend.emails.send({
      from: "NexCart <onboarding@resend.dev>",
      to: email,
      subject: "Your Product Deleted",
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
      `,
    });

    return { success: true, data: response };
  } catch (error) {
    console.error(
      "Notification Service - Resend - sendProductDeleteEmail - Email sending failed:",
      error,
    );
    return { success: false, error };
  }
};

const sendProductStatusUpdateEmailByAdmin = async (email, product) => {
  const { name, description, price, category, brand, stock, isActive } = product;
  try {
    const response = await resend.emails.send({
      from: "NexCart <onboarding@resend.dev>",
      to: email,
      subject: "Your Product Status Updated By Admin",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Product Status Updated</h2>
          <p>Your product has been updated successfully</p>
          <p><b>Status:</b> ${isActive ? "Active" : "Inactive"}</p>
          <p><b>Name:</b> ${name}</p>
          <p><b>Price:</b> ₹${price}</p>
          <p><b>Description:</b> ${description}</p>
          <p><b>Category:</b> ${category}</p>
          <p><b>Brand:</b> ${brand}</p>
          <p><b>Stock:</b> ${stock}</p>
          </div>
      `,
    });

    return { success: true, data: response };
  } catch (error) {
    console.error(
      "Notification Service - Resend - sendProductStatusUpdateEmail - Email sending failed:",
      error,
    );
    return { success: false, error };
  }
};

const sendProductDeleteEmailByAdmin = async (email, product) => {
  const { name, description, price, category, brand, stock } = product;
  try {
    const response = await resend.emails.send({
      from: "NexCart <onboarding@resend.dev>",
      to: email,
      subject: "Your Product Deleted By Admin",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Product Deleted By Admin</h2>
          <p>Your product has been deleted successfully by admin</p>
          <p><b>Name:</b> ${name}</p>
          <p><b>Price:</b> ₹${price}</p>
          <p><b>Description:</b> ${description}</p>
          <p><b>Category:</b> ${category}</p>
          <p><b>Brand:</b> ${brand}</p>
          <p><b>Stock:</b> ${stock}</p>
          </div>
      `,
    });
    return { success: true, data: response };
  } catch (error) {
    console.error(
      "Notification Service - Resend - sendReviewDeleteEmail - Email sending failed:",
      error,
    );
    return { success: false, error };
  }
}

const sendReviewDeleteEmailByAdmin = async (email, review) => {
  const { rating, comment, productId } = review;
  try {
    const response = await resend.emails.send({
      from: "NexCart <onboarding@resend.dev>",
      to: email,
      subject: "Your Review Deleted By Admin",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Review Deleted By Admin</h2>
          <p>Your review has been deleted successfully by admin</p>
          <p><b>Rating:</b> ${rating}</p>
          <p><b>Comment:</b> ${comment}</p>
          <p><b>Product ID:</b> ${productId}</p>
          </div>
      `,
    });
    return { success: true, data: response };
  } catch (error) {
    console.error(
      "Notification Service - Resend - sendReviewDeleteEmailByAdmin - Email sending failed:",
      error,
    );
    return { success: false, error };
  }
}

module.exports = {
  sendOtpEmail,
  sendProductAddEmail,
  sendProductUpdateEmail,
  sendProductDeleteEmail,
  sendProductStatusUpdateEmailByAdmin,
  sendProductDeleteEmailByAdmin,
  sendReviewDeleteEmailByAdmin
};
