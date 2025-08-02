const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const tls = require("tls");
const User = require("../models/User");

const router = express.Router();

// ✅ Debugging middleware for incoming requests
router.use((req, res, next) => {
  console.log(`➡️ [AUTH ROUTE] ${req.method} ${req.originalUrl}`);
  console.log("📩 Request Body:", req.body);
  next();
});

// ✅ Generate OTP
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

// ✅ Improved Raw SMTP Email Sender (Enhanced Debugging)
async function sendEmailSMTP(fromEmail, fromPassword, toEmail, subject, body) {
  return new Promise((resolve, reject) => {
    console.log(`📧 Connecting to Gmail SMTP for ${toEmail}...`);
    const socket = tls.connect(465, "smtp.gmail.com", () => {
      console.log("✅ SMTP connected securely");
      let step = 0;

      const commands = [
        `EHLO smtp.gmail.com\r\n`,
        `AUTH LOGIN\r\n`,
        Buffer.from(fromEmail).toString("base64") + "\r\n",
        Buffer.from(fromPassword).toString("base64") + "\r\n",
        `MAIL FROM:<${fromEmail}>\r\n`,
        `RCPT TO:<${toEmail}>\r\n`,
        `DATA\r\n`,
        `Subject: ${subject}\r\nFrom: ${fromEmail}\r\nTo: ${toEmail}\r\n\r\n${body}\r\n.\r\n`,
        `QUIT\r\n`,
      ];

      socket.on("data", (data) => {
        const response = data.toString();
        console.log("📨 SMTP Response:", response.trim());

        if (step < commands.length) {
          socket.write(commands[step]);
          step++;
        }
        if (response.includes("250 2.0.0 OK")) {
          console.log("✅ Email sent successfully!");
          resolve("Email sent successfully!");
          socket.end();
        }
      });

      socket.setTimeout(10000, () => { // ⏱ Timeout after 10 sec
        reject(new Error("SMTP Timeout"));
        socket.end();
      });

      socket.on("error", (err) => {
        console.error("❌ SMTP Error:", err);
        reject(err);
      });
    });
  });
}

// ✅ Register User
// ✅ Register User
router.post("/register", async (req, res) => {
  console.log("📥 Register Request Body:", req.body); // Log incoming data
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    console.log("🔍 Existing User in DB:", existingUser); // Log if user exists

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });

    await user.save();
    console.log("✅ User successfully saved in DB:", JSON.stringify(user, null, 2)); // Show saved user

    res.status(201).json({ msg: "User registered successfully" });
  } catch (err) {
    console.error("❌ Register Error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});


// ✅ Login User
router.post("/login", async (req, res) => {
  console.log("📥 Login Request:", req.body);
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone || "", location: user.location || "" },
    });
  } catch (err) {
    console.error("❌ Login Error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// ✅ Forgot Password (Send OTP)
router.post("/forgot-password", async (req, res) => {
  console.log("📥 Forgot Password Request Body:", req.body);
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    console.log(`🔑 Generated OTP for ${email}: ${otp}`);

    // ✅ Try sending email but don't block UI if it fails
    sendEmailSMTP(process.env.EMAIL_USER, process.env.EMAIL_PASS, email, "Password Reset OTP",
      `Your OTP is: ${otp}. It will expire in 5 minutes.`
    )
      .then(() => console.log(`📧 OTP email sent to ${email}`))
      .catch(err => console.error("❌ Email sending failed:", err));

    // ✅ Respond immediately (frontend won't hang)
    res.json({ msg: "OTP sent (check console for debugging)", otp }); // <-- TEMP include OTP in response for testing
  } catch (err) {
    console.error("❌ Forgot Password Error:", err);
    res.status(500).json({ error: "Failed to process OTP request" });
  }
});



// ✅ Verify OTP
router.post("/verify-otp", async (req, res) => {
  console.log("📥 Verify OTP Request:", req.body);
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    console.log(`🔎 DB OTP: ${user.otp}, Entered OTP: ${otp}`);
    console.log(`⏱ OTP Expiry Time: ${user.otpExpires}, Current Time: ${Date.now()}`);

    // ✅ Ensure both are strings and trim spaces
    if (user.otp.toString().trim() !== otp.toString().trim()) {
      console.log("❌ OTP mismatch");
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // ✅ Check expiry
    if (Date.now() > user.otpExpires) {
      console.log("❌ OTP expired");
      return res.status(400).json({ error: "Expired OTP" });
    }

    console.log("✅ OTP verified successfully for:", email);
    res.json({ msg: "OTP verified successfully" });
  } catch (err) {
    console.error("❌ Verify OTP Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Reset Password
router.post("/reset-password", async (req, res) => {
  console.log("📥 Reset Password Request:", req.body);
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    // ✅ Hash new password
    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.otp = undefined; // clear OTP after reset
    user.otpExpires = undefined;
    await user.save();

    console.log(`✅ Password reset successfully for: ${email}`);
    res.json({ msg: "Password reset successful" });
  } catch (err) {
    console.error("❌ Reset Password Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


router.get("/test", (req, res) => {
  console.log("✅ Auth test route hit successfully");
  res.json({ msg: "Auth route working" });
});

module.exports = router;
