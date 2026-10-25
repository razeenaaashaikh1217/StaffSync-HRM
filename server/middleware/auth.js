const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Please log in first." });
    const payload = jwt.verify(token, process.env.JWT_SECRET || "development_only_change_me");
    const user = await User.findById(payload.id).select("-password");
    if (!user) return res.status(401).json({ message: "Account not found." });
    req.user = user;
    next();
  } catch (_error) {
    return res.status(401).json({ message: "Session expired. Please log in again." });
  }
}
function allowRoles(...roles) {
  return (req, res, next) => roles.includes(req.user.role)
    ? next()
    : res.status(403).json({ message: "You do not have permission to do that." });
}
module.exports = { protect, allowRoles };
