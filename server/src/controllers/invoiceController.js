import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import Invoice from '../models/Invoice.js';

// ✅ SAME as your working pattern
let cachedModelName = null;

export const processInvoice = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    // =========================
    // 1) OCR / TEXT EXTRACTION
    // =========================
    let extractedText = "";

    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path));
    formData.append('apikey', process.env.OCR_API_KEY);
    formData.append('OCREngine', '2');

    const fileType = req.file.mimetype;

    if (
      fileType.startsWith("image/") ||
      fileType === "application/pdf"
    ) {
      const ocrRes = await axios.post(
        'https://api.ocr.space/parse/image',
        formData,
        { headers: formData.getHeaders() }
      );

      extractedText = ocrRes.data?.ParsedResults?.[0]?.ParsedText || "";
    } else {
      console.log("⚠️ Non-image file → skipping OCR");
      extractedText = fs.readFileSync(req.file.path, "utf-8");
    }

    console.log("OCR TEXT:\n", extractedText);

    let finalData;
    let usedFallback = false;

    try {
      // =========================
      // MODEL DISCOVERY
      // =========================
      if (!cachedModelName) {
        const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.AI_API_KEY}`;
        const listRes = await axios.get(listUrl);

        const model =
          listRes.data.models.find(m => m.name.includes('gemini-1.5-flash')) ||
          listRes.data.models.find(m => m.supportedGenerationMethods.includes('generateContent'));

        if (!model) throw new Error("No compatible Gemini models found.");

        cachedModelName = model.name;
      }

      // =========================
      // GEMINI CALL (🔥 IMPROVED PROMPT)
      // =========================
      const chatUrl = `https://generativelanguage.googleapis.com/v1beta/${cachedModelName}:generateContent?key=${process.env.AI_API_KEY}`;

      const requestBody = {
        contents: [{
          parts: [
            {
              text: `
Extract invoice details from the text below.

Return ONLY valid JSON with keys:
invoiceNo, date, customer, subtotal, taxAmount, total, gstNumber, balanceDue.

Rules:
- If value is missing → use "UNKNOWN" for text fields and 0 for numbers
- Always return all keys
- Do NOT return explanation

Text:
${extractedText}
`
            }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json"
        }
      };

      const aiRes = await axios.post(chatUrl, requestBody);

      const aiText = aiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      finalData = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    } catch (err) {
      console.log("AI FAILED → Using fallback");
      console.error("REAL ERROR:", err.response?.data || err.message);
      usedFallback = true;

      // =========================
      // FALLBACK (UNCHANGED)
      // =========================
      const lines = extractedText.split("\n").map(l => l.trim());

      const findValue = (keyword) => {
        for (let i = 0; i < lines.length; i++) {
          if (new RegExp(keyword, "i").test(lines[i])) {
            let sameLine = lines[i].match(/[\$₹]?([\d,]+\.\d+|\d+)/);
            if (sameLine) return sameLine[1];

            if (lines[i + 1]) {
              let nextLine = lines[i + 1].match(/[\$₹]?([\d,]+\.\d+|\d+)/);
              if (nextLine) return nextLine[1];
            }
          }
        }
        return null;
      };

      const totalMatches = [...extractedText.matchAll(/[\$₹]([\d,]+\.\d+)/g)];
      const totalValue = totalMatches.length
        ? totalMatches[totalMatches.length - 1][1]
        : findValue("Total");

      const taxValue =
        findValue("VAT") ||
        findValue("Tax") ||
        findValue("GST");

      const subtotalValue =
        findValue("Sub Total") ||
        findValue("Taxable");

      let customer = "Unknown";
      const billIndex = lines.findIndex(l => /bill\s*to/i.test(l));
      if (billIndex !== -1 && lines[billIndex + 1]) {
        customer = lines[billIndex + 1];
      }

      finalData = {
        invoiceNo:
          extractedText.match(/Invoice\s*No[:\s]*([A-Za-z0-9-/]+)/i)?.[1] ||
          "INV-" + Date.now(),

        date:
          extractedText.match(/Date[:\s]*([\d\/-]+)/i)?.[1] ||
          new Date().toISOString().split('T')[0],

        customer: customer,
        subtotal: subtotalValue ? parseFloat(subtotalValue.replace(/,/g, '')) : 0,
        taxAmount: taxValue ? parseFloat(taxValue.replace(/,/g, '')) : 0,
        total: totalValue ? parseFloat(totalValue.replace(/,/g, '')) : 0,
        gstNumber:
          extractedText.match(/\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}Z[A-Z\d]{1}/)?.[0] || "",
        balanceDue: 0
      };
    }

    // =========================
    // SAFE DATA (🔥 FIXED CRASH)
    // =========================
    const safeData = {
      vendor: finalData.customer || "Unknown Vendor",
      amount: finalData.total || 0,
      reference: finalData.invoiceNo || "N/A",
      date: new Date(),
      taxId: finalData.gstNumber || "N/A",
      taxAmount: finalData.taxAmount || 0,
      subtotal: finalData.subtotal || 0,
      paymentStatus: (finalData.balanceDue || 0) === 0 ? 'Paid' : 'Unpaid',
      isVerified: Math.abs((finalData.subtotal || 0) + (finalData.taxAmount || 0) - (finalData.total || 0)) < 2,
      status: "Processed"
    };

    const savedInvoice = await Invoice.create(safeData);

    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(200).json({
      success: true,
      data: savedInvoice,
      meta: { usedFallback }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};


// 1. GET ALL INVOICES (With Search, Filter, and Date Range)
export const getAllInvoices = async (req, res) => {
  try {
    const { status, search, startDate, endDate } = req.query;
    let query = {};

    // Filter by Payment Status (Paid / Unpaid)
    if (status) {
      query.paymentStatus = status;
    }

    // Search by Vendor Name or Reference Number
    if (search) {
      query.$or = [
        { vendor: { $regex: search, $options: 'i' } },
        { reference: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by Date Range (e.g., Today, Last 7 days)
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const invoices = await Invoice.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: invoices.length, data: invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Fetch failed', error: error.message });
  }
};

// 2. UPDATE PAYMENT STATUS (The "Mark as Paid" Feature)
export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body; // Expecting 'Paid' or 'Unpaid'

    const updatedInvoice = await Invoice.findByIdAndUpdate(
      id,
      { 
        paymentStatus: paymentStatus,
        // If paid, we can automatically set a flag or timestamp in the shield
        $set: { "shield.manuallyUpdated": true, "shield.updatedAt": new Date() }
      },
      { new: true }
    );

    res.status(200).json({ success: true, data: updatedInvoice });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Update failed' });
  }
};

// 3. DELETE INVOICE
export const deleteInvoice = async (req, res) => {
  try {
    await Invoice.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Record deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Delete failed' });
  }
};

// 4. SAVE INVOICE (With Processing Date)
export const saveInvoice = async (req, res) => {
  try {
    // We add 'createdAt' automatically, but we can ensure a specific processingDate exists
    const invoiceData = {
      ...req.body,
      processingDate: new Date(), // Storing exactly when the system handled it
    };
    const newInvoice = new Invoice(invoiceData);
    await newInvoice.save();
    res.status(201).json({ success: true, message: "Data Secured in MongoDB" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add this to your existing invoiceController.js
export const getInvoiceStats = async (req, res) => {
  try {
    const stats = await Invoice.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          totalInvoices: { $sum: 1 },
          paidAmount: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", "Paid"] }, "$amount", 0] }
          },
          unpaidAmount: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", "Unpaid"] }, "$amount", 0] }
          }
        }
      }
    ]);

    // Get total unique vendors/users
    const totalUsers = await Invoice.distinct("vendor").then(v => v.length);

    const result = stats.length > 0 ? stats[0] : { 
      totalAmount: 0, 
      totalInvoices: 0, 
      paidAmount: 0, 
      unpaidAmount: 0 
    };

    res.status(200).json({
      success: true,
      stats: {
        ...result,
        totalUsers: totalUsers || 1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};