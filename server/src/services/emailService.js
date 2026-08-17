const nodemailer = require("nodemailer");

let transporter = null;
let emailDisabledReasonLogged = false;

const getTransporter = () => {
  if (transporter) {
    return transporter;
  }

  const requiredEnv = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"];
  const missing = requiredEnv.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    if (!emailDisabledReasonLogged) {
      console.warn(
        `Email alerts disabled. Missing SMTP configuration: ${missing.join(", ")}`
      );
      emailDisabledReasonLogged = true;
    }
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE).toLowerCase() === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
};

const sendEmail = async ({ to, subject, text, html }) => {
  const activeTransporter = getTransporter();

  if (!activeTransporter) {
    return false;
  }

  await activeTransporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });

  return true;
};

module.exports = { sendEmail };
