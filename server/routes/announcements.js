const router = require("express").Router();
const Announcement = require("../models/Announcement");
const { protect, allowRoles } = require("../middleware/auth");
router.use(protect);
router.get("/", async (req, res) => {
  try { res.json(await Announcement.find({ $or: [{ audience: "All" }, { audience: req.user.role }] }).sort({ createdAt: -1 })); }
  catch (e) { res.status(500).json({ message: "Could not load announcements.", error: e.message }); }
});
router.post("/", allowRoles("HR"), async (req, res) => {
  try { const { title, message, audience = "All" } = req.body; if (!title || !message) return res.status(400).json({ message: "Title and message are required." }); res.status(201).json(await Announcement.create({ title, message, audience, createdBy: req.user.name })); }
  catch (e) { res.status(400).json({ message: "Could not create announcement.", error: e.message }); }
});
module.exports = router;
