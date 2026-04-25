import axios from 'axios';

// 🔥 Use fixed stable model (no discovery needed)
const MODEL_NAME = "models/gemini-2.0-flash";

export const generateEmailContent = async (neuralPrompt, contextText) => {
  const API_KEY = process.env.AI_API_KEY;

  try {
    const chatUrl = `https://generativelanguage.googleapis.com/v1beta/${MODEL_NAME}:generateContent?key=${API_KEY}`;

    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [{ text: neuralPrompt }]
        }
      ],
      generationConfig: {
        temperature: 0.7
      }
    };

    const response = await axios.post(chatUrl, requestBody);

    const aiText =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiText) {
      throw new Error("Empty AI response");
    }

    return aiText;

  } catch (error) {
    // ✅ CLEAN LOG (no scary dump)
    console.warn("AI busy → using fallback email");

    // 🔥 SMART FALLBACK EMAIL
    return `Subject: Invoice Communication

Dear ${contextText?.recipientName || "Customer"},

We hope you are doing well.

This is regarding your invoice details: ${contextText || "N/A"}.

Kindly review and take necessary action at your earliest convenience.

Thank you for your business.

Best regards,  
Finance Team`;
  }
};