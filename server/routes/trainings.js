const router = require("express").Router();
const Training = require("../models/Training");
const { protect, allowRoles } = require("../middleware/auth");
router.use(protect);
router.get("/", async (_req, res) => { try { res.json(await Training.find().sort({ date: -1 })); } catch (e) { res.status(500).json({ message: "Could not load training sessions.", error: e.message }); } });
router.post("/", allowRoles("Manager"), async (req, res) => {
  try { const { title, description, date, trainer, assignedTo = "N/A" } = req.body; if (!title || !date || !trainer) return res.status(400).json({ message: "Title, date and trainer are required." }); res.status(201).json(await Training.create({ title, description, date, trainer, assignedTo })); }
  catch (e) { res.status(400).json({ message: "Could not create training.", error: e.message }); }
});
router.put("/:id", allowRoles("Manager"), async (req, res) => { try { const t = await Training.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }); if (!t) return res.status(404).json({ message: "Training not found." }); res.json(t); } catch (e) { res.status(400).json({ message: "Could not update training.", error: e.message }); } });
router.delete("/:id", allowRoles("Manager"), async (req, res) => { try { const t = await Training.findByIdAndDelete(req.params.id); if (!t) return res.status(404).json({ message: "Training not found." }); res.json({ message: "Training deleted." }); } catch (e) { res.status(400).json({ message: "Could not delete training.", error: e.message }); } });
module.exports = router;
