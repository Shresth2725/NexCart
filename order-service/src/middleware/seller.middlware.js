const sellerCheckMiddleware = (req, res, next) => {
  if (req.user.role !== "seller") {
    return res.status(403).json({ message: "Order-Service - Seller Check Middleware - sellerCheckMiddleware - Unauthorized" });
  }
  next();
};

module.exports = sellerCheckMiddleware;