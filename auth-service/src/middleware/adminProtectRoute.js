const User = require("../models/user.model");

const adminProtectRoute = async (req , res , next) => {
  try {
    const {email} = req.user;
    const user = await User.findOne({email}).lean();
    if (!user) {
      return res.status(404).json({message : "Auth-Service - Admin Protect Middleware - adminProtectRoute - User not found"})
    }
    if (user.role !== "admin") {
      return res.status(403).json({message : "Auth-Service - Admin Protect Middleware - adminProtectRoute - User is not an admin"})
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({message : `Auth-Service - Admin Protect Middleware - adminProtectRoute - ${error.message}`})
  }
}

module.exports = {adminProtectRoute};