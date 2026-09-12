"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const user_service_js_1 = require("../services/user.service.js");
const router = (0, express_1.Router)();
// Strict user isolation on all profile routes
router.use(auth_middleware_js_1.authMiddleware);
// GET /api/profile (Basic profile)
router.get('/', (req, res) => {
    try {
        const userId = req.user.id;
        const profile = user_service_js_1.UserService.getProfile(userId);
        if (!profile) {
            res.status(404).json({ success: false, error: 'Profile not found.' });
            return;
        }
        res.status(200).json({
            success: true,
            profile,
            data: profile
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// GET /api/profile/full (Comprehensive profile aggregate + completeness)
router.get('/full', (req, res) => {
    try {
        const userId = req.user.id;
        const full = user_service_js_1.UserService.getFullProfile(userId);
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
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// GET /api/profile/completeness
router.get('/completeness', (req, res) => {
    try {
        const userId = req.user.id;
        const completeness = user_service_js_1.UserService.getProfileCompleteness(userId);
        res.status(200).json({
            success: true,
            completeness,
            data: completeness
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// PUT /api/profile
router.put('/', (req, res) => {
    try {
        const userId = req.user.id;
        const { name, year, department, education, experience_level, dream_career, bio, phone, location } = req.body;
        const updated = user_service_js_1.UserService.updateProfile(userId, {
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
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
// ----------------------------------------------------------------------------
// SKILLS SUB-RESOURCE
// ----------------------------------------------------------------------------
router.get('/skills', (req, res) => {
    try {
        const userId = req.user.id;
        const skills = user_service_js_1.UserService.getSkills(userId);
        res.status(200).json({ success: true, skills, data: skills });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/skills', (req, res) => {
    try {
        const userId = req.user.id;
        const { skill_name, proficiency_level, proficiency, category, source } = req.body;
        if (!skill_name || !skill_name.trim()) {
            res.status(400).json({ success: false, error: 'Skill name is required.' });
            return;
        }
        const level = proficiency_level || proficiency || 'intermediate';
        const skill = user_service_js_1.UserService.addSkill(userId, skill_name, level, category, source);
        res.status(201).json({ success: true, skill, data: skill });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
router.delete('/skills/:idOrName', (req, res) => {
    try {
        const userId = req.user.id;
        const param = req.params.idOrName;
        const numId = parseInt(param, 10);
        const target = isNaN(numId) ? param : numId;
        const deleted = user_service_js_1.UserService.deleteSkill(userId, target);
        if (!deleted) {
            res.status(404).json({ success: false, error: 'Skill not found.' });
            return;
        }
        res.status(200).json({ success: true, message: 'Skill deleted successfully.' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// ----------------------------------------------------------------------------
// EDUCATION SUB-RESOURCE
// ----------------------------------------------------------------------------
router.get('/education', (req, res) => {
    try {
        const userId = req.user.id;
        const education = user_service_js_1.UserService.getEducation(userId);
        res.status(200).json({ success: true, education, data: education });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/education', (req, res) => {
    try {
        const userId = req.user.id;
        const { institution, degree, major, academic_year, graduation_year, academic_status, coursework } = req.body;
        if (!institution || !degree) {
            res.status(400).json({ success: false, error: 'Institution and degree are required.' });
            return;
        }
        const edu = user_service_js_1.UserService.addEducation(userId, { institution, degree, major, academic_year, graduation_year, academic_status, coursework });
        res.status(201).json({ success: true, education: edu, data: edu });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
router.delete('/education/:id', (req, res) => {
    try {
        const userId = req.user.id;
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ success: false, error: 'Invalid education ID.' });
            return;
        }
        const deleted = user_service_js_1.UserService.deleteEducation(userId, id);
        if (!deleted) {
            res.status(404).json({ success: false, error: 'Education record not found.' });
            return;
        }
        res.status(200).json({ success: true, message: 'Education record deleted.' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// ----------------------------------------------------------------------------
// EXPERIENCE SUB-RESOURCE
// ----------------------------------------------------------------------------
router.get('/experience', (req, res) => {
    try {
        const userId = req.user.id;
        const experience = user_service_js_1.UserService.getExperience(userId);
        res.status(200).json({ success: true, experience, data: experience });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/experience', (req, res) => {
    try {
        const userId = req.user.id;
        const { organization, role, start_date, end_date, description, technologies, experience_level } = req.body;
        if (!organization || !role) {
            res.status(400).json({ success: false, error: 'Organization and role are required.' });
            return;
        }
        const exp = user_service_js_1.UserService.addExperience(userId, { organization, role, start_date, end_date, description, technologies, experience_level });
        res.status(201).json({ success: true, experience: exp, data: exp });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
router.delete('/experience/:id', (req, res) => {
    try {
        const userId = req.user.id;
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ success: false, error: 'Invalid experience ID.' });
            return;
        }
        const deleted = user_service_js_1.UserService.deleteExperience(userId, id);
        if (!deleted) {
            res.status(404).json({ success: false, error: 'Experience record not found.' });
            return;
        }
        res.status(200).json({ success: true, message: 'Experience record deleted.' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// ----------------------------------------------------------------------------
// PROJECTS SUB-RESOURCE
// ----------------------------------------------------------------------------
router.get('/projects', (req, res) => {
    try {
        const userId = req.user.id;
        const projects = user_service_js_1.UserService.getProjects(userId);
        res.status(200).json({ success: true, projects, data: projects });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/projects', (req, res) => {
    try {
        const userId = req.user.id;
        const { name, description, technologies, role, project_url, github_url, demo_url, difficulty, completion_status } = req.body;
        if (!name) {
            res.status(400).json({ success: false, error: 'Project name is required.' });
            return;
        }
        const proj = user_service_js_1.UserService.addProject(userId, { name, description, technologies, role, project_url, github_url, demo_url, difficulty, completion_status });
        res.status(201).json({ success: true, project: proj, data: proj });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
router.delete('/projects/:id', (req, res) => {
    try {
        const userId = req.user.id;
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ success: false, error: 'Invalid project ID.' });
            return;
        }
        const deleted = user_service_js_1.UserService.deleteProject(userId, id);
        if (!deleted) {
            res.status(404).json({ success: false, error: 'Project record not found.' });
            return;
        }
        res.status(200).json({ success: true, message: 'Project record deleted.' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// ----------------------------------------------------------------------------
// CERTIFICATIONS SUB-RESOURCE
// ----------------------------------------------------------------------------
router.get('/certifications', (req, res) => {
    try {
        const userId = req.user.id;
        const certifications = user_service_js_1.UserService.getCertifications(userId);
        res.status(200).json({ success: true, certifications, data: certifications });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/certifications', (req, res) => {
    try {
        const userId = req.user.id;
        const { name, issuer, issue_date, credential_id, verification_url } = req.body;
        if (!name || !issuer) {
            res.status(400).json({ success: false, error: 'Name and issuer are required.' });
            return;
        }
        const cert = user_service_js_1.UserService.addCertification(userId, { name, issuer, issue_date, credential_id, verification_url });
        res.status(201).json({ success: true, certification: cert, data: cert });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
router.delete('/certifications/:id', (req, res) => {
    try {
        const userId = req.user.id;
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ success: false, error: 'Invalid certification ID.' });
            return;
        }
        const deleted = user_service_js_1.UserService.deleteCertification(userId, id);
        if (!deleted) {
            res.status(404).json({ success: false, error: 'Certification record not found.' });
            return;
        }
        res.status(200).json({ success: true, message: 'Certification record deleted.' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// ----------------------------------------------------------------------------
// GOALS SUB-RESOURCE
// ----------------------------------------------------------------------------
router.get('/goals', (req, res) => {
    try {
        const userId = req.user.id;
        const goals = user_service_js_1.UserService.getGoals(userId);
        res.status(200).json({ success: true, goals, data: goals });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.put('/goals', (req, res) => {
    try {
        const userId = req.user.id;
        const goals = user_service_js_1.UserService.updateGoals(userId, req.body);
        res.status(200).json({ success: true, goals, data: goals });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
// ----------------------------------------------------------------------------
// LINKS SUB-RESOURCE
// ----------------------------------------------------------------------------
router.get('/links', (req, res) => {
    try {
        const userId = req.user.id;
        const links = user_service_js_1.UserService.getLinks(userId);
        res.status(200).json({ success: true, links, data: links });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.put('/links', (req, res) => {
    try {
        const userId = req.user.id;
        const links = user_service_js_1.UserService.updateLinks(userId, req.body);
        res.status(200).json({ success: true, links, data: links });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
exports.default = router;
