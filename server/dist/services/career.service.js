"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CareerService = void 0;
const db_js_1 = require("../database/db.js");
class CareerService {
    static getAllCareers(filters) {
        const db = (0, db_js_1.getDatabase)();
        let sql = `
      SELECT id, slug, title, category, description, education_level, min_experience,
             career_overview, day_to_day, salary_range
      FROM careers
      WHERE active = 1
    `;
        const params = [];
        if (filters?.category) {
            sql += ` AND category = ?`;
            params.push(filters.category);
        }
        if (filters?.search) {
            sql += ` AND (title LIKE ? OR description LIKE ? OR career_overview LIKE ?)`;
            const s = `%${filters.search}%`;
            params.push(s, s, s);
        }
        sql += ` ORDER BY title ASC`;
        const rows = db.prepare(sql).all(...params);
        return rows.map(r => this.hydrateCareer(r.id, r));
    }
    static getCareerBySlugOrId(identifier, userId) {
        const db = (0, db_js_1.getDatabase)();
        let row;
        if (typeof identifier === 'number' || /^\d+$/.test(String(identifier))) {
            row = db.prepare(`
        SELECT id, slug, title, category, description, education_level, min_experience,
               career_overview, day_to_day, salary_range
        FROM careers
        WHERE id = ? AND active = 1
      `).get(Number(identifier));
        }
        else {
            row = db.prepare(`
        SELECT id, slug, title, category, description, education_level, min_experience,
               career_overview, day_to_day, salary_range
        FROM careers
        WHERE slug = ? AND active = 1
      `).get(identifier);
        }
        if (!row)
            return null;
        return this.hydrateCareer(row.id, row, userId);
    }
    static hydrateCareer(careerId, baseRow, userId) {
        const db = (0, db_js_1.getDatabase)();
        // Skills
        const skillRows = db.prepare(`
      SELECT s.name, cs.importance
      FROM career_skills cs
      JOIN skills s ON cs.skill_id = s.id
      WHERE cs.career_id = ?
    `).all(careerId);
        const required_skills = [];
        const preferred_skills = [];
        for (const sr of skillRows) {
            if (sr.importance === 'required') {
                required_skills.push(sr.name);
            }
            else {
                preferred_skills.push(sr.name);
            }
        }
        // Interests
        const interestRows = db.prepare(`
      SELECT i.name
      FROM career_interests ci
      JOIN interests i ON ci.interest_id = i.id
      WHERE ci.career_id = ?
    `).all(careerId);
        // Resources
        const resources = db.prepare(`
      SELECT id, career_id, title, resource_type, platform, url
      FROM resources
      WHERE career_id = ?
      ORDER BY id ASC
    `).all(careerId);
        // Roadmap
        const roadmap = db.prepare(`
      SELECT id, stage_order, period, focus, description
      FROM career_roadmaps
      WHERE career_id = ?
      ORDER BY stage_order ASC
    `).all(careerId);
        // Projects
        const projects = db.prepare(`
      SELECT id, project_order, title, description, difficulty, skills_practiced
      FROM career_projects
      WHERE career_id = ?
      ORDER BY project_order ASC
    `).all(careerId);
        let isSaved = false;
        const progressMap = {};
        if (userId) {
            const savedRow = db.prepare('SELECT 1 FROM saved_careers WHERE user_id = ? AND career_id = ?').get(userId, careerId);
            isSaved = !!savedRow;
            const progressRows = db.prepare('SELECT stage_order, is_completed FROM roadmap_progress WHERE user_id = ? AND career_id = ?').all(userId, careerId);
            progressRows.forEach(p => {
                progressMap[p.stage_order] = p.is_completed === 1;
            });
        }
        const roadmapWithProgress = roadmap.map(stg => ({
            ...stg,
            is_completed: !!progressMap[stg.stage_order]
        }));
        return {
            id: baseRow.id,
            slug: baseRow.slug,
            title: baseRow.title,
            category: baseRow.category,
            description: baseRow.description,
            education_level: baseRow.education_level,
            min_experience: baseRow.min_experience,
            career_overview: baseRow.career_overview,
            day_to_day: baseRow.day_to_day,
            salary_range: baseRow.salary_range,
            skills: [...required_skills, ...preferred_skills],
            required_skills,
            preferred_skills,
            interests: interestRows.map(i => i.name),
            resources,
            roadmap: roadmapWithProgress,
            roadmaps: roadmapWithProgress,
            projects,
            is_saved: isSaved
        };
    }
    static getAllSkills() {
        const db = (0, db_js_1.getDatabase)();
        const rows = db.prepare('SELECT name, category FROM skills ORDER BY category, name').all();
        const grouped = {};
        for (const r of rows) {
            if (!grouped[r.category])
                grouped[r.category] = [];
            grouped[r.category].push(r.name);
        }
        return Object.entries(grouped).map(([category, skills]) => ({
            category,
            skills
        }));
    }
    static getAllInterests() {
        const db = (0, db_js_1.getDatabase)();
        const rows = db.prepare('SELECT name FROM interests ORDER BY name ASC').all();
        return rows.map(r => r.name);
    }
    static getAllProjects() {
        const db = (0, db_js_1.getDatabase)();
        return db.prepare(`
      SELECT cp.id, cp.project_order, cp.title, cp.description, cp.difficulty, cp.skills_practiced, c.title as career_title
      FROM career_projects cp
      JOIN careers c ON cp.career_id = c.id
      ORDER BY c.title, cp.project_order ASC
    `).all();
    }
}
exports.CareerService = CareerService;
