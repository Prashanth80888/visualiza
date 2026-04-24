import express from 'express';
import { getStats , getPredictiveAnalytics ,  getInsightX} from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/stats', getStats);
// GET /api/v1/analytics/forecast
router.get('/forecast', getPredictiveAnalytics);
router.get('/insight-x', getInsightX);

export default router;