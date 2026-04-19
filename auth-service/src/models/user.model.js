const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  street: { type: String, required: true },
  city: { type: String, required: true, index: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  country: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    role: {
      type: String,
      enum: ["customer", "admin", "seller"],
      default: "customer",
      index: true,
    },

    phone: {
      type: String,
      match: /^[0-9]{10}$/,
    },

    sellerInfo: {
      storeName: String,
      storeDescription: String,
      isApproved: { type: Boolean, default: false },
    },

    address: [addressSchema],

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);