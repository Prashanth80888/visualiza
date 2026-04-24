// backend/routes/ocrRoutes.js
import express from 'express';
import { scanInvoice } from '../controllers/ocrController.js';
import { sendAutomatedEmail } from '../controllers/mailController.js';
import multer from 'multer';

const router = express.Router();
const upload = multer(); // Memory storage for fast AI processing

// This makes the full URL: http://localhost:5000/api/v1/ocr/scan
router.post('/scan', upload.single('invoice'), scanInvoice);
router.post('/send-audit-mail', sendAutomatedEmail);

export default router;