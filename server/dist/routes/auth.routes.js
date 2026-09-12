"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_service_js_1 = require("../services/auth.service.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const router = (0, express_1.Router)();
// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, year, department, education, experience_level } = req.body;
        const result = await auth_service_js_1.AuthService.register({ email, password, name, year, department, education, experience_level });
        res.status(201).json({
            success: true,
            message: 'Account registered successfully.',
            user: result.user,
            token: result.token
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message || 'Registration failed.'
        });
    }
});
// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await auth_service_js_1.AuthService.login(email, password);
        res.status(200).json({
            success: true,
            message: 'Logged in successfully.',
            user: result.user,
            token: result.token
        });
    }
    catch (error) {
        res.status(401).json({
            success: false,
            error: error.message || 'Login failed.'
        });
    }
});
// POST /api/auth/logout
router.post('/logout', (req, res) => {
    // Stateless JWT logout is handled on client by discarding token
    res.status(200).json({
        success: true,
        message: 'Logged out successfully.'
    });
});
// GET /api/auth/me
router.get('/me', auth_middleware_js_1.authMiddleware, (req, res) => {
    if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized.' });
        return;
    }
    const user = auth_service_js_1.AuthService.getUserById(req.user.id);
    if (!user) {
        res.status(404).json({ success: false, error: 'User not found.' });
        return;
    }
    res.status(200).json({
        success: true,
        user
    });
});
exports.default = router;
