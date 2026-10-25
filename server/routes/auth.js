const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Employee = require("../models/Employee");
const { protect } = require("../middleware/auth");
const secret = () => process.env.JWT_SECRET || "development_only_change_me";

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role = "Employee" } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Name, email and password are required." });
    if (password.length < 6) return res.status(400).json({ message: "Password must contain at least 6 characters." });
    if (!["Employee", "HR", "Manager"].includes(role)) return res.status(400).json({ message: "Invalid role." });
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.findOne({ email: normalizedEmail })) return res.status(409).json({ message: "An account with this email already exists." });
    const user = await User.create({ name: name.trim(), email: normalizedEmail, password: await bcrypt.hash(password, 10), role });
    if (role === "Employee") {
      await Employee.updateOne({ email: normalizedEmail }, { $setOnInsert: { name: user.name, email: user.email, department: "General", position: "Employee", salary: 0 } }, { upsert: true });
    }
    const token = jwt.sign({ id: user._id }, secret(), { expiresIn: "7d" });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    console.error("Register error message:", e.message);
    console.error("Register error code:", e.code);
    console.error("Register error namespace:", e.ns);
    res.status(500).json({ message: "Registration failed.", error: e.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(req.body.password || "", user.password))) return res.status(401).json({ message: "Incorrect email or password." });
    const token = jwt.sign({ id: user._id }, secret(), { expiresIn: "7d" });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    console.error("Login error message:", e.message);
    console.error("Login error code:", e.code);
    console.error("Login error namespace:", e.ns);
    res.status(500).json({ message: "Login failed.", error: e.message });
  }
});
router.get("/me", protect, (req, res) => res.json({ user: req.user }));
module.exports = router;
