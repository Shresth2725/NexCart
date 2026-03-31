const adminCheckMiddleware = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Products-Service - Admin Check Middleware - adminCheckMiddleware - Unauthorized" });
  }
  next();
};

module.exports = {adminCheckMiddleware};