"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const user_service_js_1 = require("../services/user.service.js");
const router = (0, express_1.Router)();
// Strict user isolation
router.use(auth_middleware_js_1.authMiddleware);
// GET /api/saved-careers
router.get('/', (req, res) => {
    try {
        const userId = req.user.id;
        const saved = user_service_js_1.UserService.getSavedCareers(userId);
        res.status(200).json({
            success: true,
            count: saved.length,
            saved_careers: saved,
            data: saved
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// POST /api/saved-careers/:careerId
router.post('/:careerId', (req, res) => {
    try {
        const userId = req.user.id;
        const careerId = Number(req.params.careerId);
        const { notes } = req.body || {};
        if (isNaN(careerId)) {
            res.status(400).json({ success: false, error: 'Invalid career ID.' });
            return;
        }
        user_service_js_1.UserService.saveCareer(userId, careerId, notes || '');
        res.status(200).json({
            success: true,
            message: 'Career saved to your bookmarks.'
        });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
// DELETE /api/saved-careers/:careerId
router.delete('/:careerId', (req, res) => {
    try {
        const userId = req.user.id;
        const careerId = Number(req.params.careerId);
        if (isNaN(careerId)) {
            res.status(400).json({ success: false, error: 'Invalid career ID.' });
            return;
        }
        const removed = user_service_js_1.UserService.unsaveCareer(userId, careerId);
        res.status(200).json({
            success: true,
            message: removed ? 'Career removed from bookmarks.' : 'Career was not saved.'
        });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
exports.default = router;
