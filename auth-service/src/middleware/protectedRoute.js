const protect = async (req , res , next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({message : "Unauthorized"})
    }
    const decodedToken = jwt.verify(token , process.env.JWT_SECRET);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(500).json({message : error.message})
  }
}

module.exports = {protect}