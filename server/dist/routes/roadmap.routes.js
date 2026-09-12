"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const career_service_js_1 = require("../services/career.service.js");
const user_service_js_1 = require("../services/user.service.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const router = (0, express_1.Router)();
// GET /api/roadmap/:careerId
router.get('/:careerId', auth_middleware_js_1.optionalAuthMiddleware, (req, res) => {
    try {
        const { careerId } = req.params;
        const career = career_service_js_1.CareerService.getCareerBySlugOrId(careerId);
        if (!career) {
            res.status(404).json({ success: false, error: 'Career not found.' });
            return;
        }
        let progressMap = {};
        if (req.user) {
            const progressList = user_service_js_1.UserService.getRoadmapProgress(req.user.id, career.id);
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
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// PUT /api/roadmap/progress (Protected)
router.put('/progress', auth_middleware_js_1.authMiddleware, (req, res) => {
    try {
        const userId = req.user.id;
        const { career_id, stage_order, is_completed } = req.body;
        if (!career_id || stage_order === undefined) {
            res.status(400).json({
                success: false,
                error: 'Missing required fields: career_id, stage_order, is_completed.'
            });
            return;
        }
        user_service_js_1.UserService.updateRoadmapProgress(userId, Number(career_id), Number(stage_order), Boolean(is_completed));
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
