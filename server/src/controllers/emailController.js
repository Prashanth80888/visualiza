import { generateEmailContent } from '../services/aiService.js';
import EmailLog from '../models/EmailLog.js';

/**
 * @desc    Generate AI Email, Audit Data, and Log Transaction
 * @route   POST /api/v1/emails/generate
 */
export const createEmail = async (req, res) => {
  const { prompt, contextText, recipientName, invoiceData } = req.body;

  const userId = req.user?.id || null;

  if (!prompt || !contextText) {
    return res.status(400).json({
      success: false,
      message: 'Neural Error: Prompt and Context are required for synthesis.'
    });
  }

  try {
    // =========================
    // 1) PROMPT
    // =========================
    const neuralPrompt = `
Write a professional business email. 
Target Intent: ${prompt}
Business Context: ${contextText}
Technical Status: ${invoiceData?.isAnomaly ? 'Anomalies Detected' : 'Verified'}

STRICT RULES:
- Start ONLY with 'Subject:'
- No instructions or metadata
- Professional executive tone
`;

    let content;
    let usedFallback = false;

    // =========================
    // 2) AI TRY
    // =========================
    try {
      content = await generateEmailContent(neuralPrompt, contextText);
    } catch (err) {
      console.log("AI EMAIL FAILED → Using fallback");
      usedFallback = true;

      // =========================
      // 🔥 FALLBACK EMAIL
      // =========================
      content = `
Subject: Payment Reminder for Invoice ${invoiceData?.reference || ''}

Dear ${recipientName || 'Customer'},

We hope you are doing well.

This is a reminder regarding invoice ${
        invoiceData?.reference || ''
      } dated ${invoiceData?.date || ''} for an amount of ₹${
        invoiceData?.amount || ''
      }.

${
  invoiceData?.isAnomaly
    ? '⚠ We noticed discrepancies in the invoice. Kindly review and confirm.'
    : 'The invoice has been verified successfully.'
}

We kindly request you to process the payment at your earliest convenience.

Thank you for your business.

Best regards,  
Finance Team
`;
    }

    // =========================
    // 3) CLEANING
    // =========================
    const lines = content.split('\n').filter(line => {
      const l = line.toLowerCase().trim();
      return !l.startsWith('task:') &&
             !l.startsWith('user intent:') &&
             !l.startsWith('requirements:') &&
             !l.startsWith('technical audit:') &&
             !l.startsWith('**task') &&
             !l.startsWith('**requirements');
    });

    let subjectLine = 'AI Generated Business Correspondence';
    let emailBody = "";

    const subjectIdx = lines.findIndex(l =>
      l.toLowerCase().startsWith('subject:')
    );

    if (subjectIdx !== -1) {
      subjectLine = lines[subjectIdx]
        .replace(/Subject:/i, '')
        .replace(/\*/g, '')
        .trim();

      emailBody = lines.slice(subjectIdx + 1).join('\n').trim();
    } else {
      emailBody = lines.join('\n').trim();
    }

    // =========================
    // 4) SAVE LOG
    // =========================
    if (userId) {
      try {
        const newLog = new EmailLog({
          user: userId,
          recipient: recipientName || "Unspecified Recipient",
          subject: subjectLine,
          body: emailBody,
          status: usedFallback ? 'Fallback Generated' : 'AI Generated',
          metadata: {
            anomalyDetected: invoiceData?.isAnomaly || false
          }
        });

        await newLog.save();
      } catch (logErr) {
        console.warn("Log save failed, continuing...");
      }
    }

    // =========================
    // 5) RESPONSE
    // =========================
    res.status(200).json({
      success: true,
      content: {
        subject: subjectLine,
        body: emailBody
      },
      meta: {
        usedFallback
      }
    });

  } catch (error) {
    console.error(`[NEURAL_MAIL_ERROR]: ${error.message}`);

    // ❗ LAST RESORT FALLBACK (never fail API)
    res.status(200).json({
      success: true,
      content: {
        subject: "Invoice Communication",
        body: "Dear Customer,\n\nPlease review your invoice.\n\nRegards,\nTeam"
      },
      meta: {
        usedFallback: true
      }
    });
  }
};