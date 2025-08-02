// routes/userRoutes.js
import express from "express";
import auth from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

// GET PROFILE
router.get("/profile", auth, (req, res) => {
  res.json(req.user);
});

// UPDATE PROFILE (mobile, location, theme)
router.put("/profile", auth, async (req, res) => {
  const { mobile, location, theme } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { mobile, location, theme },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
