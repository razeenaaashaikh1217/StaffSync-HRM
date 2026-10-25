const router = require("express").Router();
const Leave = require("../models/Leave");
const { protect, allowRoles } = require("../middleware/auth");
router.use(protect);
router.get("/", async (req, res) => {
  try { const filter = req.user.role === "HR" || req.user.role === "Manager" ? {} : { user: req.user._id }; res.json(await Leave.find(filter).sort({ createdAt: -1 })); }
  catch (e) { res.status(500).json({ message: "Could not load leave requests.", error: e.message }); }
});
router.post("/", async (req, res) => {
  try {
    const { startDate, endDate, reason } = req.body;
    if (!startDate || !endDate || !reason) return res.status(400).json({ message: "Start date, end date and reason are required." });
    if (new Date(endDate) < new Date(startDate)) return res.status(400).json({ message: "End date cannot be before start date." });
    const leave = await Leave.create({ user: req.user._id, name: req.user.name, email: req.user.email, startDate, endDate, reason });
    res.status(201).json(leave);
  } catch (e) { res.status(400).json({ message: "Could not apply for leave.", error: e.message }); }
});
router.patch("/:id/status", allowRoles("HR"), async (req, res) => {
  try {
    if (!["Approved", "Rejected"].includes(req.body.status)) return res.status(400).json({ message: "Status must be Approved or Rejected." });
    const leave = await Leave.findByIdAndUpdate(req.params.id, { status: req.body.status, reviewedBy: req.user.name }, { new: true });
    if (!leave) return res.status(404).json({ message: "Leave request not found." });
    res.json(leave);
  } catch (e) { res.status(400).json({ message: "Could not update leave.", error: e.message }); }
});
module.exports = router;
