import express from 'express';
import { resolveAgentAction } from '../controllers/agentController.js';
// If you have an auth middleware, you can add it here, 
// otherwise keep it simple for the hackathon demo.

const router = express.Router();

router.post('/resolve', resolveAgentAction);

export default router;