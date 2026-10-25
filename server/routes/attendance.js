const router = require("express").Router();
const Attendance = require("../models/Attendance");
const { protect, allowRoles } = require("../middleware/auth");
router.use(protect);
router.get("/", async (req, res) => {
  try { const filter = req.user.role === "HR" ? {} : { user: req.user._id }; res.json(await Attendance.find(filter).sort({ date: -1 })); }
  catch (e) { res.status(500).json({ message: "Could not load attendance.", error: e.message }); }
});
router.post("/check-in", async (req, res) => {
  try {
    const start = new Date(); start.setHours(0,0,0,0);
    const existing = await Attendance.findOne({ user: req.user._id, date: start });
    if (existing) return res.status(409).json({ message: "You have already checked in today." });
    const record = await Attendance.create({ user: req.user._id, name: req.user.name, date: start, checkIn: new Date() });
    res.status(201).json(record);
  } catch (e) { res.status(400).json({ message: "Check-in failed.", error: e.message }); }
});
router.patch("/:id/check-out", async (req, res) => {
  try {
    const record = await Attendance.findOne({ _id: req.params.id, user: req.user._id });
    if (!record) return res.status(404).json({ message: "Attendance record not found." });
    if (record.checkOut) return res.status(400).json({ message: "Already checked out." });
    record.checkOut = new Date(); await record.save(); res.json(record);
  } catch (e) { res.status(400).json({ message: "Check-out failed.", error: e.message }); }
});
module.exports = router;
