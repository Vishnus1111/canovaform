const mongoose = require("mongoose");

const formSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  formName: { type: String, required: true },
  type: { type: String, default: "default" },
  link: { type: String, unique: true },
  pages: [
    {
      id: String,
      title: String,
      blocks: [
        {
          id: String,
          type: String, // "short", "long", "mcq", "checkbox", "dropdown", "image", "video", etc.
          label: String,
          options: [String], // for dropdown/checkbox/mcq
          required: Boolean,
          mediaUrl: String,  // for image/video
        },
      ],
    },
  ],
  conditions: { type: Object, default: {} },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, default: "draft" }, // NEW FIELD: 'draft' or 'published'
});

module.exports = mongoose.model("Form", formSchema);
