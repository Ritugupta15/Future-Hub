import { Router, Response } from 'express';
import { CareerService } from '../services/career.service.js';
import { UserService } from '../services/user.service.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.middleware.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();

// GET /api/roadmap/:careerId
router.get('/:careerId', optionalAuthMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { careerId } = req.params;
    const career = CareerService.getCareerBySlugOrId(careerId);

    if (!career) {
      res.status(404).json({ success: false, error: 'Career not found.' });
      return;
    }

    let progressMap: Record<number, boolean> = {};
    if (req.user) {
      const progressList = UserService.getRoadmapProgress(req.user.id, career.id);
      progressList.forEach(p => {
        progressMap[p.stage_order] = p.is_completed;
      });
    }

    const stagesWithProgress = (career.roadmap || []).map(stage => ({
      ...stage,
      is_completed: !!progressMap[stage.stage_order]
    }));

    res.status(200).json({
      success: true,
      career: {
        id: career.id,
        slug: career.slug,
        title: career.title
      },
      stages: stagesWithProgress
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/roadmap/progress (Protected)
router.put('/progress', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const { career_id, stage_order, is_completed } = req.body;

    if (!career_id || stage_order === undefined) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: career_id, stage_order, is_completed.'
      });
      return;
    }

    UserService.updateRoadmapProgress(userId, Number(career_id), Number(stage_order), Boolean(is_completed));

    res.status(200).json({
      success: true,
      message: 'Roadmap progress updated successfully.'
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
