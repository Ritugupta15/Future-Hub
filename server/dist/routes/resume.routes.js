"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const resume_service_js_1 = require("../services/resume.service.js");
const router = (0, express_1.Router)();
// Configure Multer for in-memory buffer processing before validation
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB max
    },
    fileFilter: (req, file, cb) => {
        const ext = path_1.default.extname(file.originalname).toLowerCase();
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
router.use(auth_middleware_js_1.authMiddleware);
// POST /api/resume/upload
router.post('/upload', (req, res, next) => {
    upload.single('resume')(req, res, (err) => {
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
        const userId = req.user.id;
        resume_service_js_1.ResumeService.processAndSaveResume(userId, req.file)
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
router.get('/active', (req, res) => {
    try {
        const userId = req.user.id;
        const { resume, extraction } = resume_service_js_1.ResumeService.getActiveResume(userId);
        res.status(200).json({
            success: true,
            resume,
            extraction
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// GET /api/resume/:id/download (Strict Anti-IDOR)
router.get('/:id/download', (req, res) => {
    try {
        const userId = req.user.id;
        const resumeId = parseInt(req.params.id, 10);
        if (isNaN(resumeId)) {
            res.status(400).json({ success: false, error: 'Invalid resume ID.' });
            return;
        }
        const downloadInfo = resume_service_js_1.ResumeService.getResumeDownload(userId, resumeId);
        if (!downloadInfo) {
            res.status(404).json({ success: false, error: 'Resume not found or access denied.' });
            return;
        }
        res.setHeader('Content-Disposition', `attachment; filename="${downloadInfo.originalFilename}"`);
        res.setHeader('Content-Type', downloadInfo.mimeType);
        res.sendFile(downloadInfo.filePath);
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// POST /api/resume/:id/review (Assisted extraction commit)
router.post('/:id/review', (req, res) => {
    try {
        const userId = req.user.id;
        const resumeId = parseInt(req.params.id, 10);
        if (isNaN(resumeId)) {
            res.status(400).json({ success: false, error: 'Invalid resume ID.' });
            return;
        }
        const reviewPayload = req.body;
        resume_service_js_1.ResumeService.reviewAndApplyExtraction(userId, resumeId, reviewPayload);
        res.status(200).json({
            success: true,
            message: 'Extracted CV information successfully merged into your profile.'
        });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
// DELETE /api/resume/:id (Strict Anti-IDOR)
router.delete('/:id', (req, res) => {
    try {
        const userId = req.user.id;
        const resumeId = parseInt(req.params.id, 10);
        if (isNaN(resumeId)) {
            res.status(400).json({ success: false, error: 'Invalid resume ID.' });
            return;
        }
        const deleted = resume_service_js_1.ResumeService.deleteResume(userId, resumeId);
        if (!deleted) {
            res.status(404).json({ success: false, error: 'Resume not found or access denied.' });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Resume removed successfully.'
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;
