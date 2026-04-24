import express from 'express';
import { 
  processInvoice, 
  getAllInvoices, 
  deleteInvoice, 
  saveInvoice,
  updatePaymentStatus,
  getInvoiceStats
} from '../controllers/invoiceController.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/upload', upload.single('file'), processInvoice);
router.get('/', getAllInvoices); 
router.delete('/:id', deleteInvoice);  
router.post('/save', saveInvoice);
router.patch('/:id/status', updatePaymentStatus);
// Add this line to your invoiceRoutes.js
router.get('/stats', getInvoiceStats);



export default router;