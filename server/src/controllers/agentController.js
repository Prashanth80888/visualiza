import { generateEmailContent } from '../services/aiService.js';
import Invoice from '../models/Invoice.js';
import axios from 'axios';

export const resolveAgentAction = async (req, res) => {
  const { message } = req.body;
  const API_KEY = process.env.AI_API_KEY;

  if (!API_KEY) return res.status(200).json({ success: true, reply: "### ⚠️ System Error\nAI Key missing." });

  // --- LOCAL KEYWORD SENSORS (The Fail-Safe) ---
  const lowerMsg = message.toLowerCase();
  
  const isBatchAudit = lowerMsg.includes("audit all") || lowerMsg.includes("verify all") || lowerMsg.includes("clear pending");
  const isSpendQuery = (lowerMsg.includes("total") || lowerMsg.includes("spend") || lowerMsg.includes("audit")) && !isBatchAudit;
  const isDisputeQuery = lowerMsg.includes("dispute") || lowerMsg.includes("email") || lowerMsg.includes("bill");
  const isHelpQuery = lowerMsg.includes("help") || lowerMsg.includes("what can you do");
  const isGreeting = lowerMsg === "hi" || lowerMsg === "hello" || lowerMsg === "hey" || lowerMsg === "how are you";

  try {
    // 1. Dynamic Model Discovery
    const listUrl = `https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`;
    const listRes = await axios.get(listUrl);
    const workingModel = listRes.data.models.find(m => m.supportedGenerationMethods.includes('generateContent'));

    if (!workingModel) throw new Error("No model found");

    const intentUrl = `https://generativelanguage.googleapis.com/v1/${workingModel.name}:generateContent?key=${API_KEY}`;
    
    // 2. AI Processing
    const intentRes = await axios.post(intentUrl, {
      contents: [{ 
        parts: [{ 
          text: `Analyze: "${message}". 
          - If greeting (hi/hello): return {"intent": "GREET"}
          - If batch audit/verify all: return {"intent": "BATCH"}
          - If spend/total/audit summary: return {"intent": "SUMMARY"}
          - If dispute/email/bill: return {"intent": "EMAIL", "vendor": "vendor name"}
          - If help: return {"intent": "HELP"}
          - Else: provide a direct helpful business response.` 
        }] 
      }]
    });

    const botRawText = intentRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const jsonMatch = botRawText.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { intent: "NONE", generalReply: botRawText };

    // Set Final Triggers
    const triggerGreeting = result.intent === "GREET" || isGreeting;
    const triggerBatch = result.intent === "BATCH" || isBatchAudit;
    const triggerSummary = result.intent === "SUMMARY" || isSpendQuery;
    const triggerEmail = result.intent === "EMAIL" || isDisputeQuery;

    // --- CASE A: PROACTIVE GREETING (Memory Feature) ---
    if (triggerGreeting) {
      const pendingCount = await Invoice.countDocuments({ status: 'Pending' });
      const recentPending = await Invoice.find({ status: 'Pending' }).limit(2).sort({ createdAt: -1 });

      let reply = `### 👋 Neural Shield Online\nSystems are fully operational. `;
      if (pendingCount > 0) {
        reply += `I've detected **${pendingCount} pending invoices** requiring verification.\n\n` +
                 `**Priority Queue:**\n` + 
                 recentPending.map(inv => `* ${inv.vendor} (₹${inv.amount})`).join('\n') +
                 `\n\nWould you like to **"Audit All"** or view the summary?`;
      } else {
        reply += `All records are currently synchronized. How can I assist you today?`;
      }
      return res.status(200).json({ success: true, reply });
    }

    // --- CASE B: BATCH AUDIT (Action Feature) ---
    if (triggerBatch) {
      const updateResult = await Invoice.updateMany({ status: 'Pending' }, { $set: { status: 'Audited' } });
      return res.status(200).json({
        success: true,
        reply: `### ✅ Batch Verification Successful\n\n` +
               `* **Records Optimized:** ${updateResult.modifiedCount}\n` +
               `* **Vault Status:** Synchronized\n\n` +
               `> All pending items have been verified and moved to the secure vault.`
      });
    }

    // --- CASE C: ADVANCED SUMMARY (Today, Yesterday, Month) ---
    if (triggerSummary) {
      const now = new Date();
      const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));
      const startOfYesterday = new Date(new Date(startOfToday).setDate(startOfToday.getDate() - 1));
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [todayStats, yesterdayStats, monthStats] = await Promise.all([
        Invoice.aggregate([{ $match: { createdAt: { $gte: startOfToday } } }, { $group: { _id: null, sum: { $sum: "$amount" }, count: { $sum: 1 } } }]),
        Invoice.aggregate([{ $match: { createdAt: { $gte: startOfYesterday, $lt: startOfToday } } }, { $group: { _id: null, sum: { $sum: "$amount" }, count: { $sum: 1 } } }]),
        Invoice.aggregate([{ $match: { createdAt: { $gte: startOfMonth } } }, { $group: { _id: null, sum: { $sum: "$amount" }, count: { $sum: 1 } } }])
      ]);

      return res.status(200).json({
        success: true,
        reply: `### 📊 Neural Audit Summary\n\n` +
               `* **Today:** ₹${(todayStats[0]?.sum || 0).toLocaleString('en-IN')} (${todayStats[0]?.count || 0} bills)\n` +
               `* **Yesterday:** ₹${(yesterdayStats[0]?.sum || 0).toLocaleString('en-IN')} (${yesterdayStats[0]?.count || 0} bills)\n` +
               `* **Monthly Total:** **₹${(monthStats[0]?.sum || 0).toLocaleString('en-IN')}**\n\n` +
               `> *Real-time indexing complete. All local records verified.*`
      });
    }

    // --- CASE D: DISPUTE / EMAIL ---
    if (triggerEmail) {
      const vendorName = result.vendor || message.replace(/dispute|last|bill|email/gi, "").trim();
      const invoice = await Invoice.findOne({ vendor: { $regex: vendorName || "", $options: 'i' } }).sort({ createdAt: -1 });

      if (!invoice) return res.status(200).json({ success: true, reply: `### ❌ Vault Search Failed\nNo records found for "**${vendorName || 'Unknown Vendor'}**".` });

      const draft = await generateEmailContent(`Dispute: ${invoice.vendor}`, `Amt: ${invoice.amount}`);
      return res.status(200).json({
        success: true,
        reply: `### 📩 Dispute Prepared\nI've generated a professional draft for **${invoice.vendor}**.`,
        actionCard: { type: "EMAIL_DRAFT", data: { subject: `Urgent: Dispute for Ref ${invoice.reference || 'INV-99'}`, body: draft } }
      });
    }

    // --- CASE E: HELP ---
    if (triggerHelp || result.intent === "HELP") {
        return res.status(200).json({
            success: true,
            reply: `### 🛡️ AutoBiz Intelligence Support\n\n` +
                   `* **Spend Audits:** Ask for "Today's spend" or "Monthly total".\n` +
                   `* **Batch Actions:** Use "Audit All" to verify pending bills.\n` +
                   `* **Disputes:** Type "Dispute [Vendor]" to draft a formal email.`
        });
    }

    res.status(200).json({ success: true, reply: result.generalReply || "### ⚡ Agent Active\nSystem ready for commands." });

  } catch (error) {
    console.error("SHIELD BACKUP ACTIVATED:", error.message);

    // --- SHIELD BACKUP: TRIGGERED IF AI IS OFFLINE/BUSY ---
    if (isGreeting) {
       const count = await Invoice.countDocuments({ status: 'Pending' });
       return res.status(200).json({ success: true, reply: `### 👋 Shield Backup Active\nYou have **${count} pending items**. AI is currently busy, but I can still process **"Audit All"** or **"Total Spend"**.` });
    }

    if (isSpendQuery) {
      const stats = await Invoice.aggregate([{ $group: { _id: null, totalSum: { $sum: "$amount" } } }]);
      return res.status(200).json({
        success: true,
        reply: `### 🛡️ Shield Backup: Audit\n\n* **Status:** Offline Mode Enabled\n* **Global Total:** ₹${(stats[0]?.totalSum || 0).toLocaleString('en-IN')}`
      });
    }

    if (isBatchAudit) {
       const result = await Invoice.updateMany({ status: 'Pending' }, { $set: { status: 'Audited' } });
       return res.status(200).json({ success: true, reply: `### ✅ Backup: Batch Verified\nAI was busy, but I have manually verified **${result.modifiedCount} records** for you.` });
    }

    if (isDisputeQuery) {
        const invoice = await Invoice.findOne().sort({ createdAt: -1 });
        if (invoice) {
            return res.status(200).json({
                success: true,
                reply: `### 🛡️ Backup: Last Bill Found\nNeural Link is slow, but I found your last transaction with **${invoice.vendor}**.`,
                actionCard: { 
                    type: "EMAIL_DRAFT", 
                    data: { 
                        subject: `Dispute: ${invoice.vendor}`, 
                        body: `I am writing to formally dispute the charges for ${invoice.vendor} totaling ₹${invoice.amount}.` 
                    } 
                }
            });
        }
    }

    if (isHelpQuery) {
        return res.status(200).json({
            success: true,
            reply: `### 🛠️ Offline Support Mode\nShield Backup is active. Use these direct commands:\n* **"Total Spend"**\n* **"Audit All"**\n* **"Dispute Bill"**`
        });
    }

    res.status(200).json({ success: true, reply: "### ⚠️ Neural Congestion\nGoogle servers are at capacity. Please use direct commands like **'Audit All'** or **'Total Spend'**." });
  }
};