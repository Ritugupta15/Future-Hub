"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const career_service_js_1 = require("../services/career.service.js");
const user_service_js_1 = require("../services/user.service.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const router = (0, express_1.Router)();
// GET /api/careers
router.get('/', (req, res) => {
    try {
        const { search, category } = req.query;
        const careers = career_service_js_1.CareerService.getAllCareers({
            search: search ? String(search) : undefined,
            category: category ? String(category) : undefined
        });
        res.status(200).json({
            success: true,
            count: careers.length,
            careers,
            data: careers
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to retrieve careers.'
        });
    }
});
// GET /api/careers/skills
router.get('/skills', (req, res) => {
    try {
        const skills = career_service_js_1.CareerService.getAllSkills();
        res.status(200).json({
            success: true,
            skills_by_category: skills,
            data: skills
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// GET /api/careers/interests
router.get('/interests', (req, res) => {
    try {
        const interests = career_service_js_1.CareerService.getAllInterests();
        res.status(200).json({
            success: true,
            interests,
            data: interests
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// GET /api/careers/projects
router.get('/projects', (req, res) => {
    try {
        const projects = career_service_js_1.CareerService.getAllProjects();
        res.status(200).json({
            success: true,
            count: projects.length,
            projects,
            data: projects
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// GET /api/careers/:id
router.get('/:id', auth_middleware_js_1.optionalAuthMiddleware, (req, res) => {
    try {
        const { id } = req.params;
        const career = career_service_js_1.CareerService.getCareerBySlugOrId(id, req.user?.id);
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to retrieve career details.'
        });
    }
});
// PUT /api/careers/:careerId/roadmap/:stageOrder
router.put('/:careerId/roadmap/:stageOrder', auth_middleware_js_1.authMiddleware, (req, res) => {
    try {
        const userId = req.user.id;
        const careerId = Number(req.params.careerId);
        const stageOrder = Number(req.params.stageOrder);
        const { is_completed } = req.body;
        if (isNaN(careerId) || isNaN(stageOrder)) {
            res.status(400).json({ success: false, error: 'Invalid career ID or stage order.' });
            return;
        }
        user_service_js_1.UserService.updateRoadmapProgress(userId, careerId, stageOrder, Boolean(is_completed));
        res.status(200).json({
            success: true,
            message: 'Roadmap progress updated successfully.'
        });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
exports.default = router;
