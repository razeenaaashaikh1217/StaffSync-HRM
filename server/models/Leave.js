const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true }, email: { type: String, required: true },
  startDate: { type: Date, required: true }, endDate: { type: Date, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  reviewedBy: { type: String, default: "" }
}, { timestamps: true });
module.exports = mongoose.model("Leave", schema);
