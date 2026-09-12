import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { ResumeService } from '../services/resume.service.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();

// Configure Multer for in-memory buffer processing before validation
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB max
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    if (ext !== '.pdf' && ext !== '.docx') {
      return cb(new Error('Invalid file type. Only .pdf and .docx files are permitted.'));
    }
    if (!allowedMimeTypes.includes(file.mimetype) && file.mimetype !== 'application/octet-stream') {
      return cb(new Error('Invalid MIME type.'));
    }
    cb(null, true);
  }
});

// All resume routes require valid JWT
router.use(authMiddleware);

// POST /api/resume/upload
router.post('/upload', (req: AuthenticatedRequest, res: Response, next) => {
  upload.single('resume')(req, res, (err: any) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({ success: false, error: 'File size exceeds maximum allowed limit of 5MB.' });
        return;
      }
      res.status(400).json({ success: false, error: err.message || 'File upload error.' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ success: false, error: 'No resume file uploaded.' });
      return;
    }

    const userId = req.user!.id;
    ResumeService.processAndSaveResume(userId, req.file)
      .then(result => {
        res.status(201).json({
          success: true,
          message: 'Resume uploaded and parsed successfully.',
          resume: result.resume,
          extraction: result.extraction
        });
      })
      .catch(error => {
        res.status(400).json({ success: false, error: error.message });
      });
  });
});

// GET /api/resume/active
router.get('/active', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const { resume, extraction } = ResumeService.getActiveResume(userId);

    res.status(200).json({
      success: true,
      resume,
      extraction
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/resume/:id/download (Strict Anti-IDOR)
router.get('/:id/download', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const resumeId = parseInt(req.params.id, 10);
    if (isNaN(resumeId)) {
      res.status(400).json({ success: false, error: 'Invalid resume ID.' });
      return;
    }

    const downloadInfo = ResumeService.getResumeDownload(userId, resumeId);
    if (!downloadInfo) {
      res.status(404).json({ success: false, error: 'Resume not found or access denied.' });
      return;
    }

    res.setHeader('Content-Disposition', `attachment; filename="${downloadInfo.originalFilename}"`);
    res.setHeader('Content-Type', downloadInfo.mimeType);
    res.sendFile(downloadInfo.filePath);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/resume/:id/review (Assisted extraction commit)
router.post('/:id/review', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const resumeId = parseInt(req.params.id, 10);
    if (isNaN(resumeId)) {
      res.status(400).json({ success: false, error: 'Invalid resume ID.' });
      return;
    }

    const reviewPayload = req.body;
    ResumeService.reviewAndApplyExtraction(userId, resumeId, reviewPayload);

    res.status(200).json({
      success: true,
      message: 'Extracted CV information successfully merged into your profile.'
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE /api/resume/:id (Strict Anti-IDOR)
router.delete('/:id', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const resumeId = parseInt(req.params.id, 10);
    if (isNaN(resumeId)) {
      res.status(400).json({ success: false, error: 'Invalid resume ID.' });
      return;
    }

    const deleted = ResumeService.deleteResume(userId, resumeId);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Resume not found or access denied.' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Resume removed successfully.'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
