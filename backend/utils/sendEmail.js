require('dotenv').config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false  // <-- ADD THIS
  }
});


async function sendEmail(to, subject, text) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text
    });
    console.log("Email sent successfully to", to, "ID:", info.messageId);
  } catch (err) {
    console.error("Email send failed:", err);
  }
}

module.exports = sendEmail;
