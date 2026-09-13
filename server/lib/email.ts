import nodemailer, { type Transporter } from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

let cachedTransporter: Transporter | null = null;

/**
 * Initializes or reuses a nodemailer transporter.
 * Supports standard SMTP config (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS),
 * falling back to Nodemailer's Ethereal test account in dev/test environments.
 */
async function getTransporter(): Promise<Transporter> {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  // 1. Check for explicit production SMTP configuration
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    cachedTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    return cachedTransporter;
  }

  // 2. Fallback: Create Ethereal test account for real previewable email delivery in dev
  try {
    const testAccount = await nodemailer.createTestAccount();
    cachedTransporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`📧 Ethereal Email test account initialized: ${testAccount.user}`);
    return cachedTransporter;
  } catch (err: any) {
    console.warn('⚠️ Could not initialize Ethereal test account, using JSON transport fallback:', err.message);
    cachedTransporter = nodemailer.createTransport({
      jsonTransport: true,
    });
    return cachedTransporter;
  }
}

/**
 * Sends a real-time verification email with CodeLens AI branding and 6-digit OTP.
 */
export async function sendVerificationOtpEmail(recipientEmail: string, otpCode: string): Promise<boolean> {
  try {
    const transporter = await getTransporter();

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CodeLens AI Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #070b0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #070b0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background: #0f1715; border: 1px solid rgba(94, 210, 156, 0.25); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; background: linear-gradient(135deg, rgba(21, 156, 99, 0.15) 0%, rgba(15, 23, 21, 0.6) 100%); border-bottom: 1px solid rgba(255,255,255,0.06); text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff;">
                CodeLens <span style="color: #5ed29c;">AI</span>
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #94a3b8; letter-spacing: 0.5px; text-transform: uppercase;">
                Account Verification
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 24px; color: #cbd5e1;">
                Hello,
              </p>
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 24px; color: #cbd5e1;">
                Thank you for joining <strong>CodeLens AI</strong>. Please use the following 6-digit verification code to confirm your email and activate your developer workspace:
              </p>

              <!-- OTP Display Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background: #070b0a; border: 1px solid #159c63; border-radius: 12px; padding: 18px 36px; text-align: center; box-shadow: 0 0 20px rgba(94, 210, 156, 0.15);">
                      <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #5ed29c;">
                        ${otpCode}
                      </span>
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 8px 0; font-size: 13px; color: #94a3b8; text-align: center;">
                ⏳ This code is valid for <strong>5 minutes</strong>.
              </p>

              <div style="margin: 28px 0 0 0; padding: 16px; background: rgba(255,255,255,0.03); border-radius: 8px; border-left: 3px solid #f59e0b;">
                <p style="margin: 0; font-size: 12px; line-height: 18px; color: #94a3b8;">
                  🔒 <strong>Security Notice:</strong> Never share this code with anyone. CodeLens AI engineers will never ask for your verification code. If you did not make this request, you can safely ignore this email.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background: #070b0a; border-top: 1px solid rgba(255,255,255,0.06); text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #64748b;">
                © ${new Date().getFullYear()} CodeLens AI. Production Code Intelligence &amp; Automated Security Scanning.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const text = `CodeLens AI Verification Code: ${otpCode}\n\nThis code expires in 5 minutes.\nIf you did not request this verification, please ignore this email.`;

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"CodeLens AI" <no-reply@codelens.ai>',
      to: recipientEmail,
      subject: `Your CodeLens AI Verification Code: ${otpCode}`,
      text,
      html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`📨 Verification email dispatched to ${recipientEmail} | Preview: ${previewUrl}`);
    } else {
      console.log(`📨 Verification email successfully dispatched to ${recipientEmail}`);
    }

    return true;
  } catch (error: any) {
    console.error('❌ Failed to dispatch verification email:', error);
    return false;
  }
}

/**
 * Sends a professional password reset link email with CodeLens AI branding.
 */
export async function sendPasswordResetEmail(recipientEmail: string, resetLink: string, userName?: string): Promise<boolean> {
  try {
    const transporter = await getTransporter();
    const displayName = userName || recipientEmail.split('@')[0];

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your CodeLens AI Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #070b0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #070b0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background: #0f1715; border: 1px solid rgba(94, 210, 156, 0.25); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; background: linear-gradient(135deg, rgba(21, 156, 99, 0.15) 0%, rgba(15, 23, 21, 0.6) 100%); border-bottom: 1px solid rgba(255,255,255,0.06); text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff;">
                CodeLens <span style="color: #5ed29c;">AI</span>
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #94a3b8; letter-spacing: 0.5px; text-transform: uppercase;">
                Account Security &amp; Password Recovery
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 24px; color: #cbd5e1;">
                Hello ${displayName},
              </p>
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 24px; color: #cbd5e1;">
                We received a request to reset the password for your CodeLens AI developer account. Click the button below to choose a new password:
              </p>

              <!-- Reset Password Action Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetLink}" target="_blank" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #159C63 0%, #10b981 100%); color: #ffffff; text-decoration: none; font-weight: 700; font-size: 15px; border-radius: 12px; letter-spacing: 0.3px; box-shadow: 0 4px 16px rgba(21, 156, 99, 0.35);">
                      RESET PASSWORD
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Direct Link Fallback -->
              <p style="margin: 24px 0 8px 0; font-size: 12px; line-height: 18px; color: #94a3b8;">
                If the button above does not work, copy and paste this link into your web browser:
              </p>
              <p style="margin: 0 0 24px 0; font-size: 11px; line-height: 16px; word-break: break-all; color: #5ed29c;">
                <a href="${resetLink}" style="color: #5ed29c; text-decoration: underline;">${resetLink}</a>
              </p>

              <!-- Security Notice -->
              <div style="background: rgba(239, 68, 68, 0.08); border-left: 3px solid #ef4444; border-radius: 6px; padding: 12px 16px; margin-top: 24px;">
                <p style="margin: 0; font-size: 12px; line-height: 18px; color: #fca5a5;">
                  <strong>Security Notice:</strong> This password reset link is valid for <strong>15 minutes</strong> and can only be used once. If you did not make this request, please safely disregard this email—your existing password remains secure.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background: #070b0a; border-top: 1px solid rgba(255,255,255,0.06); text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #64748b;">
                © ${new Date().getFullYear()} CodeLens AI. Production Code Intelligence &amp; Automated Security Scanning.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const text = `Reset Your CodeLens AI Password\n\nClick the link below to create a new password:\n${resetLink}\n\nThis link is valid for 15 minutes.\nIf you did not request a password reset, please ignore this email.`;

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"CodeLens AI" <no-reply@codelens.ai>',
      to: recipientEmail,
      subject: 'Reset your CodeLens AI password',
      text,
      html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`📨 Password reset email dispatched to ${recipientEmail} | Preview: ${previewUrl}`);
    } else {
      console.log(`📨 Password reset email successfully dispatched to ${recipientEmail}`);
    }

    return true;
  } catch (error: any) {
    console.error('❌ Failed to dispatch password reset email:', error);
    return false;
  }
}

