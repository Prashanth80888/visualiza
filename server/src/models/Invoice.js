import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  vendor: { type: String, required: true },
  amount: { type: Number, required: true }, // This is the FINAL TOTAL
  reference: String,
  
  // Invoice Date (when the bill was issued)
  date: { type: Date, default: Date.now }, 
  
  // --- NEW: PROCESSING DATE ---
  // Tracks exactly when the AI scanned this invoice
  processingDate: { type: Date, default: Date.now },

  // --- NEW: CATEGORY ---
  // For the Insight-X analytics (Tech, Travel, Utilities, etc.)
  category: { type: String, default: 'Miscellaneous' },
  
  // --- TAX & AUDIT INFO ---
  taxId: String,
  subtotal: { type: Number, default: 0 }, 
  taxAmount: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  
  // --- TRACKING ---
  paymentStatus: { 
    type: String, 
    enum: ['Paid', 'Unpaid', 'Overdue'], 
    default: 'Unpaid' 
  },
  dueDate: { type: Date }, 
  
  status: { type: String, default: 'Pending' },
  
  // Updated Shield to hold more specific AI intelligence
  shield: { 
    type: Object,
    default: {
      isDuplicate: false,
      riskLevel: 'Low',
      aiConfidence: 'High'
    }
  },

  createdAt: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true }, 
  toObject: { virtuals: true }
});

// Virtuals to keep your existing UI working perfectly
invoiceSchema.virtual('entity').get(function() { return this.vendor; });
invoiceSchema.virtual('total').get(function() { return this.amount; });

export default mongoose.model('Invoice', invoiceSchema);