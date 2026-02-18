import { Router } from 'express';
import { sendEmailToUser } from '../../services/emailService.js';

const router = Router();

/**
 * @route   POST /api/admin/email/send
 * @desc    Send email to a specific user
 * @access  Private (Admin)
 */
router.post('/send', async (req, res) => {
    try {
        const { email, subject, greeting, message } = req.body;

        // ── Validaciones ──────────────────────────────────────────────
        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Recipient email is required',
            });
        }

        if (!subject || subject.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Email subject is required',
            });
        }

        if (!message || message.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Email message is required',
            });
        }

        // ── Enviar email ───────────────────────────────────────────────
        await sendEmailToUser({
            to: email,
            subject: subject.trim(),
            greeting: greeting?.trim() || 'Hello',
            message: message.trim(),
        });

        return res.status(200).json({
            success: true,
            message: `Email sent successfully to ${email}`,
        });

    } catch (error) {
        console.error('[EMAIL ROUTE] Error sending email:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Failed to send email. Please try again later.',
        });
    }
});

export default router;