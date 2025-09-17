// mailer.ts
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "mailpit",
  port: Number(process.env.SMTP_PORT || 1025),
  secure: process.env.SMTP_SECURE === "true",
  auth: (process.env.SMTP_USER && process.env.SMTP_PASS) ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  } : undefined
});

export async function sendMail({
  to,
  subject,
  text,
  html
}: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) {
  return transporter.sendMail({
    from: `"${process.env.FROM_NAME || "App"}" <${process.env.FROM_EMAIL || "no-reply@example.test"}>`,
    to,
    subject,
    text,
    html
  });
}
