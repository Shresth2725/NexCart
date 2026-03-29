const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Products-Service - Auth Middleware - authMiddleware - No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    

    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Products-Service - Auth Middleware - authMiddleware - Invalid token" });
  }
};

module.exports = { authMiddleware };