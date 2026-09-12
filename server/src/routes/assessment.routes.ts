import { Router, Response } from 'express';
import { RecommendationService } from '../services/recommendation.service.js';
import { UserService } from '../services/user.service.js';
import { optionalAuthMiddleware, authMiddleware } from '../middleware/auth.middleware.js';
import { AuthenticatedRequest, AssessmentPayload } from '../types/index.js';

const router = Router();

// Handle recommendation generation
async function handleRecommendation(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const payload: AssessmentPayload = req.body;

    if (!payload || typeof payload !== 'object') {
      res.status(400).json({ success: false, error: 'Malformed JSON payload.' });
      return;
    }

    // Normalize payload compatibility
    if (!payload.interest && payload.interests) {
      payload.interest = Array.isArray(payload.interests) ? payload.interests.join(', ') : String(payload.interests);
    }
    if (!payload.experience && payload.experience_level) {
      payload.experience = payload.experience_level;
    }

    // Validation
    const missing: string[] = [];
    if (!payload.education && !payload.department && !payload.year) missing.push('education');
    if (!payload.skills) missing.push('skills');
    if (!payload.interest) missing.push('interest');

    if (missing.length > 0) {
      res.status(400).json({
        success: false,
        error: `Missing required fields: ${missing.join(', ')}`
      });
      return;
    }

    const evaluation = RecommendationService.evaluate(payload);

    // If user is authenticated, mark saved status and record in history
    if (req.user) {
      const isPrimarySaved = UserService.isCareerSaved(req.user.id, evaluation.primary_recommendation.id);
      evaluation.primary_recommendation.is_saved = isPrimarySaved;

      evaluation.alternative_recommendations.forEach(alt => {
        alt.is_saved = UserService.isCareerSaved(req.user!.id, alt.id);
      });

      const assessmentId = UserService.recordRecommendation(req.user.id, payload, evaluation);
      evaluation.assessment_id = assessmentId;
    }

    res.status(200).json(evaluation);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Error generating career recommendation.'
    });
  }
}

// POST /api/assessment
router.post('/', optionalAuthMiddleware, handleRecommendation);

// POST /api/recommendations/generate
router.post('/generate', optionalAuthMiddleware, handleRecommendation);

// GET /api/recommendations (or /api/assessment/history)
router.get('/history', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const history = UserService.getRecommendationHistory(req.user!.id);
    res.status(200).json({
      success: true,
      count: history.length,
      history,
      data: history
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/assessment/latest
router.get('/latest', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const latest = UserService.getLatestRecommendation(req.user!.id);
    res.status(200).json({
      success: true,
      assessment: latest,
      latest
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
