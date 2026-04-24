import { generateEmailContent } from '../services/aiService.js';
import EmailLog from '../models/EmailLog.js';

/**
 * @desc    Generate AI Email, Audit Data, and Log Transaction
 * @route   POST /api/v1/emails/generate
 */
export const createEmail = async (req, res) => {
  const { prompt, contextText, recipientName, invoiceData } = req.body;
  
  // Prevent crash if auth middleware is not present
  const userId = req.user?.id || null; 

  if (!prompt || !contextText) {
    return res.status(400).json({ 
      success: false, 
      message: 'Neural Error: Prompt and Context are required for synthesis.' 
    });
  }

  try {
    // 1. ENHANCED CONTEXT - Forced Formatting Instructions
    const neuralPrompt = `
      Write a professional business email. 
      Target Intent: ${prompt}
      Business Context: ${contextText}
      Technical Status: ${invoiceData?.isAnomaly ? 'Anomalies Detected' : 'Verified'}
      
      STRICT FORMATTING RULES:
      - Start ONLY with 'Subject: [Subject Line]'
      - Do not include any headers like "Task:", "User Intent:", or "Requirements:"
      - Do not include any instructions or notes in the response.
      - Use a world-class, professional executive tone.
    `;

    // 2. AI Generation Phase
    const content = await generateEmailContent(neuralPrompt, contextText);

    // 3. CLEANING & FILTERING PHASE
    // This removes any accidental instruction lines the AI might return
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

    // Find the actual Subject line
    const subjectIdx = lines.findIndex(l => l.toLowerCase().startsWith('subject:'));
    
    if (subjectIdx !== -1) {
      // Extract Subject
      subjectLine = lines[subjectIdx].replace(/Subject:/i, '').replace(/\*/g, '').trim();
      // Everything after the Subject line is the Body
      emailBody = lines.slice(subjectIdx + 1).join('\n').trim();
    } else {
      // Fallback if AI skips the Subject header
      emailBody = lines.join('\n').trim();
    }

    // 4. Persistence Phase
    if (userId) {
       try {
         const newLog = new EmailLog({
           user: userId,
           recipient: recipientName || "Unspecified Recipient",
           subject: subjectLine,
           body: emailBody,
           status: 'Generated',
           metadata: { anomalyDetected: invoiceData?.isAnomaly || false }
         });
         await newLog.save();
       } catch (logErr) {
         console.warn("Log could not be saved, but sending email anyway.");
       }
    }

    // 5. Response - Perfect for Email.jsx
    res.status(200).json({ 
      success: true, 
      content: {
        subject: subjectLine,
        body: emailBody
      }
    });

  } catch (error) {
    console.error(`[NEURAL_MAIL_ERROR]: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      message: 'AI Synthesis Interrupted'
    });
  }
};