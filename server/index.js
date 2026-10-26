const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://staff-sync-hrm.vercel.app"
  ]
}));
app.use(express.json());

app.get("/", (_req, res) => res.json({ message: "StaffSync HRM Backend is running!" }));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/employees", require("./routes/employees"));
app.use("/api/leaves", require("./routes/leaves"));
app.use("/api/attendance", require("./routes/attendance"));
app.use("/api/announcements", require("./routes/announcements"));
app.use("/api/trainings", require("./routes/trainings"));

app.use((err, _req, res, _next) => {
  console.error("Unhandled API error:", err);
  res.status(500).json({ message: "Server error", error: err.message });
});

const PORT = process.env.PORT || 8000;
if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is missing. Create server/.env from server/.env.example.");
  process.exit(1);
}
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");
    app.listen(PORT, () => console.log(`StaffSync server running on http://localhost:${PORT}`));
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
