import { Router, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { UserService } from '../services/user.service.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();

// Strict user isolation on all profile routes
router.use(authMiddleware);

// GET /api/profile (Basic profile)
router.get('/', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const profile = UserService.getProfile(userId);

    if (!profile) {
      res.status(404).json({ success: false, error: 'Profile not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      profile,
      data: profile
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/profile/full (Comprehensive profile aggregate + completeness)
router.get('/full', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const full = UserService.getFullProfile(userId);

    if (!full) {
      res.status(404).json({ success: false, error: 'Profile not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      data: full,
      profile: full.basic,
      completeness: full.completeness
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/profile/completeness
router.get('/completeness', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const completeness = UserService.getProfileCompleteness(userId);

    res.status(200).json({
      success: true,
      completeness,
      data: completeness
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/profile
router.put('/', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const { name, year, department, education, experience_level, dream_career, bio, phone, location } = req.body;

    const updated = UserService.updateProfile(userId, {
      name,
      year,
      department,
      education,
      experience_level,
      dream_career,
      bio,
      phone,
      location
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      profile: updated,
      data: updated
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------------------------------
// SKILLS SUB-RESOURCE
// ----------------------------------------------------------------------------
router.get('/skills', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const skills = UserService.getSkills(userId);
    res.status(200).json({ success: true, skills, data: skills });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/skills', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const { skill_name, proficiency_level, proficiency, category, source } = req.body;
    if (!skill_name || !skill_name.trim()) {
      res.status(400).json({ success: false, error: 'Skill name is required.' });
      return;
    }
    const level = proficiency_level || proficiency || 'intermediate';
    const skill = UserService.addSkill(userId, skill_name, level, category, source);
    res.status(201).json({ success: true, skill, data: skill });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.delete('/skills/:idOrName', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const param = req.params.idOrName;
    const numId = parseInt(param, 10);
    const target = isNaN(numId) ? param : numId;
    const deleted = UserService.deleteSkill(userId, target);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Skill not found.' });
      return;
    }
    res.status(200).json({ success: true, message: 'Skill deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------------------------------
// EDUCATION SUB-RESOURCE
// ----------------------------------------------------------------------------
router.get('/education', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const education = UserService.getEducation(userId);
    res.status(200).json({ success: true, education, data: education });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/education', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const { institution, degree, major, academic_year, graduation_year, academic_status, coursework } = req.body;
    if (!institution || !degree) {
      res.status(400).json({ success: false, error: 'Institution and degree are required.' });
      return;
    }
    const edu = UserService.addEducation(userId, { institution, degree, major, academic_year, graduation_year, academic_status, coursework });
    res.status(201).json({ success: true, education: edu, data: edu });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.delete('/education/:id', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: 'Invalid education ID.' });
      return;
    }
    const deleted = UserService.deleteEducation(userId, id);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Education record not found.' });
      return;
    }
    res.status(200).json({ success: true, message: 'Education record deleted.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------------------------------
// EXPERIENCE SUB-RESOURCE
// ----------------------------------------------------------------------------
router.get('/experience', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const experience = UserService.getExperience(userId);
    res.status(200).json({ success: true, experience, data: experience });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/experience', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const { organization, role, start_date, end_date, description, technologies, experience_level } = req.body;
    if (!organization || !role) {
      res.status(400).json({ success: false, error: 'Organization and role are required.' });
      return;
    }
    const exp = UserService.addExperience(userId, { organization, role, start_date, end_date, description, technologies, experience_level });
    res.status(201).json({ success: true, experience: exp, data: exp });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.delete('/experience/:id', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: 'Invalid experience ID.' });
      return;
    }
    const deleted = UserService.deleteExperience(userId, id);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Experience record not found.' });
      return;
    }
    res.status(200).json({ success: true, message: 'Experience record deleted.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------------------------------
// PROJECTS SUB-RESOURCE
// ----------------------------------------------------------------------------
router.get('/projects', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const projects = UserService.getProjects(userId);
    res.status(200).json({ success: true, projects, data: projects });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/projects', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const { name, description, technologies, role, project_url, github_url, demo_url, difficulty, completion_status } = req.body;
    if (!name) {
      res.status(400).json({ success: false, error: 'Project name is required.' });
      return;
    }
    const proj = UserService.addProject(userId, { name, description, technologies, role, project_url, github_url, demo_url, difficulty, completion_status });
    res.status(201).json({ success: true, project: proj, data: proj });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.delete('/projects/:id', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: 'Invalid project ID.' });
      return;
    }
    const deleted = UserService.deleteProject(userId, id);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Project record not found.' });
      return;
    }
    res.status(200).json({ success: true, message: 'Project record deleted.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------------------------------
// CERTIFICATIONS SUB-RESOURCE
// ----------------------------------------------------------------------------
router.get('/certifications', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const certifications = UserService.getCertifications(userId);
    res.status(200).json({ success: true, certifications, data: certifications });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/certifications', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const { name, issuer, issue_date, credential_id, verification_url } = req.body;
    if (!name || !issuer) {
      res.status(400).json({ success: false, error: 'Name and issuer are required.' });
      return;
    }
    const cert = UserService.addCertification(userId, { name, issuer, issue_date, credential_id, verification_url });
    res.status(201).json({ success: true, certification: cert, data: cert });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.delete('/certifications/:id', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: 'Invalid certification ID.' });
      return;
    }
    const deleted = UserService.deleteCertification(userId, id);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Certification record not found.' });
      return;
    }
    res.status(200).json({ success: true, message: 'Certification record deleted.' });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------------------------------
// GOALS SUB-RESOURCE
// ----------------------------------------------------------------------------
router.get('/goals', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const goals = UserService.getGoals(userId);
    res.status(200).json({ success: true, goals, data: goals });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/goals', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const goals = UserService.updateGoals(userId, req.body);
    res.status(200).json({ success: true, goals, data: goals });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------------------------------
// LINKS SUB-RESOURCE
// ----------------------------------------------------------------------------
router.get('/links', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const links = UserService.getLinks(userId);
    res.status(200).json({ success: true, links, data: links });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/links', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const links = UserService.updateLinks(userId, req.body);
    res.status(200).json({ success: true, links, data: links });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
