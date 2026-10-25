const router = require("express").Router();
const Employee = require("../models/Employee");
const { protect, allowRoles } = require("../middleware/auth");
router.use(protect);
router.get("/", async (_req, res) => {
  try { res.json(await Employee.find().sort({ createdAt: -1 })); }
  catch (e) { console.error("GET employees:", e); res.status(500).json({ message: "Failed to fetch employees", error: e.message }); }
});
router.post("/", allowRoles("HR"), async (req, res) => {
  try {
    const { name, email, department, position, salary, joinDate, phone, address } = req.body;
    if (!name || !email || !department || !position || salary === "" || salary === undefined) return res.status(400).json({ message: "Name, email, department, position and salary are required." });
    const employee = await Employee.create({ name, email, department, position, salary: Number(salary), joinDate: joinDate || Date.now(), phone, address });
    res.status(201).json({ message: "Employee added successfully", employee });
  } catch (e) { res.status(e.code === 11000 ? 409 : 400).json({ message: e.code === 11000 ? "This email already exists." : "Could not add employee.", error: e.message }); }
});
router.put("/:id", allowRoles("HR"), async (req, res) => {
  try { const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }); if (!employee) return res.status(404).json({ message: "Employee not found." }); res.json(employee); }
  catch (e) { res.status(400).json({ message: "Could not update employee.", error: e.message }); }
});
router.delete("/:id", allowRoles("HR"), async (req, res) => {
  try { const employee = await Employee.findByIdAndDelete(req.params.id); if (!employee) return res.status(404).json({ message: "Employee not found." }); res.json({ message: "Employee deleted." }); }
  catch (e) { res.status(400).json({ message: "Could not delete employee.", error: e.message }); }
});
module.exports = router;
