"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const auth_routes_js_1 = __importDefault(require("./routes/auth.routes.js"));
const career_routes_js_1 = __importDefault(require("./routes/career.routes.js"));
const profile_routes_js_1 = __importDefault(require("./routes/profile.routes.js"));
const assessment_routes_js_1 = __importDefault(require("./routes/assessment.routes.js"));
const saved_routes_js_1 = __importDefault(require("./routes/saved.routes.js"));
const roadmap_routes_js_1 = __importDefault(require("./routes/roadmap.routes.js"));
const resume_routes_js_1 = __importDefault(require("./routes/resume.routes.js"));
const career_service_js_1 = require("./services/career.service.js");
function createApp() {
    const app = (0, express_1.default)();
    const configuredOrigins = process.env.FRONTEND_URL
        ? process.env.FRONTEND_URL.split(',').map((u) => u.trim().replace(/\/$/, ''))
        : [];
    const defaultOrigins = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:5000',
        'http://127.0.0.1:5000'
    ];
    const allowedOrigins = [...new Set([...configuredOrigins, ...defaultOrigins])];
    // 1. Security Headers (Helmet)
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                fontSrc: ["'self'", "https://fonts.gstatic.com"],
                imgSrc: ["'self'", "data:", "https:"],
                connectSrc: ["'self'", ...configuredOrigins]
            }
        },
        frameguard: { action: 'deny' },
        noSniff: true
    }));
    // 2. CORS
    app.use((0, cors_1.default)({
        origin: (origin, callback) => {
            if (!origin)
                return callback(null, true);
            const normalizedOrigin = origin.replace(/\/$/, '');
            if (allowedOrigins.includes(normalizedOrigin)) {
                return callback(null, true);
            }
            if (process.env.NODE_ENV === 'production') {
                return callback(new Error(`CORS blocked for origin: ${origin}`));
            }
            callback(null, true); // Dev fallback
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));
    // 3. Body parsers
    app.use(express_1.default.json({ limit: '1mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '1mb' }));
    // 4. Rate limiting for sensitive operations
    const authLimiter = (0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000, // 15 mins
        max: process.env.NODE_ENV === 'test' ? 1000 : 50,
        message: { success: false, error: 'Too many requests, please try again later.' }
    });
    const resumeLimiter = (0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000, // 15 mins
        max: process.env.NODE_ENV === 'test' ? 1000 : 20,
        message: { success: false, error: 'Too many resume upload requests, please try again later.' }
    });
    app.use('/api/auth/login', authLimiter);
    app.use('/api/auth/register', authLimiter);
    app.use('/api/resume/upload', resumeLimiter);
    // 5. Health check & API Options
    app.get(['/health', '/api/health'], (req, res) => {
        res.status(200).json({ status: 'ok', service: 'FutureHub API', timestamp: new Date().toISOString() });
    });
    // Backward-compatible /api/options for existing contract
    app.get('/api/options', (req, res) => {
        try {
            const skills = career_service_js_1.CareerService.getAllSkills();
            const interests = career_service_js_1.CareerService.getAllInterests();
            const skillsMap = {};
            skills.forEach((s) => {
                skillsMap[s.category] = s.skills;
            });
            res.status(200).json({
                success: true,
                options: {
                    education_levels: [
                        'B.Sc Computer Science (TYCS / SYCS / FYCS)',
                        'Bachelor of Computer Applications (BCA)',
                        'B.Tech / B.E. Computer Science / IT',
                        'Master of Computer Applications (MCA)',
                        'Diploma / Other Technical Degree'
                    ],
                    interests,
                    skills_by_category: skillsMap,
                    experience_levels: ['Beginner', '1–2 Years', '3+ Years']
                }
            });
        }
        catch (e) {
            res.status(500).json({ success: false, error: e.message });
        }
    });
    // Backward-compatible /api/recommend endpoint
    app.post('/api/recommend', (req, res, next) => {
        // Forward to assessment handler
        app._router.handle({ ...req, url: '/api/assessment', method: 'POST' }, res, next);
    });
    // 6. Mount REST API Routes
    app.use('/api/auth', auth_routes_js_1.default);
    app.use('/api/careers', career_routes_js_1.default);
    app.use('/api/profile', profile_routes_js_1.default);
    app.use('/api/assessment', assessment_routes_js_1.default);
    app.use('/api/recommendations', assessment_routes_js_1.default);
    app.use('/api/saved-careers', saved_routes_js_1.default);
    app.use('/api/roadmap', roadmap_routes_js_1.default);
    app.use('/api/resume', resume_routes_js_1.default);
    // 7. Serve Static Frontend if built
    const clientDist = path_1.default.resolve(process.cwd(), '../client/dist');
    const localClientDist = path_1.default.resolve(process.cwd(), 'client/dist');
    const publicStatic = path_1.default.resolve(process.cwd(), 'public');
    let staticPath = null;
    if (fs_1.default.existsSync(clientDist))
        staticPath = clientDist;
    else if (fs_1.default.existsSync(localClientDist))
        staticPath = localClientDist;
    else if (fs_1.default.existsSync(publicStatic))
        staticPath = publicStatic;
    if (staticPath) {
        app.use(express_1.default.static(staticPath));
        app.get('*', (req, res, next) => {
            if (req.path.startsWith('/api'))
                return next();
            res.sendFile(path_1.default.join(staticPath, 'index.html'));
        });
    }
    // 8. 404 Handler for undefined API routes
    app.use('/api/*', (req, res) => {
        res.status(404).json({
            success: false,
            error: `API route "${req.method} ${req.originalUrl}" not found.`
        });
    });
    // 9. Global Error Handler
    app.use((err, req, res, next) => {
        console.error('Unhandled server error:', err);
        res.status(err.status || 500).json({
            success: false,
            error: process.env.NODE_ENV === 'production' ? 'Internal server error.' : (err.message || 'Server error.')
        });
    });
    return app;
}
