"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const recommendation_service_js_1 = require("../services/recommendation.service.js");
const user_service_js_1 = require("../services/user.service.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const router = (0, express_1.Router)();
// Handle recommendation generation
async function handleRecommendation(req, res) {
    try {
        const payload = req.body;
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
        const missing = [];
        if (!payload.education && !payload.department && !payload.year)
            missing.push('education');
        if (!payload.skills)
            missing.push('skills');
        if (!payload.interest)
            missing.push('interest');
        if (missing.length > 0) {
            res.status(400).json({
                success: false,
                error: `Missing required fields: ${missing.join(', ')}`
            });
            return;
        }
        const evaluation = recommendation_service_js_1.RecommendationService.evaluate(payload);
        // If user is authenticated, mark saved status and record in history
        if (req.user) {
            const isPrimarySaved = user_service_js_1.UserService.isCareerSaved(req.user.id, evaluation.primary_recommendation.id);
            evaluation.primary_recommendation.is_saved = isPrimarySaved;
            evaluation.alternative_recommendations.forEach(alt => {
                alt.is_saved = user_service_js_1.UserService.isCareerSaved(req.user.id, alt.id);
            });
            const assessmentId = user_service_js_1.UserService.recordRecommendation(req.user.id, payload, evaluation);
            evaluation.assessment_id = assessmentId;
        }
        res.status(200).json(evaluation);
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message || 'Error generating career recommendation.'
        });
    }
}
// POST /api/assessment
router.post('/', auth_middleware_js_1.optionalAuthMiddleware, handleRecommendation);
// POST /api/recommendations/generate
router.post('/generate', auth_middleware_js_1.optionalAuthMiddleware, handleRecommendation);
// GET /api/recommendations (or /api/assessment/history)
router.get('/history', auth_middleware_js_1.authMiddleware, (req, res) => {
    try {
        const history = user_service_js_1.UserService.getRecommendationHistory(req.user.id);
        res.status(200).json({
            success: true,
            count: history.length,
            history,
            data: history
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// GET /api/assessment/latest
router.get('/latest', auth_middleware_js_1.authMiddleware, (req, res) => {
    try {
        const latest = user_service_js_1.UserService.getLatestRecommendation(req.user.id);
        res.status(200).json({
            success: true,
            assessment: latest,
            latest
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;
