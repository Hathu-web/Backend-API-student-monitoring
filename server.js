const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use("/api/auth", require("./routes/auth"));
app.use("/api/test", require("./routes/test"));

const studentRoutes = require("./routes/student.routes");
app.use("/api/students", studentRoutes);

app.use("/api/attendance", require("./routes/attendance"));

// CONNECT DATABASE
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("Student Monitoring Backend is running");
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

