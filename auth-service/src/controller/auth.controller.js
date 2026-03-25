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

const verifyUserOtp = async (req , res) => {
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

const login = async (req , res) => {
  try {
    const {email , password} = req.body;
    if (!email || !password) {
      return res.status(400).json({message : "Email and password are required"})
    }
    const user = await User.findOne({email}).select("+password").lean();
    if (!user) {
      return res.status(404).json({message : "User not found"})
    }

    if (!user.isVerified) {
      return res.status(400).json({message : "User not verified"})
    }

    const isPasswordValid = await bcrypt.compare(password , user.password);
    if (!isPasswordValid) {
      return res.status(400).json({message : "Invalid password"})
    }

    // generate jwt token
    const token = jwt.sign({id : user._id} , process.env.JWT_SECRET , {expiresIn : "24h"});
    res.cookie("token" , token , {
      httpOnly : true,
      secure : true,
      sameSite : "strict",
      maxAge : 24 * 60 * 60 * 1000
    })

    return res.status(200).json({message : "User logged in successfully" , user , token})
  } catch (error) {
    res.status(500).json({message : error.message})
  }
}

const logout = async (req , res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({message : "User logged out successfully"})
  } catch (error) {
    res.status(500).json({message : error.message})
  }
}

const getAddresses = async (req , res) => {
  try {
    const {email} = req.body;
    if (!email) {
      return res.status(400).json({message : "Email is required"})
    }
    const user = await User.findOne({email}).lean();
    if (!user) {
      return res.status(404).json({message : "User not found"})
    }
    return res.status(200).json({message : "Addresses fetched successfully" , addresses : user.address})
  } catch (error) {
    res.status(500).json({message : error.message})
  }
}

const addAddress = async (req , res) => {
  try {
    const {email , address} = req.body;
    if (!email || !address) {
      return res.status(400).json({message : "Email and address are required"})
    }
    const user = await User.findOne({email}).lean();
    if (!user) {
      return res.status(404).json({message : "User not found"})
    }
    await User.updateOne({email} , {$push : {address : address}})
    return res.status(200).json({message : "Address added successfully"})
  } catch (error) {
    res.status(500).json({message : error.message})
  }
}

const removeAddress = async (req , res) => {
  try {
    const {email , addressId} = req.body;
    if (!email || !addressId) {
      return res.status(400).json({message : "Email and addressId are required"})
    }
    const user = await User.findOne({email}).lean();
    if (!user) {
      return res.status(404).json({message : "User not found"})
    }
    await User.updateOne({email} , {$pull : {address : {_id : addressId}}})
    return res.status(200).json({message : "Address deleted successfully"})
  } catch (error) {
    res.status(500).json({message : error.message})
  }
}

const updateAddress = async (req , res) => {
  try {
    const {email , addressId , address} = req.body;
    if (!email || !addressId || !address) {
      return res.status(400).json({message : "Email , addressId and address are required"})
    }
    const user = await User.findOne({email}).lean();
    if (!user) {
      return res.status(404).json({message : "User not found"})
    }
    await User.updateOne({email , "address._id" : addressId} , {$set : {"address.$" : address}})
    return res.status(200).json({message : "Address updated successfully"})
  } catch (error) {
    res.status(500).json({message : error.message})
  }
}

const updateUser = async (req , res) => {
  try {
    const {email , name , phone , role} = req.body;
    if (!email) {
      return res.status(400).json({message : "Email is required"})
    }
    const user = await User.findOne({email}).lean();
    if (!user) {
      return res.status(404).json({message : "User not found"})
    }
    await User.updateOne({email} , {$set : {name , phone , role}})
    return res.status(200).json({message : "User updated successfully"})
  } catch (error) {
    res.status(500).json({message : error.message})
  }
}

const updateSellerInfo = async (req , res) => {
  try {
    const {email , storeName , storeDescription} = req.body;
    if (!email || !storeName || !storeDescription) {
      return res.status(400).json({message : "Email , storeName and storeDescription are required"})
    }
    const user = await User.findOne({email}).lean();
    if (!user) {
      return res.status(404).json({message : "User not found"})
    }
    await User.updateOne({email} , {$set : {sellerInfo : {storeName , storeDescription}}})
    return res.status(200).json({message : "Seller info updated successfully"})
  } catch (error) {
    res.status(500).json({message : error.message})
  }
}

const updatePassword = async (req , res) => {
  try {
    const {email , password} = req.body;
    if (!email || !password) {
      return res.status(400).json({message : "Email and password are required"})
    }
    const user = await User.findOne({email}).lean();
    if (!user) {
      return res.status(404).json({message : "User not found"})
    }
    const isPasswordValid = await bcrypt.compare(password , user.password);
    if (!isPasswordValid) {
      return res.status(400).json({message : "Invalid password"})
    }
    await User.updateOne({email} , {$set : {password : bcrypt.hashSync(password , 10)}})
    return res.status(200).json({message : "Password updated successfully"})
  } catch (error) {
    res.status(500).json({message : error.message})
  }
}

const forgetPassword = async (req , res) => {
  try {
    const {email} = req.body;
    if (!email) {
      return res.status(400).json({message : "Email is required"})
    }
    const user = await User.findOne({email}).lean();
    if (!user) {
      return res.status(404).json({message : "User not found"})
    }
    const otp = Math.floor(100000 + Math.random() * 900000);

    // send otp to messageQueue
    const channel = await getChannel();
    if (!channel) {
      return res.status(500).json({message : "Failed to connect to message queue"})
    }
    await channel.sendToQueue("otp_received" , JSON.stringify({email , otp}));
    await channel.close();
    return res.status(200).json({message : "OTP sent successfully"})
  } catch (error) {
    res.status(500).json({message : error.message})
  }
}

const verifyForgetPasswordOtp = async (req , res) => {
  try {
    const {email , otp} = req.body;
    if (!email || !otp) {
      return res.status(400).json({message : "Email and otp are required"})
    }
    const user = await User.findOne({email}).lean();
    if (!user) {
      return res.status(404).json({message : "User not found"})
    }
    const isOtpValid = await Otp.findOne({email , otp});
    if (!isOtpValid) {
      return res.status(400).json({message : "Invalid otp"})
    }
    await Otp.deleteOne({email , otp});
    return res.status(200).json({message : "OTP verified successfully"})
  } catch (error) {
    res.status(500).json({message : error.message})
  }
}


module.exports = {register , getUser , getAllUser , resendOTP , verifyUserOtp , login ,logout , getAddresses , addAddress , removeAddress , updateAddress , updateSellerInfo , updatePassword , updateUser , forgetPassword , verifyForgetPasswordOtp}