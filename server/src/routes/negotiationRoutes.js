import express from 'express';
import { 
  getVendorLeverage, 
  getAllVendors 
} from '../controllers/negotiationController.js';
import axios from 'axios';

const router = express.Router();

const MODEL = "models/gemini-2.5-flash";

router.get('/leverage/:vendorName', getVendorLeverage);
router.get('/vendors', getAllVendors);

router.post('/generate-strategy', async (req, res) => {
  const currentVendor = req.body.vendorName || "Target Vendor";

  // ✅ FIX: Define outside try (so catch can use it)
  const stats = req.body?.stats || {};
  const leverage = req.body?.leverage || 0;

  try {

    const chatUrl = `https://generativelanguage.googleapis.com/v1beta/${MODEL}:generateContent?key=${process.env.AI_API_KEY}`;
    console.log("USING MODEL:", MODEL);

    const requestBody = {
      contents: [{
        parts: [{
          text: `Return JSON with battlePlan and emailDraft for ${currentVendor}. Spent ₹${stats?.totalSpent || 0}, leverage ${leverage || 0}%.`
        }]
      }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 200
      }
    };

    const callGemini = async (retries = 3) => {
      for (let i = 0; i < retries; i++) {
        try {
          return await axios.post(chatUrl, requestBody, {
            timeout: 15000
          });
        } catch (err) {
          const status = err.response?.status;

          if (status === 503 || status === 429 || err.code === 'ECONNABORTED') {
            console.log(`Retry ${i + 1}...`);
            await new Promise(r => setTimeout(r, 2000 * (i + 1)));
          } else {
            throw err;
          }
        }
      }
      throw new Error("Gemini failed after retries");
    };

    const aiRes = await callGemini();

    const text = aiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Format Error");

    return res.json(JSON.parse(jsonMatch[0]));

  } catch (error) {
    console.error("Gemini Route Error:", error.response?.data || error.message);

    // =========================
    // 🔥 PROFESSIONAL FALLBACK ENGINE
    // =========================

    const totalSpent = stats.totalSpent || 0;

    let strategyLevel = "Moderate";
    let discountRange = "3–5%";
    let tone = "collaborative";

    if (totalSpent > 100000) {
      strategyLevel = "High";
      discountRange = "8–12%";
      tone = "assertive";
    } else if (totalSpent > 50000) {
      strategyLevel = "Strong";
      discountRange = "5–8%";
      tone = "confident";
    }

    const battlePlan = `${strategyLevel} leverage identified with ${currentVendor}. Based on a total spend of ₹${totalSpent}, initiate a ${tone} negotiation approach targeting ${discountRange} cost reduction. Focus on volume commitment and long-term partnership value to strengthen your position.`;

    const emailDraft = `Subject: Strategic Partnership Optimization – AutoBiz AI & ${currentVendor}

Dear Team,

We value our ongoing partnership and the consistent business volume between our organizations.

With a cumulative spend of ₹${totalSpent}, we believe there is an opportunity to enhance our commercial alignment. We would like to initiate a discussion on optimizing pricing structures and exploring more flexible payment terms that reflect our current engagement level.

Our goal is to build a stronger, more scalable partnership that benefits both parties in the long term.

We look forward to your thoughts.

Warm regards,  
AutoBiz AI Team`;

    return res.status(200).json({ 
      battlePlan,
      emailDraft,
      meta: {
        source: "Fallback Intelligence Engine",
        confidence: "High",
        note: "Generated under high-load AI conditions"
      }
    });
  }
});

export default router;