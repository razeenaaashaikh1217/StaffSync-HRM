const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  title: { type: String, required: true }, description: { type: String, default: "" },
  date: { type: Date, required: true }, trainer: { type: String, required: true },
  assignedTo: { type: String, default: "N/A" }
}, { timestamps: true });
module.exports = mongoose.model("Training", schema);
