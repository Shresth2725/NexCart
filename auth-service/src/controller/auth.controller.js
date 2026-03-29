const otpModel = require("../models/otp.model");
const bcrypt = require("bcrypt");
const {getChannel} = require("../config/rabbitMQ");
const User = require("../models/user.model.js");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, address, sellerInfo } =
      req.body;

    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({ message: "Auth-Service - Auth Route - Register API - Name, email, password, and role are required" });
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

    res.status(201).json({ message: "Auth-Service - Auth Route - Register API - User saved successfully" });
  } catch (error) {
    res.status(500).json({ message: `Auth-Service - Auth Route - Register API - ${error.message}` });
  }
};

const verifyUserOtp = async (req , res) => {
  try {
    const {email , otp} = req.body;
    if (!email || !otp) {
      return res.status(400).json({message : "Auth-Service - Auth Route - Verify User OTP API - Email and otp are required"})
    }
    const otpDoc = await otpModel.findOne({email});
    if (!otpDoc) {
      return res.status(404).json({message : "Auth-Service - Auth Route - Verify User OTP API - Otp not found"})
    }

    // check expired or not
    if (otpDoc.expiresAt < Date.now()) {
      return res.status(400).json({message : "Auth-Service - Auth Route - Verify User OTP API - Otp expired"})
    }

    if (otpDoc.otp !== otp) {
      return res.status(400).json({message : "Auth-Service - Auth Route - Verify User OTP API - Invalid otp"})
    }
    await otpModel.deleteOne({email});
    await User.updateOne({email} , {$set : {isVerified : true}});
    return res.status(200).json({message : "Auth-Service - Auth Route - Verify User OTP API - Otp verified successfully"})
  } catch (error) {
    res.status(500).json({message : `Auth-Service - Auth Route - Verify User OTP API - ${error.message}`})
  }
}

const resendOTP = async (req , res) => {
  try {
    const {email} = req.body;
    if (!email) {
      return res.status(400).json({message : "Auth-Service - Auth Route - Resend OTP API - Email is required"})
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
    return res.status(200).json({message : "Auth-Service - Auth Route - Resend OTP API - Otp resent successfully"})
  } catch (error) {
    res.status(500).json({message : `Auth-Service - Auth Route - Resend OTP API - ${error.message}`})
  }
}

const login = async (req , res) => {
  try {
    const {email , password} = req.body;
    if (!email || !password) {
      return res.status(400).json({message : "Auth-Service - Auth Route - Login API - Email and password are required"})
    }
    const user = await User.findOne({email}).select("+password").lean();
    if (!user) {
      return res.status(404).json({message : "Auth-Service - Auth Route - Login API - User not found"})
    }

    if (!user.isVerified) {
      return res.status(400).json({message : "Auth-Service - Auth Route - Login API - User not verified"})
    }

    const isPasswordValid = await bcrypt.compare(password , user.password);
    if (!isPasswordValid) {
      return res.status(400).json({message : "Auth-Service - Auth Route - Login API - Invalid password"})
    }

    // generate jwt token
    const token = jwt.sign({id : user._id, role: user.role , name: user.name, sellerInfo: user.sellerInfo} , process.env.JWT_SECRET , {expiresIn : "24h"});
    res.cookie("token" , token , {
      httpOnly : true,
      secure : false,
      sameSite : "lax",
      maxAge : 24 * 60 * 60 * 1000
    })

    return res.status(200).json({message : "Auth-Service - Auth Route - Login API - User logged in successfully" , user , token})
  } catch (error) {
    res.status(500).json({message : `Auth-Service - Auth Route - Login API - ${error.message}`})
  }
}

const logout = async (req , res) => {
  try {
    // check if cookie exist or not 
    if (!req.cookies.token) {
      return res.status(400).json({message : "Auth-Service - Auth Route - Logout API - No cookie found"})
    }
    res.clearCookie("token");
    return res.status(200).json({message : "Auth-Service - Auth Route - Logout API - User logged out successfully"})
  } catch (error) {
    res.status(500).json({message : `Auth-Service - Auth Route - Logout API - ${error.message}`})
  }
}


// protected routes

const getAddresses = async (req , res) => {
  try {
    const {email} = req.user;
    console.log(req.user);
    if (!email) {
      return res.status(400).json({message : "Auth-Service - Auth Route - Get Addresses API - Email is required"})
    }
    const user = await User.findOne({email}).lean();
    if (!user) {
      return res.status(404).json({message : "Auth-Service - Auth Route - Get Addresses API - User not found"})
    }
    return res.status(200).json({message : "Auth-Service - Auth Route - Get Addresses API - Addresses fetched successfully" , addresses : user.address})
  } catch (error) {
    res.status(500).json({message : `Auth-Service - Auth Route - Get Addresses API - ${error.message}`})
  }
}

const putAddressDefault = async (req, res) => {
  try {
    const { email } = req.user;
    const { addressId } = req.params;

    if (!email || !addressId) {
      return res.status(400).json({ message: "Auth-Service - Auth Route - Put Address Default API - Email and addressId are required" });
    }

    // check if address exists
    const user = await User.findOne({ email, "address._id": addressId });
    if (!user) {
      return res.status(404).json({ message: "Auth-Service - Auth Route - Put Address Default API - Address not found" });
    }

    // set all to false
    await User.updateOne(
      { email },
      { $set: { "address.$[].isDefault": false } }
    );

    // set selected address to true
    await User.updateOne(
      { email, "address._id": addressId },
      { $set: { "address.$.isDefault": true } }
    );

    return res.status(200).json({ message: "Auth-Service - Auth Route - Put Address Default API - Address set as default successfully" });

  } catch (error) {
    res.status(500).json({ message: `Auth-Service - Auth Route - Put Address Default API - ${error.message}` });
  }
};

const addAddress = async (req , res) => {
  try {
    const {email} = req.user;
    const address = req.body;
    if (!email || !address) {
      return res.status(400).json({message : "Auth-Service - Auth Route - Add Address API - Email and address are required"})
    }

    const {street , city , state , pincode , country} = address;
    if (!street || !city || !state || !pincode || !country) {
      return res.status(400).json({message : "Auth-Service - Auth Route - Add Address API - All address fields are required"})
    }

    const user = await User.findOne({email}).lean();
    if (!user) {
      return res.status(404).json({message : "User not found"})
    }
    await User.updateOne({email} , {$push : {address : address}})
    return res.status(200).json({message : "Auth-Service - Auth Route - Add Address API - Address added successfully"})
  } catch (error) {
    res.status(500).json({message : `Auth-Service - Auth Route - Add Address API - ${error.message}`})
  }
}

const removeAddress = async (req , res) => {
  try {
    const {email } = req.user;
    const {addressId} = req.params;
    if (!email || !addressId) {
      return res.status(400).json({message : "Auth-Service - Auth Route - Remove Address API - Email and addressId are required"})
    }
    const user = await User.findOne({email}).lean();
    if (!user) {
      return res.status(404).json({message : "Auth-Service - Auth Route - Remove Address API - User not found"})
    }
    await User.updateOne({email} , {$pull : {address : {_id : addressId}}})
    
    return res.status(200).json({message : "Auth-Service - Auth Route - Remove Address API - Address deleted successfully"})
  } catch (error) {
    res.status(500).json({message : `Auth-Service - Auth Route - Remove Address API - ${error.message}`})
  }
}

const updateAddress = async (req , res) => {
  try {
    const {email} = req.user;
    const address = req.body;
    const {addressId} = req.params;
    if (!email || !addressId || !address) {
      return res.status(400).json({message : "Auth-Service - Auth Route - Update Address API - Email , addressId and address are required"})
    }
    const user = await User.findOne({email}).lean();
    if (!user) {
      return res.status(404).json({message : "Auth-Service - Auth Route - Update Address API - User not found"})
    }
    await User.updateOne({email , "address._id" : addressId} , {$set : {"address.$" : address}})
    return res.status(200).json({message : "Auth-Service - Auth Route - Update Address API - Address updated successfully"})
  } catch (error) {
    res.status(500).json({message : `Auth-Service - Auth Route - Update Address API - ${error.message}`})
  }
}

const updateUser = async (req , res) => {
  try {
    const {name , phone , role} = req.body;
    const {email} = req.user;
    if (!email) {
      return res.status(400).json({message : "Auth-Service - Auth Route - Update User API - Email is required"})
    }
    const user = await User.findOne({email}).lean();
    if (!user) {
      return res.status(404).json({message : "Auth-Service - Auth Route - Update User API - User not found"})
    }
    await User.updateOne({email} , {$set : {name , phone , role}})
    return res.status(200).json({message : "Auth-Service - Auth Route - Update User API - User updated successfully"})
  } catch (error) {
    res.status(500).json({message : `Auth-Service - Auth Route - Update User API - ${error.message}`})
  }
}

const updateSellerInfo = async (req , res) => {
  try {
    const {storeName , storeDescription} = req.body;
    const {email} = req.user;
    if (!email || !storeName || !storeDescription) {
      return res.status(400).json({message : "Auth-Service - Auth Route - Update Seller Info API - Email , storeName and storeDescription are required"})
    }
    const user = await User.findOne({email}).lean();
    if (!user) {
      return res.status(404).json({message : "Auth-Service - Auth Route - Update Seller Info API - User not found"})
    }
    await User.updateOne({email} , {$set : {sellerInfo : {storeName , storeDescription}}})
    return res.status(200).json({message : "Auth-Service - Auth Route - Update Seller Info API - Seller info updated successfully"})
  } catch (error) {
    res.status(500).json({message : `Auth-Service - Auth Route - Update Seller Info API - ${error.message}`})
  }
}

const updatePassword = async (req , res) => {
  try {
    const { email } = req.user;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: "Auth-Service - Auth Route - Update Password API - oldPassword and newPassword are required"
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(404).json({ message: "Auth-Service - Auth Route - Update Password API - User not found" });
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Auth-Service - Auth Route - Update Password API - Invalid password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.updateOne(
      { email },
      { $set: { password: hashedPassword } }
    );

    return res.status(200).json({
      message: "Auth-Service - Auth Route - Update Password API - Password updated successfully"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const forgetPassword = async (req , res) => {
  try {
    const {email} = req.user;
    if (!email) {
      return res.status(400).json({message : "Auth-Service - Auth Route - Forget Password API - Email is required"})
    }
    const user = await User.findOne({email}).lean();
    if (!user) {
      return res.status(404).json({message : "Auth-Service - Auth Route - Forget Password API - User not found"})
    }
    const otp = Math.floor(100000 + Math.random() * 900000);

    // send otp to messageQueue
    const channel = await getChannel();
    if (!channel) {
      return res.status(500).json({message : "Auth-Service - Auth Route - Forget Password API - Failed to connect to message queue"})
    }
    await channel.sendToQueue(
      "otp_received",
      Buffer.from(JSON.stringify({ email, otp }))
    );

    await otpModel.create({email , otp});
    return res.status(200).json({message : "Auth-Service - Auth Route - Forget Password API - OTP sent successfully"})
  } catch (error) {
    res.status(500).json({message : `Auth-Service - Auth Route - Forget Password API - ${error.message}`})
  }
}

const verifyForgetPasswordOtp = async (req , res) => {
  try {
    const {email} = req.user;
    const {password , otp} = req.body;
    if (!password || !otp) {
      return res.status(400).json({message : "Auth-Service - Auth Route - Verify Forget Password OTP API - password and otp are required"})
    }
    const user = await User.findOne({email}).lean();
    if (!user) {
      return res.status(404).json({message : "Auth-Service - Auth Route - Verify Forget Password OTP API - User not found"})
    }
    const isOtpValid = await otpModel.findOne({email , otp});
    if (!isOtpValid) {
      return res.status(400).json({message : "Auth-Service - Auth Route - Verify Forget Password OTP API - Invalid otp"})
    }
    await otpModel.deleteOne({email , otp});

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.updateOne(
      {email} , 
      {$set : {password : hashedPassword}}
    )
    return res.status(200).json({message : "Auth-Service - Auth Route - Verify Forget Password OTP API - Password updated successfully"})
  } catch (error) {
    res.status(500).json({message : `Auth-Service - Auth Route - Verify Forget Password OTP API - ${error.message}`})
  }
}

const me = async (req , res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({message : "Auth-Service - Auth Route - Me API - User not found"})
    }
    return res.status(200).json({message : "Auth-Service - Auth Route - Me API - User fetched successfully" , user})
  } catch (error) {
    res.status(500).json({message : `Auth-Service - Auth Route - Me API - ${error.message}`})
  }
}

const getUserById = async (req , res) => {
  try {
    const {id} = req.params;
    if (!id) {
      return res.status(400).json({message : "Auth-Service - Auth Route - Get User By Id API - User id is required"})
    }
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({message : "Auth-Service - Auth Route - Get User By Id API - User not found"})
    }
    return res.status(200).json({message : "Auth-Service - Auth Route - Get User By Id API - User fetched successfully" , user})
  } catch (error) {
    res.status(500).json({message : `Auth-Service - Auth Route - Get User By Id API - ${error.message}`})
  }
}

module.exports = {register , resendOTP , verifyUserOtp , login ,logout , getAddresses , addAddress , removeAddress , updateAddress , updateSellerInfo , updatePassword , updateUser , forgetPassword , verifyForgetPasswordOtp , putAddressDefault , me , getUserById}