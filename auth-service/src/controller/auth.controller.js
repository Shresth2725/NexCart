const otpModel = require("../models/otp.model");
const bcrypt = require("bcrypt");
const {getChannel} = require("../config/rabbitMQ");
const User = require("../models/user.model.js");

const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, address, sellerInfo } =
      req.body;

    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({ message: "Name, email, password, and role are required" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // OTP verifcation
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpDoc = new otpModel({
      email,
      otp,
    });
    await otpDoc.save();

    // rabbitmq
    const channel = getChannel();
    if (!channel) {
      throw new Error("RabbitMQ channel not initialized");
    }
    channel.sendToQueue("otp_received", Buffer.from(JSON.stringify({ email, otp })));
    console.log("OTP sent to RabbitMQ");

    // Create a new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      address,
      sellerInfo,
    });

    // Save the user to the database
    await user.save();

    res.status(201).json({ message: "User saved successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyOtp = async (req , res) => {
  try {
    const {email , otp} = req.body;
    if (!email || !otp) {
      return res.status(400).json({message : "Email and otp are required"})
    }
    const otpDoc = await otpModel.findOne({email});
    if (!otpDoc) {
      return res.status(404).json({message : "Otp not found"})
    }

    // check expired or not
    if (otpDoc.expiresAt < Date.now()) {
      return res.status(400).json({message : "Otp expired"})
    }

    if (otpDoc.otp !== otp) {
      return res.status(400).json({message : "Invalid otp"})
    }
    await otpModel.deleteOne({email});
    await User.updateOne({email} , {$set : {isVerified : true}});
    return res.status(200).json({message : "Otp verified successfully"})
  } catch (error) {
    res.status(500).json({message : error.message})
  }
}

const resendOTP = async (req , res) => {
  try {
    const {email} = req.body;
    if (!email) {
      return res.status(400).json({message : "Email is required"})
    }

    // delete previous otp
    await otpModel.deleteMany({email});

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpDoc = new otpModel({
      email,
      otp,
    });
    await otpDoc.save();

    const channel = getChannel();
    if (!channel) {
      throw new Error("RabbitMQ channel not initialized");
    }
    channel.sendToQueue("otp_received", Buffer.from(JSON.stringify({ email, otp })));
    console.log("OTP sent to RabbitMQ");
    return res.status(200).json({message : "Otp resent successfully"})
  } catch (error) {
    res.status(500).json({message : error.message})
  }
}

const getAllUser = async (req , res) => {
  try {
    const users = await User.find().lean();
    if (!users) {
      return res.status(404).json({message : "No users found"})
    }
    return res.status(200).json({message : "Users fetched successfully" , users})
  } catch (error) {
    res.status(500).json({message : error.message})
  }
}

const getUser = async (req , res) => {
  try {
    const {email} = req.body;
    if (!email) {
      return res.status(400).json({message : "Email is required"})
    } 
    const user = await User.findOne({email}).lean();
    if (!user) {
      return res.status(404).json({message : "User not found"})
    }
    return res.status(200).json({message : "User fetched successfully" , user})
  } catch (error) {
    res.status(500).json({message : error.message})
  }
}

module.exports = {register , getUser , getAllUser , resendOTP , verifyOtp}