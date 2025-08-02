const tls = require("tls");

const fromEmail = "meghakalaiselvi@gmail.com"; // Your email
const fromPassword = "sqofsaixwzoognfm"; // Your Gmail App Password
const toEmail = "vishnu90360@gmail.com"; // Test email to receive OTP
const subject = "SMTP Test Email";
const body = "This is a test email sent via raw SMTP!";

async function sendEmailSMTP() {
  return new Promise((resolve, reject) => {
    const socket = tls.connect(465, "smtp.gmail.com", () => {
      console.log("✅ Connected to Gmail SMTP");

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
        console.log("📩 SMTP Response:", data.toString());
        if (step < commands.length) {
          socket.write(commands[step]);
          step++;
        }
        if (data.toString().includes("250 2.0.0 OK")) {
          console.log("✅ Email sent successfully!");
          resolve();
          socket.end();
        }
      });

      socket.on("error", (err) => {
        console.error("❌ SMTP Error:", err);
        reject(err);
      });
    });
  });
}

sendEmailSMTP();
