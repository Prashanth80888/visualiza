import axios from 'axios';

let cachedModelName = null;

export const generateEmailContent = async (neuralPrompt, contextText) => {
  const API_KEY = process.env.AI_API_KEY;

  try {
    // 1. Only discover the model if we haven't already (prevents 503 Rate Limits)
    if (!cachedModelName) {
      const listUrl = `https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`;
      const listRes = await axios.get(listUrl);
      const foundModel = listRes.data.models.find(m => m.name.includes('gemini-1.5-flash')) || 
                         listRes.data.models.find(m => m.supportedGenerationMethods.includes('generateContent'));
      
      // Extract the full name (e.g., "models/gemini-1.5-flash")
      cachedModelName = foundModel.name;
    }

    // 2. Execute Synthesis using the working path (same as your Scanner)
    const chatUrl = `https://generativelanguage.googleapis.com/v1/${cachedModelName}:generateContent?key=${API_KEY}`;
    
    const requestBody = {
      contents: [{
        role: "user",
        parts: [{ text: neuralPrompt }]
      }],
      generationConfig: { 
        temperature: 0.7 
      }
    };

    const response = await axios.post(chatUrl, requestBody);
    
    if (!response.data.candidates || !response.data.candidates[0]) {
      throw new Error("No candidates returned");
    }

    return response.data.candidates[0].content.parts[0].text;

  } catch (error) {
    console.error('📧 AI Service Error:', error.response?.data || error.message);
    // Fallback template so the UI remains stable
    return `Subject: Business Correspondence\n\nDear Team,\n\nI am reaching out regarding the invoice details: ${contextText}.\n\nRegards,\nAutoBiz AI`;
  }
};