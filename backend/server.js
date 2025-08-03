const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// ✅ Debug every incoming request globally
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.originalUrl}`);
  next();
});

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log(`✅ MongoDB connected to: ${mongoose.connection.name}`))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/forms", require("./routes/formRoutes"));

// ✅ Catch-all for unmatched routes (debugging)
app.use((req, res) => {
  console.log(`❌ Route Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: "Route not found" });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
