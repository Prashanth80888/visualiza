import mongoose from 'mongoose';

const emailLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: String },
  subject: { type: String },
  body: { type: String },
  status: { type: String, default: 'Draft' }
}, { timestamps: true });

export default mongoose.model('EmailLog', emailLogSchema);