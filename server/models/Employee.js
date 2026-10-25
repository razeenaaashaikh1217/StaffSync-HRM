const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  department: { type: String, required: true, trim: true },
  position: { type: String, required: true, trim: true },
  salary: { type: Number, required: true, min: 0 },
  joinDate: { type: Date, default: Date.now },
  phone: { type: String, default: "" },
  address: { type: String, default: "" }
}, { timestamps: true });
module.exports = mongoose.model("Employee", schema);
