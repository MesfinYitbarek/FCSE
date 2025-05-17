import jwt from "jsonwebtoken";

// Middleware for authentication
export const authenticate = (req, res, next) => {
  const token = req.header("Authorization");
  console.log("Received Token:", token); 
  if (!token) return res.status(401).json({ message: "Access Denied" });

  try {
    const verified = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    console.error("Token verification error:", err); 
    res.status(400).json({ message: "Invalid Token" });
  }
};

// Role-based access middleware
export const authorize = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Access Forbidden" });
  }
  next();
};