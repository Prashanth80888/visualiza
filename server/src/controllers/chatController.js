import axios from 'axios';

export const handleChat = async (req, res) => {
  const { message, history } = req.body;
  const API_KEY = process.env.AI_API_KEY;

  try {
    const listUrl = `https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`;
    const listRes = await axios.get(listUrl);
    const workingModel = listRes.data.models.find(m => m.supportedGenerationMethods.includes('generateContent'));

    if (!workingModel) throw new Error("No available models.");

    const chatUrl = `https://generativelanguage.googleapis.com/v1/${workingModel.name}:generateContent?key=${API_KEY}`;

    // --- AGENTIC SYSTEM INSTRUCTION ---
    // This tells the AI how to behave and when to trigger an email action.
    const systemInstruction = `
      You are the AutoBiz AI Executive Assistant. 
      Your goal is to help users manage invoices and vendor relations.
      
      IF the user wants to send an email, dispute a price, or follow up with a vendor:
      1. You MUST respond with a JSON object inside your message.
      2. Format: { "isAction": true, "actionType": "EMAIL", "payload": { "recipient": "string", "subject": "string", "body": "string" }, "message": "friendly confirmation" }
      
      IF the user is just asking a question:
      Respond with normal text.
    `;

    const contents = history
      .filter(msg => msg.text && msg.text.trim() !== "")
      .map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

    // Inject the system context into the current message
    contents.push({ 
      role: 'user', 
      parts: [{ text: `${systemInstruction}\n\nUser Message: ${message}` }] 
    });

    const response = await axios.post(chatUrl, { contents });
    const botRawText = response.data.candidates[0].content.parts[0].text;

    // --- NEURAL ACTION PARSER ---
    // This checks if the AI sent a JSON action or just text.
    const jsonMatch = botRawText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      try {
        const actionData = JSON.parse(jsonMatch[0]);
        return res.status(200).json({ 
          success: true, 
          isAction: true, 
          actionData: actionData 
        });
      } catch (e) {
        // Fallback if JSON is malformed
        return res.status(200).json({ success: true, text: botRawText });
      }
    }

    // Default: Regular chat response
    res.status(200).json({ success: true, text: botRawText });

  } catch (error) {
    console.error('--- CHAT ERROR ---', error.message);
    res.status(500).json({ success: false, message: 'Neural link failed.' });
  }
};