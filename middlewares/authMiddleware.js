const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }
  const token = req.headers.authorization?.split(" ")[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Forbidden: Invalid User" });
    req.user = decoded;
    next();
  });
};
const checkRole = (role) => (req, res, next) => {
  if (req.user.role != role)
    return res.status(403).json({ error: "Forbidden: Insufficient Rights!" });
  next();
};
module.exports = { authMiddleware, checkRole };
