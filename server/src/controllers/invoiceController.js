import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import Invoice from '../models/Invoice.js';

export const processInvoice = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    // 1) OCR: Extract raw text via OCR.Space
    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path));
    formData.append('apikey', process.env.OCR_API_KEY);
    formData.append('OCREngine', '2');

    const ocrRes = await axios.post(
      'https://api.ocr.space/parse/image',
      formData,
      { headers: formData.getHeaders() }
    );

    const extractedText = ocrRes.data?.ParsedResults?.[0]?.ParsedText || '';

    // 2) AI Discovery & Extraction
    const API_KEY = process.env.AI_API_KEY;
    const listUrl = `https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`;
    const listRes = await axios.get(listUrl);
    const workingModel = listRes.data.models.find(m => m.supportedGenerationMethods.includes('generateContent'));

    if (!workingModel) throw new Error("No active AI model found");

    const chatUrl = `https://generativelanguage.googleapis.com/v1/${workingModel.name}:generateContent?key=${API_KEY}`;
    
    const prompt = `
      Extract fields from this invoice text as JSON: 
      invoiceNo, 
      date, 
      customer, 
      subtotal (number),
      taxAmount (number),
      total (number), 
      gstNumber, 
      balanceDue (number)
      
      Text: ${extractedText}
      Return ONLY valid JSON.
    `;

    let finalData;
    try {
      const aiRes = await axios.post(chatUrl, {
        contents: [{ parts: [{ text: prompt }] }]
      });
      
      const aiText = aiRes.data.candidates[0].content.parts[0].text;
      const cleaned = aiText.replace(/```json|```/g, "").trim();
      finalData = JSON.parse(cleaned);
    } catch (aiErr) {
      console.error("AI Parse failed, applying regex fallback");
      finalData = {
        invoiceNo: extractedText.match(/Invoice\s*No[:\s]*([A-Za-z0-9-]+)/i)?.[1] || "",
        date: extractedText.match(/Date[:\s]*([\d\/-]+)/i)?.[1] || "",
        customer: "Manual Entry",
        subtotal: 0,
        taxAmount: 0,
        total: parseFloat(extractedText.match(/Total[:\s]*₹?\s*(\d+)/i)?.[1]) || 0,
        gstNumber: extractedText.match(/\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}/)?.[0] || "",
        balanceDue: 0 
      };
    }

    // --- NEW LOGIC: DATE FORMATTING FIX ---
    let validDate = new Date(); // Default to today
    if (finalData.date) {
      // Split by common separators: / or - or .
      const dateParts = finalData.date.split(/[-/.]/);
      
      if (dateParts.length === 3) {
        // If it's DD/MM/YYYY, we rearrange it to YYYY-MM-DD
        const day = dateParts[0].length === 4 ? dateParts[2] : dateParts[0];
        const month = dateParts[1];
        const year = dateParts[0].length === 4 ? dateParts[0] : dateParts[2];
        
        const isoDate = `${year}-${month}-${day}`;
        const parsed = new Date(isoDate);
        if (!isNaN(parsed)) validDate = parsed;
      } else {
        // Try standard parsing if it's already ISO
        const standard = new Date(finalData.date);
        if (!isNaN(standard)) validDate = standard;
      }
    }

    // --- NEW LOGIC: GST VERIFICATION (MATH CHECK) ---
    const extractedSubtotal = finalData.subtotal || 0;
    const extractedTax = finalData.taxAmount || 0;
    const extractedTotal = finalData.total || 0;
    const isMathCorrect = Math.abs((extractedSubtotal + extractedTax) - extractedTotal) < 1;

    // --- NEW LOGIC: PAYMENT STATUS (BALANCE CHECK) ---
    const isPaid = finalData.balanceDue === 0;

    // 3) SAVE TO DATABASE 
    const savedInvoice = await Invoice.create({
      vendor: finalData.customer || "Unknown",
      amount: extractedTotal,
      reference: finalData.invoiceNo,
      date: validDate, // Use the converted Date object here
      taxId: finalData.gstNumber || "N/A",
      taxAmount: extractedTax,
      subtotal: extractedSubtotal,
      paymentStatus: isPaid ? 'Paid' : 'Unpaid',
      isVerified: isMathCorrect, 
      status: isMathCorrect ? 'Verified' : 'Tax Mismatch',
      shield: {
        ocrConfidence: "High",
        mathVerified: isMathCorrect,
        balanceDetected: finalData.balanceDue
      }
    });

    // 4) Cleanup
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    // 5) Response
    res.status(200).json({
      success: true,
      data: savedInvoice,
      analysis: {
        isGstValid: isMathCorrect,
        paymentStatus: savedInvoice.paymentStatus
      }
    });

  } catch (error) {
    console.error('Invoice Processing Error:', error.message);
    res.status(500).json({ success: false, message: 'Processing Failed' });
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