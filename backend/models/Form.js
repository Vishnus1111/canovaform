const mongoose = require("mongoose");

const formSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  formName: { type: String, required: true },
  type: { type: String, default: "default" },
  link: { type: String, unique: true }, // Unique shareable link
  pages: { type: Array, required: true }, // Form structure (sections, questions, etc.)
  conditions: { type: Object, default: {} },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Optional: track creator
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Form", formSchema);
