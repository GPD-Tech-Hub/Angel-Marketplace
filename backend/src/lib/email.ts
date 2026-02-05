import nodemailer from 'nodemailer';

const APP_NAME = process.env.APP_NAME || 'Angel Marketplace';
const RESET_BASE_URL = process.env.PASSWORD_RESET_BASE_URL || 'http://localhost:4000';

// Zepto Mail REST API (v1.1) – same approach as your NestJS app
const ZEPTOMAIL_API_KEY = process.env.ZEPTOMAIL_API_KEY || process.env.ZEPTOMAIL_SEND_TOKEN;
const ZEPTOMAIL_FROM_ADDRESS =
  process.env.ZEPTOMAIL_FROM_ADDRESS ||
  process.env.SMTP_FROM?.replace(/^.*<([^>]+)>$/, '$1').trim() ||
  'noreply@yourdomain.com';
const ZEPTOMAIL_FROM_NAME = process.env.ZEPTOMAIL_FROM_NAME || APP_NAME;
const ZEPTOMAIL_API_URL = 'https://api.zeptomail.com/v1.1/email';

const isZeptoConfigured = Boolean(ZEPTOMAIL_API_KEY && ZEPTOMAIL_FROM_ADDRESS);

// Fallback: generic SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth:
    process.env.SMTP_USER && process.env.SMTP_PASS
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
});

const isSmtpConfigured = Boolean(
  process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
);

/**
 * Send email via Zepto Mail REST API (v1.1).
 * Uses Zoho-enczapikey header as in your NestJS MailService.
 */
async function sendViaZeptoMail(
  to: string,
  subject: string,
  htmlBody: string,
  name?: string
): Promise<void> {
  const response = await fetch(ZEPTOMAIL_API_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Zoho-enczapikey ${ZEPTOMAIL_API_KEY}`,
    },
    body: JSON.stringify({
      from: { address: ZEPTOMAIL_FROM_ADDRESS, name: ZEPTOMAIL_FROM_NAME },
      to: [
        {
          email_address: {
            address: to,
            name: name || '',
          },
        },
      ],
      subject,
      htmlbody: htmlBody,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    console.error('Zepto Mail API error:', response.status, errBody);
    throw new Error(`Zepto Mail failed: ${response.status}`);
  }

  const data = await response.json();
  const messageId = data?.data?.[0]?.messageId;
  if (messageId) {
    console.log(`Email sent to ${to}. ID: ${messageId}`);
  }
}

/**
 * Send password reset email.
 * Uses Zepto Mail REST API (ZEPTOMAIL_API_KEY) if set; otherwise SMTP; otherwise logs link in dev.
 */
export async function sendPasswordResetEmail(
  to: string,
  resetToken: string
): Promise<void> {
  const resetUrl = `${RESET_BASE_URL}/reset-password?token=${encodeURIComponent(resetToken)}`;
  const subject = `Reset your ${APP_NAME} password`;
  const textBody = `You requested a password reset. Use this link (valid for 1 hour):\n\n${resetUrl}\n\nIf you didn't request this, ignore this email.`;
  const htmlBody = `
    <p>You requested a password reset.</p>
    <p><a href="${resetUrl}">Reset your password</a> (valid for 1 hour)</p>
    <p>If you didn't request this, ignore this email.</p>
  `;

  if (isZeptoConfigured) {
    await sendViaZeptoMail(to, subject, htmlBody, to);
    return;
  }

  if (isSmtpConfigured) {
    const from = process.env.SMTP_FROM || `"${APP_NAME}" <${ZEPTOMAIL_FROM_ADDRESS}>`;
    await transporter.sendMail({
      from,
      to,
      subject,
      text: textBody,
      html: htmlBody,
    });
    return;
  }

  console.log('[Dev] Password reset email (no Zepto Mail or SMTP configured):', { to, resetUrl });
}
