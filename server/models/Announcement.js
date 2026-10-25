const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  title: { type: String, required: true }, message: { type: String, required: true },
  audience: { type: String, default: "All" }, createdBy: { type: String, default: "HR" }
}, { timestamps: true });
module.exports = mongoose.model("Announcement", schema);
