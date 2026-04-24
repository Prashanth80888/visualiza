import axios from 'axios';
import Invoice from '../models/Invoice.js';

// Cache the model name so we don't waste quota calling ListModels every time
let cachedModelName = null;

export const scanInvoice = async (req, res) => {
  const API_KEY = process.env.AI_API_KEY; 

  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image asset provided." });
    }

    // --- STEP 1: DYNAMIC MODEL DISCOVERY (Only if not cached) ---
    if (!cachedModelName) {
      const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
      const listRes = await axios.get(listUrl);
      
      // Look for the flash model, or any model that supports content generation
      const model = listRes.data.models.find(m => m.name.includes('gemini-1.5-flash')) || 
                    listRes.data.models.find(m => m.supportedGenerationMethods.includes('generateContent'));
      
      if (!model) throw new Error("No compatible Gemini models found.");
      cachedModelName = model.name; // Stores 'models/gemini-1.5-flash' or similar
    }

    // --- STEP 2: EXECUTE WITH THE VERIFIED NAME ---
    const chatUrl = `https://generativelanguage.googleapis.com/v1beta/${cachedModelName}:generateContent?key=${API_KEY}`;
    
    const base64Image = req.file.buffer.toString('base64');

    const requestBody = {
      contents: [{
        parts: [
          { text: "Analyze this invoice. Return ONLY JSON. Keys: entity, reference, date, taxId, taxAmount, total, subTotal. If taxId is missing, return 'UNDEFINED'." },
          { inlineData: { mimeType: req.file.mimetype, data: base64Image } }
        ]
      }],
      generationConfig: { 
        temperature: 0.1,
        responseMimeType: "application/json" 
      }
    };

    const response = await axios.post(chatUrl, requestBody);
    
    // --- STEP 3: PARSING & AUDIT SHIELD (YOUR WORKING LOGIC) ---
    const botText = response.data.candidates[0].content.parts[0].text;
    const cleanData = JSON.parse(botText.match(/\{[\s\S]*\}/)[0]);

    const auditLogs = [
      "Neural Extraction Initiated...",
      `Merchant Identified: ${cleanData.entity || 'Unknown'}`,
      "Running Integrity Shield..."
    ];

    const parseCurrency = (val) => {
      if (!val) return 0;
      const strVal = String(val);
      return parseFloat(strVal.replace(/[₹$,\s]/g, '').replace(/[^0-9.]/g, '')) || 0;
    };

    const total = parseCurrency(cleanData.total);
    const tax = parseCurrency(cleanData.taxAmount);
    const subTotal = parseCurrency(cleanData.subTotal);
    
    const mathVerified = Math.abs((subTotal + tax) - total) < 0.5;
    auditLogs.push(mathVerified ? "✓ Mathematical Integrity Verified" : "⚠ Calculation Discrepancy Found");

    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    const isGstValid = cleanData.taxId !== "UNDEFINED" && gstRegex.test(cleanData.taxId);
    auditLogs.push(isGstValid ? "✓ Tax ID Format Compliant" : "⚠ Regulatory Pattern: UNDEFINED");

    const previousBill = await Invoice.findOne({ entity: cleanData.entity }).sort({ createdAt: -1 });
    let isAnomaly = false;
    let priceChange = "0.0";

    if (previousBill) {
      const diff = ((total - previousBill.total) / previousBill.total) * 100;
      priceChange = diff.toFixed(1);
      if (diff > 15) isAnomaly = true;
      auditLogs.push(isAnomaly ? `⚠ Alert: ${priceChange}% Price Increase` : `✓ Stable Price (${priceChange}%)`);
    } else {
      auditLogs.push("ℹ New Baseline Created");
    }

    const shield = {
      mathVerified,
      isGstValid,
      isAnomaly,
      priceChange,
      auditLogs,
      status: isAnomaly ? "High Risk" : (!mathVerified || !isGstValid ? "Integrity Partial" : "Verified")
    };

    res.status(200).json({ ...cleanData, shield });

  } catch (error) {
    const status = error.response?.status || 500;
    // If it's a 404, we clear the cache so it tries to find the model again next time
    if (status === 404) cachedModelName = null;

    console.error(`--- NEURAL SCAN ERROR [${status}] ---`, error.response?.data || error.message);
    res.status(status).json({ 
      success: false, 
      message: status === 429 ? 'AI Quota exhausted. Wait 60s.' : 'Neural Synthesis Failed.',
      error: error.message
    });
  }
};