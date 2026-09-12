import { Router, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { UserService } from '../services/user.service.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();

// Strict user isolation
router.use(authMiddleware);

// GET /api/saved-careers
router.get('/', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const saved = UserService.getSavedCareers(userId);

    res.status(200).json({
      success: true,
      count: saved.length,
      saved_careers: saved,
      data: saved
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/saved-careers/:careerId
router.post('/:careerId', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const careerId = Number(req.params.careerId);
    const { notes } = req.body || {};

    if (isNaN(careerId)) {
      res.status(400).json({ success: false, error: 'Invalid career ID.' });
      return;
    }

    UserService.saveCareer(userId, careerId, notes || '');

    res.status(200).json({
      success: true,
      message: 'Career saved to your bookmarks.'
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE /api/saved-careers/:careerId
router.delete('/:careerId', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const careerId = Number(req.params.careerId);

    if (isNaN(careerId)) {
      res.status(400).json({ success: false, error: 'Invalid career ID.' });
      return;
    }

    const removed = UserService.unsaveCareer(userId, careerId);

    res.status(200).json({
      success: true,
      message: removed ? 'Career removed from bookmarks.' : 'Career was not saved.'
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
