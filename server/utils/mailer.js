const nodemailer = require('nodemailer');

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  const resendKey = process.env.RESEND_API_KEY;
  console.log('[Mailer] RESEND_API_KEY:', resendKey ? `SET (${resendKey.slice(0, 4)}...)` : 'NOT SET');

  if (resendKey) {
    // ponytail: Resend via SMTP — no SDK needed, nodemailer already installed
    console.log('[Mailer] Transport selected: resend');
    transporter = nodemailer.createTransport({
      host: 'smtp.resend.com',
      port: 587,
      auth: { user: 'resend', pass: resendKey }
    });
  } else if (process.env.SMTP_HOST) {
    console.log('[Mailer] Transport selected: smtp_host');
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
  } else if (IS_PRODUCTION) {
    // In production, SMTP must be explicitly configured.
    throw new Error(
      '[Mailer] CRITICAL: SMTP_HOST is not set. Cannot send emails in production without a configured mail server.'
    );
  } else {
    // Development / demo mode: auto-create a free Ethereal test account.
    console.log('[Mailer] Transport selected: ethereal');
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: { user: testAccount.user, pass: testAccount.pass }
    });
  }
  return transporter;
}

exports.sendResetEmail = async (to, resetUrl) => {
  const t = await getTransporter();
  const info = await t.sendMail({
    from: process.env.SMTP_FROM || 'EduFlow AI <noreply@eduflow.ai>',
    to,
    subject: 'EduFlow AI — Reset Your Password',
    text: `You requested a password reset.\n\nClick the link below (valid 1 hour):\n${resetUrl}\n\nIf you didn't request this, ignore this email.`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#6366f1">EduFlow AI</h2>
        <p>You requested a password reset. Click the button below (valid for <strong>1 hour</strong>).</p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">
          Reset Password
        </a>
        <p style="color:#888;font-size:12px">Or paste this link: ${resetUrl}</p>
        <p style="color:#888;font-size:12px">If you didn't request this, you can safely ignore this email.</p>
      </div>`
  });

  // In Ethereal / demo mode, log the preview link so developers can verify
  const preview = nodemailer.getTestMessageUrl(info);
  if (preview) {
    console.log(`\n📧 [EduFlow] Password reset email preview: ${preview}\n`);
  }
};
