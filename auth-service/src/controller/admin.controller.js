const User = require("../models/user.model.js");

// admin

const approveSeller = async (req , res) => {
  try {
    const {id} = req.params;
    if (!id) {
      return res.status(400).json({message : "Auth-Service - Admin Route - Approve Seller API - Id is required"})
    }
    const user = await User.findById(id).lean();
    if (!user) {
      return res.status(404).json({message : "Auth-Service - Admin Route - Approve Seller API - Seller not found"})
    }
    if (user.sellerInfo.isApproved) {
      return res.status(400).json({message : "Auth-Service - Admin Route - Approve Seller API - Seller is already approved"})
    }
    if (!user.isVerified) {
      return res.status(400).json({message : "Auth-Service - Admin Route - Approve Seller API - Seller is not verified throught OTP"})
    }
    if (user.role !== "seller") {
      return res.status(400).json({message : "Auth-Service - Admin Route - Approve Seller API - User is not a seller"})
    }
    await User.updateOne({_id : id} , {$set : {"sellerInfo.isApproved" : true}});
    return res.status(200).json({message : "Auth-Service - Admin Route - Approve Seller API - Seller approved successfully"})
  } catch (error) {
    res.status(500).json({message : `Auth-Service - Admin Route - Approve Seller API - ${error.message}`})
  }
}

const rejectSeller = async (req , res) => {
  try {
    const {id} = req.params;
    if (!id) {
      return res.status(400).json({message : "Auth-Service - Admin Route - Reject Seller API - Id is required"})
    }
    const user = await User.findById(id).lean();
    if (!user) {
      return res.status(404).json({message : "Auth-Service - Admin Route - Reject Seller API - User not found"})
    }
    if (user.role !== "seller") {
      return res.status(400).json({message : "Auth-Service - Admin Route - Reject Seller API - User is not a seller"})
    }
    if (!user.sellerInfo.isApproved) {
      return res.status(400).json({message : "Auth-Service - Admin Route - Reject Seller API - Seller is already rejected"})
    }
    await User.updateOne({_id : id} , {$set : {"sellerInfo.isApproved" : false}});
    return res.status(200).json({message : "Auth-Service - Admin Route - Reject Seller API - Seller rejected successfully"})
  } catch (error) {
    res.status(500).json({message : `Auth-Service - Admin Route - Reject Seller API - ${error.message}`})
  }
}

const getAllSeller = async (req , res) => {
  try {
    // remove password from response
    const users = await User.find({role : "seller"}).select("-password").lean();
    if (!users) {
      return res.status(404).json({message : "Auth-Service - Admin Route - Get All Seller API - No sellers found"})
    }
    return res.status(200).json({message : "Auth-Service - Admin Route - Get All Seller API - Sellers fetched successfully" , users})
  } catch (error) {
    res.status(500).json({message : `Auth-Service - Admin Route - Get All Seller API - ${error.message}`})
  }
}

const getAllCustomer = async (req , res) => {
  try {
    const users = await User.find({role : "customer"}).select("-password").lean();
    if (users.length === 0) {
      return res.status(404).json({message : "Auth-Service - Admin Route - Get All Customer API - No customers exist"})
    }
    return res.status(200).json({message : "Auth-Service - Admin Route - Get All Customer API - Customers fetched successfully" , users})
  } catch (error) {
    res.status(500).json({message : `Auth-Service - Admin Route - Get All Customer API - ${error.message}`})
  }
}

const getAllUser = async (req , res) => {
  try {
    const users = await User.find().select("-password");
    if (users.length === 0) {
      return res.status(404).json({message : "Auth-Service - Admin Route - Get All User API - No users exist"})
    }
    return res.status(200).json({message : "Auth-Service - Admin Route - Get All User API - Users fetched successfully" , users})
  } catch (error) {
    res.status(500).json({message : `Auth-Service - Admin Route - Get All User API - ${error.message}`})
  }
}

const getUser = async (req , res) => {
  try {
    const {id} = req.params;
    if (!id) {
      return res.status(400).json({message : "Auth-Service - Admin Route - Get User API - Id is required"})
    } 
    const user = await User.findOne({_id : id}).select("-password").lean();
    if (!user) {
      return res.status(404).json({message : "Auth-Service - Admin Route - Get User API - User not found"})
    }
    return res.status(200).json({message : "Auth-Service - Admin Route - Get User API - User fetched successfully" , user})
  } catch (error) {
    res.status(500).json({message : `Auth-Service - Admin Route - Get User API - ${error.message}`})
  }
}

module.exports = {approveSeller , rejectSeller , getAllSeller , getAllCustomer , getAllUser , getUser} 