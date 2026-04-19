const adminCheckMiddleware = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Order-Service - Admin Check Middleware - adminCheckMiddleware - Unauthorized" });
  }
  next();
};

module.exports = {adminCheckMiddleware};