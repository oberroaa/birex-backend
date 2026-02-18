import nodemailer from 'nodemailer';

// ── Transporter configurado con Gmail ─────────────────────────────────────────
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Verifica la conexión con el servidor de correo al iniciar.
 * Solo corre en desarrollo para no bloquear producción.
 */
if (process.env.NODE_ENV !== 'production') {
    transporter.verify((error) => {
        if (error) {
            console.error('[EMAIL SERVICE] Connection failed:', error.message);
        } else {
            console.log('[EMAIL SERVICE] Ready to send emails ✅');
        }
    });
}

/**
 * Plantilla HTML del email
 */
const buildEmailTemplate = (greeting, message) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Email</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:#4F46E5;padding:32px 40px;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Admin Panel</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px;color:#1F2937;font-size:20px;">${greeting}</h2>
              <p style="margin:0 0 24px;color:#4B5563;font-size:15px;line-height:1.7;">${message}</p>
              <hr style="border:none;border-top:1px solid #E5E7EB;margin:24px 0;" />
              <p style="margin:0;color:#9CA3AF;font-size:12px;">
                This email was sent from the administration panel. Please do not reply to this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F9FAFB;padding:20px 40px;border-top:1px solid #E5E7EB;">
              <p style="margin:0;color:#D1D5DB;font-size:11px;text-align:center;">
                © ${new Date().getFullYear()} Admin Panel · All rights reserved
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

/**
 * @param {Object} options
 * @param {string} options.to        - Recipient email
 * @param {string} options.subject   - Email subject
 * @param {string} options.greeting  - Greeting line (e.g. "Hello John")
 * @param {string} options.message   - Main body message
 */
const sendEmailToUser = async ({ to, subject, greeting, message }) => {
    const info = await transporter.sendMail({
        from: `"Admin Panel" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html: buildEmailTemplate(greeting, message),
    });

    console.log(`[EMAIL SERVICE] Email sent → ${to} | MessageId: ${info.messageId}`);
    return info;
};

export { sendEmailToUser };