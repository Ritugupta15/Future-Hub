import { Router, Response } from 'express';
import { CareerService } from '../services/career.service.js';
import { UserService } from '../services/user.service.js';
import { optionalAuthMiddleware, authMiddleware } from '../middleware/auth.middleware.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();

// GET /api/careers
router.get('/', (req, res: Response): void => {
  try {
    const { search, category } = req.query;
    const careers = CareerService.getAllCareers({
      search: search ? String(search) : undefined,
      category: category ? String(category) : undefined
    });

    res.status(200).json({
      success: true,
      count: careers.length,
      careers,
      data: careers
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve careers.'
    });
  }
});

// GET /api/careers/skills
router.get('/skills', (req, res: Response): void => {
  try {
    const skills = CareerService.getAllSkills();
    res.status(200).json({
      success: true,
      skills_by_category: skills,
      data: skills
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/careers/interests
router.get('/interests', (req, res: Response): void => {
  try {
    const interests = CareerService.getAllInterests();
    res.status(200).json({
      success: true,
      interests,
      data: interests
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/careers/projects
router.get('/projects', (req, res: Response): void => {
  try {
    const projects = CareerService.getAllProjects();
    res.status(200).json({
      success: true,
      count: projects.length,
      projects,
      data: projects
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/careers/:id
router.get('/:id', optionalAuthMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const career = CareerService.getCareerBySlugOrId(id, req.user?.id);

    if (!career) {
      res.status(404).json({
        success: false,
        error: `Career with identifier "${id}" not found.`
      });
      return;
    }

    res.status(200).json({
      success: true,
      career,
      data: career
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve career details.'
    });
  }
});

// PUT /api/careers/:careerId/roadmap/:stageOrder
router.put('/:careerId/roadmap/:stageOrder', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const careerId = Number(req.params.careerId);
    const stageOrder = Number(req.params.stageOrder);
    const { is_completed } = req.body;

    if (isNaN(careerId) || isNaN(stageOrder)) {
      res.status(400).json({ success: false, error: 'Invalid career ID or stage order.' });
      return;
    }

    UserService.updateRoadmapProgress(userId, careerId, stageOrder, Boolean(is_completed));
    res.status(200).json({
      success: true,
      message: 'Roadmap progress updated successfully.'
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
