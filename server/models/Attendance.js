const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true }, date: { type: Date, required: true },
  checkIn: { type: Date, default: Date.now }, checkOut: { type: Date, default: null },
  status: { type: String, default: "Present" }
}, { timestamps: true });
schema.index({ user: 1, date: 1 }, { unique: true });
module.exports = mongoose.model("Attendance", schema);
