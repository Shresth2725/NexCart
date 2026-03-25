const User = require("../models/user.model.js");

// admin

const approveSeller = async (req , res) => {
  try {
    const {email} = req.body;
    if (!email) {
      return res.status(400).json({message : "Email is required"})
    }
    const user = await User.findOne({email}).lean();
    if (!user) {
      return res.status(404).json({message : "User not found"})
    }
    if (user.role !== "seller") {
      return res.status(400).json({message : "User is not a seller"})
    }
    await User.updateOne({email} , {$set : {isVerified : true}});
    return res.status(200).json({message : "Seller approved successfully"})
  } catch (error) {
    res.status(500).json({message : error.message})
  }
}

const rejectSeller = async (req , res) => {
  try {
    const {email} = req.body;
    if (!email) {
      return res.status(400).json({message : "Email is required"})
    }
    const user = await User.findOne({email}).lean();
    if (!user) {
      return res.status(404).json({message : "User not found"})
    }
    if (user.role !== "seller") {
      return res.status(400).json({message : "User is not a seller"})
    }
    await User.updateOne({email} , {$set : {isVerified : false}});
    return res.status(200).json({message : "Seller rejected successfully"})
  } catch (error) {
    res.status(500).json({message : error.message})
  }
}

const getAllSeller = async (req , res) => {
  try {
    const users = await User.find({role : "seller"}).lean();
    if (!users) {
      return res.status(404).json({message : "No sellers found"})
    }
    return res.status(200).json({message : "Sellers fetched successfully" , users})
  } catch (error) {
    res.status(500).json({message : error.message})
  }
}

const getAllCustomer = async (req , res) => {
  try {
    const users = await User.find({role : "customer"}).lean();
    if (!users) {
      return res.status(404).json({message : "No customers found"})
    }
    return res.status(200).json({message : "Customers fetched successfully" , users})
  } catch (error) {
    res.status(500).json({message : error.message})
  }
}

module.exports = {approveSeller , rejectSeller , getAllSeller , getAllCustomer} 