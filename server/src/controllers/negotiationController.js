import Invoice from '../models/Invoice.js';

// 1. NEW FUNCTION: GET ALL UNIQUE VENDORS FOR THE DROPDOWN
export const getAllVendors = async (req, res) => {
  try {
    // We only want vendors belonging to the current user (if you have auth)
    // If you don't have auth yet, use: Invoice.distinct('vendor')
    const vendors = await Invoice.distinct('vendor');
    
    if (!vendors || vendors.length === 0) {
      return res.status(404).json({ message: "No vendors found in records." });
    }
    
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. UPDATED LEVERAGE FUNCTION: ACCURATE MATH + ALL DATA
export const getVendorLeverage = async (req, res) => {
  try {
    const { vendorName } = req.params;

    // We run two separate aggregations to ensure "Total Volume" matches your Records page
    const stats = await Invoice.aggregate([
      { $match: { vendor: vendorName } }, // Match all invoices for this vendor
      {
        $group: {
          _id: "$vendor",
          totalVolume: { $sum: "$amount" }, // Matches your Records page total
          invoiceCount: { $sum: 1 },
          
          // Calculate stats ONLY for paid invoices for the Leverage Score
          paidTotal: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", "Paid"] }, "$amount", 0] }
          },
          avgDaysEarly: {
            $avg: {
              $cond: [
                { $and: [{ $eq: ["$paymentStatus", "Paid"] }, { $ifNull: ["$paidDate", false] }] },
                { $dateDiff: { startDate: "$paidDate", endDate: "$dueDate", unit: "day" } },
                null
              ]
            }
          }
        }
      }
    ]);

    if (!stats || stats.length === 0) {
      return res.status(404).json({ message: "No data found for this vendor." });
    }

    const data = stats[0];

    // --- UPDATED FORMULA ---
    // Volume Score (40%): Based on Total Volume (Matches Records page)
    const volumeScore = Math.min((data.totalVolume / 200000) * 40, 40);

    // Reliability Score (60%): Based on Paid Invoices history
    const avgEarly = data.avgDaysEarly || 0;
    const reliabilityScore = Math.min(Math.max(avgEarly * 12, 0), 60);

    const finalScore = Math.round(volumeScore + reliabilityScore);

    res.json({
      vendor: data._id,
      leverageScore: finalScore,
      stats: {
        totalSpent: data.totalVolume, // This will now match your Records page
        invoiceCount: data.invoiceCount,
        paidTotal: data.paidTotal,
        avgDaysEarly: Math.round(avgEarly)
      },
      aiInsight: finalScore > 70 
        ? "High Authority: You are a key account for this vendor." 
        : finalScore > 40
        ? "Moderate Leverage: Continue consistent payments to unlock better terms."
        : "Growth Phase: Low historical density with this vendor."
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};