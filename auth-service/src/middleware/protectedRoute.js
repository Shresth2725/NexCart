const jwt = require("jsonwebtoken");
const User = require("../models/user.model.js");

const protect = async (req , res , next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({message : "Unauthorized"})
    }
    const decodedToken = jwt.verify(token , process.env.JWT_SECRET);
    const id = decodedToken.id;
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({message : "User not found"})
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({message : error.message})
  }
}

module.exports = {protect}