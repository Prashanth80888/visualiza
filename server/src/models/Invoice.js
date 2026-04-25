import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  vendor: { type: String, required: true, index: true }, // Added index for fast AI lookup
  amount: { type: Number, required: true }, 
  reference: String,
  
  date: { type: Date, default: Date.now }, 
  processingDate: { type: Date, default: Date.now },
  category: { type: String, default: 'Miscellaneous' },
  
  // --- NEW: UNIT LEVEL INTELLIGENCE ---
  // Essential for comparing market rates and negotiating price-per-item
  items: [{
    description: String,
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, required: true }
  }],

  taxId: String,
  subtotal: { type: Number, default: 0 }, 
  taxAmount: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  
  paymentStatus: { 
    type: String, 
    enum: ['Paid', 'Unpaid', 'Overdue'], 
    default: 'Unpaid' 
  },
  dueDate: { type: Date }, 
  
  // --- NEW: LOYALTY TRACKING ---
  // If paidDate < dueDate, the AI uses this as "leverage" in negotiations
  paidDate: { type: Date }, 

  status: { type: String, default: 'Pending' },
  
  shield: { 
    type: Object,
    default: {
      isDuplicate: false,
      riskLevel: 'Low',
      aiConfidence: 'High',
      // Added for the Negotiator
      negotiationStrength: 'Calculated on Request' 
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