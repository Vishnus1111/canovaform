const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Form = require("../models/Form");
const Response = require("../models/Response");

// ✅ Save Form
router.post("/save", async (req, res) => {
  try {
    const { projectName, formName, type, pages, conditions, userId } = req.body;

    // Generate random link
    const randomSuffix = crypto.randomBytes(4).toString("hex"); // 8 chars
    const link = `${projectName.toLowerCase().replace(/\s+/g, "-")}-${randomSuffix}`;

    const newForm = new Form({ projectName, formName, type, pages, conditions, link, createdBy: userId });
    await newForm.save();

    res.status(201).json({ msg: "Form saved successfully", link: `/form/${link}` });
  } catch (err) {
    console.error("❌ Save Form Error:", err);
    res.status(500).json({ error: "Failed to save form" });
  }
});

// ✅ Get Form by Link
router.get("/:link", async (req, res) => {
  try {
    const form = await Form.findOne({ link: req.params.link });
    if (!form) return res.status(404).json({ error: "Form not found" });
    res.json(form);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch form" });
  }
});

// ✅ Submit Response
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

// ✅ Analytics: Overview (Total Forms & Responses)
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

// ✅ Analytics: Option-wise (Pie/Bar Chart Data)
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

    res.json(result); // { questionId: { "Option 1": "60%", "Option 2": "40%" } }
  } catch (err) {
    console.error("❌ Option Analytics Error:", err);
    res.status(500).json({ error: "Failed to fetch option analytics" });
  }
});

// ... existing routes above

// ✅ Fetch All Projects for a User
router.get("/projects/:userId", async (req, res) => {
  try {
    const projects = await Form.find({ createdBy: req.params.userId })
      .select("projectName formName link createdAt updatedAt") // Return only required fields
      .sort({ createdAt: -1 }); // Latest first

    res.json(projects);
  } catch (err) {
    console.error("❌ Fetch Projects Error:", err);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});


module.exports = router;
