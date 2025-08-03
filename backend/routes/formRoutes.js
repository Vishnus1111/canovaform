const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Form = require("../models/Form");
const Response = require("../models/Response");

// ✅ CREATE/SAVE new form
router.post("/save", async (req, res) => {
  try {
    const { projectName, formName, type, pages, conditions, userId } = req.body;

    // Generate a unique link
    const randomSuffix = crypto.randomBytes(4).toString("hex");
    const link = `${projectName.toLowerCase().replace(/\s+/g, "-")}-${randomSuffix}`;

    const newForm = new Form({
      projectName,
      formName,
      type,
      pages,
      conditions,
      link,
      createdBy: userId,
    });

    await newForm.save();
    res.status(201).json({ msg: "Form saved successfully", link: `/form/${link}` });
  } catch (err) {
    console.error("❌ Save Form Error:", err);
    res.status(500).json({ error: "Failed to save form" });
  }
});

// ✅ UPDATE form (used for draft save/update)
router.put("/update/:formId", async (req, res) => {
  try {
    const updated = await Form.findByIdAndUpdate(
      req.params.formId,
      { ...req.body },
      { new: true }
    );
    res.status(200).json(updated);
  } catch (err) {
    console.error("❌ Update Form Error:", err);
    res.status(500).json({ error: "Failed to update form" });
  }
});

// ✅ GET form by unique link (used in preview or live)
router.get("/:link", async (req, res) => {
  try {
    const form = await Form.findOne({ link: req.params.link });
    if (!form) return res.status(404).json({ error: "Form not found" });
    res.json(form);
  } catch (err) {
    console.error("❌ Get Form by Link Error:", err);
    res.status(500).json({ error: "Failed to fetch form" });
  }
});

// ✅ SUBMIT response to a form
router.post("/:formId/submit", async (req, res) => {
  try {
    const { responses } = req.body;
    const form = await Form.findById(req.params.formId);
    if (!form) return res.status(404).json({ error: "Form not found" });

    const newResponse = new Response({ formId: form._id, responses });
    await newResponse.save();

    res.json({ msg: "Response submitted successfully" });
  } catch (err) {
    console.error("❌ Submit Response Error:", err);
    res.status(500).json({ error: "Failed to submit response" });
  }
});

// ✅ GET analytics: total forms + total responses
router.get("/analytics/overview/:userId", async (req, res) => {
  try {
    const forms = await Form.find({ createdBy: req.params.userId });
    const formIds = forms.map(f => f._id);
    const totalResponses = await Response.countDocuments({ formId: { $in: formIds } });

    res.json({
      totalForms: forms.length,
      totalResponses,
    });
  } catch (err) {
    console.error("❌ Analytics Overview Error:", err);
    res.status(500).json({ error: "Failed to fetch analytics overview" });
  }
});

// ✅ GET analytics: per-option stats (for pie/bar charts)
router.get("/analytics/options/:userId", async (req, res) => {
  try {
    const forms = await Form.find({ createdBy: req.params.userId });
    const formIds = forms.map(f => f._id);
    const responses = await Response.find({ formId: { $in: formIds } });

    const optionStats = {};
    responses.forEach(response => {
      Object.entries(response.responses).forEach(([questionId, answer]) => {
        if (!optionStats[questionId]) {
          optionStats[questionId] = { total: 0, options: {} };
        }
        optionStats[questionId].total++;
        optionStats[questionId].options[answer] =
          (optionStats[questionId].options[answer] || 0) + 1;
      });
    });

    const result = {};
    for (const [questionId, data] of Object.entries(optionStats)) {
      const percentages = {};
      for (const [option, count] of Object.entries(data.options)) {
        percentages[option] = ((count / data.total) * 100).toFixed(2);
      }
      result[questionId] = percentages;
    }

    res.json(result);
  } catch (err) {
    console.error("❌ Option Analytics Error:", err);
    res.status(500).json({ error: "Failed to fetch option analytics" });
  }
});

// ✅ GET all projects (forms) created by a user
router.get("/projects/:userId", async (req, res) => {
  try {
    const projects = await Form.find({ createdBy: req.params.userId })
      .select("projectName formName link createdAt updatedAt")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (err) {
    console.error("❌ Fetch Projects Error:", err);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

module.exports = router;
