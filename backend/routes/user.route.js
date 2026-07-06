// backend/routes/user.route.js
import express from 'express';
import { protectRoute, adminRoute } from '../middleware/auth.middleware.js';
import { getAllUsers, activateMealPlan } from '../controllers/user.controller.js';

const router = express.Router();

// These routes are protected and can ONLY be accessed by an admin
router.get('/', protectRoute, adminRoute, getAllUsers);
router.post('/:userId/activate-plan', protectRoute, adminRoute, activateMealPlan);

export default router;