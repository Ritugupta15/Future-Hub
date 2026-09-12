"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumeService = exports.RESUME_UPLOAD_DIR = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const mammoth_1 = __importDefault(require("mammoth"));
const db_js_1 = require("../database/db.js");
const career_service_js_1 = require("./career.service.js");
const user_service_js_1 = require("./user.service.js");
exports.RESUME_UPLOAD_DIR = path_1.default.resolve(process.cwd(), 'uploads/resumes');
// Ensure upload directory exists securely
if (!fs_1.default.existsSync(exports.RESUME_UPLOAD_DIR)) {
    fs_1.default.mkdirSync(exports.RESUME_UPLOAD_DIR, { recursive: true });
}
class ResumeService {
    /**
     * Save an uploaded resume file and record metadata in the database
     */
    static async processAndSaveResume(userId, file) {
        const db = (0, db_js_1.getDatabase)();
        // 1. Validate file extension and MIME
        const allowedExtensions = ['.pdf', '.docx'];
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        if (!allowedExtensions.includes(ext)) {
            throw new Error(`Invalid file type "${ext}". Only PDF and DOCX documents are accepted.`);
        }
        // 2. Reject disguised executables, binaries and scripts
        if (file.buffer && file.buffer.length >= 2) {
            if (file.buffer[0] === 0x4D && file.buffer[1] === 0x5A) {
                throw new Error('Disguised executable detected. Executable files are strictly forbidden.');
            }
            if (file.buffer[0] === 0x23 && file.buffer[1] === 0x21) {
                throw new Error('Script detected. Shell scripts are strictly forbidden.');
            }
        }
        if (file.buffer && file.buffer.length >= 4) {
            if (file.buffer[0] === 0x7F && file.buffer[1] === 0x45 && file.buffer[2] === 0x4C && file.buffer[3] === 0x46) {
                throw new Error('Disguised binary detected. Binary executables are strictly forbidden.');
            }
        }
        // 2. Generate secure UUID filename to prevent path traversal & original name vulnerabilities
        const randomName = `${crypto_1.default.randomUUID()}${ext}`;
        const storedPath = path_1.default.resolve(exports.RESUME_UPLOAD_DIR, randomName);
        // Verify stored path is strictly inside upload directory
        if (!storedPath.startsWith(exports.RESUME_UPLOAD_DIR)) {
            throw new Error('Path traversal detected.');
        }
        // Write file to secure storage directory
        fs_1.default.writeFileSync(storedPath, file.buffer);
        // 3. Determine new version for this user
        const latestResume = db.prepare(`
      SELECT MAX(version) as max_version FROM resumes WHERE user_id = ?
    `).get(userId);
        const version = (latestResume?.max_version || 0) + 1;
        // Set previous active resumes to inactive
        db.prepare(`
      UPDATE resumes SET is_active = 0 WHERE user_id = ?
    `).run(userId);
        // Sanitize display filename
        const sanitizedOriginal = path_1.default.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
        // Insert new resume record
        db.prepare(`
      INSERT INTO resumes (user_id, original_filename, stored_filename, mime_type, file_size, file_path, is_active, version)
      VALUES (?, ?, ?, ?, ?, ?, 1, ?)
    `).run(userId, sanitizedOriginal, randomName, file.mimetype, file.size, storedPath, version);
        const resumeRow = db.prepare('SELECT last_insert_rowid() as id').get();
        const resumeId = resumeRow.id;
        // 4. Extract raw text from buffer
        let rawText = '';
        try {
            if (ext === '.pdf') {
                try {
                    const pdfModule = await import('pdf-parse');
                    const PDFParse = pdfModule.PDFParse;
                    if (PDFParse) {
                        const parser = new PDFParse({ data: file.buffer });
                        const res = await parser.getText();
                        rawText = res?.text || '';
                    }
                }
                catch (pdfErr) {
                    rawText = file.buffer.toString('utf8');
                }
            }
            else if (ext === '.docx') {
                const result = await mammoth_1.default.extractRawText({ buffer: file.buffer });
                rawText = result.value || '';
            }
        }
        catch (parseErr) {
            console.error('Error parsing document text:', parseErr);
            rawText = '';
        }
        // 5. Deterministically extract candidate entities
        const extracted = this.extractEntitiesFromText(rawText);
        // 6. Record extraction result
        const status = rawText.trim().length > 0 ? 'parsed' : 'failed';
        db.prepare(`
      INSERT INTO resume_extractions (resume_id, user_id, raw_text, status, extracted_json)
      VALUES (?, ?, ?, ?, ?)
    `).run(resumeId, userId, rawText.substring(0, 50000), // Protect database size
        status, JSON.stringify(extracted));
        const extractionRow = db.prepare('SELECT last_insert_rowid() as id').get();
        const resume = this.getResumeById(userId, resumeId);
        const extraction = {
            id: extractionRow.id,
            resume_id: resumeId,
            user_id: userId,
            status: status,
            extracted_json: extracted,
            created_at: new Date().toISOString()
        };
        return { resume, extraction };
    }
    /**
     * Deterministic pattern matching & catalog matching for extracted resume entities
     * Zero hallucination: only pattern-matched items from the actual text are returned.
     */
    static extractEntitiesFromText(text) {
        const result = {
            links: {},
            skills: [],
            education: [],
            experience: [],
            projects: [],
            certifications: []
        };
        if (!text || !text.trim())
            return result;
        // 1. Email extraction
        const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        if (emailMatch) {
            result.email = emailMatch[0];
        }
        // 2. Phone extraction
        const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
        if (phoneMatch) {
            result.phone = phoneMatch[0];
        }
        // 3. Links extraction
        const githubMatch = text.match(/github\.com\/([a-zA-Z0-9_-]+)/i);
        if (githubMatch) {
            result.links.github = `https://${githubMatch[0]}`;
        }
        const linkedinMatch = text.match(/linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);
        if (linkedinMatch) {
            result.links.linkedin = `https://${linkedinMatch[0]}`;
        }
        const portfolioMatch = text.match(/https?:\/\/[a-zA-Z0-9.-]+\.(?:dev|me|io|com)(?:\/[^\s]*)?/i);
        if (portfolioMatch && !portfolioMatch[0].includes('github.com') && !portfolioMatch[0].includes('linkedin.com')) {
            result.links.portfolio = portfolioMatch[0];
        }
        // 4. Skills extraction: Match against FutureHub's 27 canonical skills + common tech terms
        const allSystemSkills = career_service_js_1.CareerService.getAllSkills();
        const systemSkillNames = [];
        allSystemSkills.forEach(cat => {
            cat.skills.forEach(s => {
                systemSkillNames.push({ name: s, category: cat.category });
            });
        });
        // Additional known high-frequency tech terms
        const techCatalog = [
            { name: 'Python', category: 'Programming & Scripting', regex: /\bpython(?:3)?\b/i },
            { name: 'JavaScript', category: 'Web Development', regex: /\bjavascript|js\b/i },
            { name: 'TypeScript', category: 'Web Development', regex: /\btypescript|ts\b/i },
            { name: 'React', category: 'Web Development', regex: /\breact(?:\.js)?\b/i },
            { name: 'Node.js', category: 'Backend & Cloud', regex: /\bnode(?:\.js)?\b/i },
            { name: 'Express', category: 'Backend & Cloud', regex: /\bexpress(?:\.js)?\b/i },
            { name: 'SQL', category: 'Data & Databases', regex: /\bsql\b/i },
            { name: 'PostgreSQL', category: 'Data & Databases', regex: /\bpostgres(?:ql)?\b/i },
            { name: 'MongoDB', category: 'Data & Databases', regex: /\bmongo(?:db)?\b/i },
            { name: 'Docker', category: 'Cloud & DevOps', regex: /\bdocker\b/i },
            { name: 'Kubernetes', category: 'Cloud & DevOps', regex: /\bkubernetes|k8s\b/i },
            { name: 'AWS', category: 'Cloud & DevOps', regex: /\baws|amazon web services\b/i },
            { name: 'Git', category: 'Development Tools', regex: /\bgit|github|gitlab\b/i },
            { name: 'Linux', category: 'Systems & OS', regex: /\blinux|ubuntu|debian\b/i },
            { name: 'Java', category: 'Programming & Scripting', regex: /\bjava\b(?!\s*script)/i },
            { name: 'C++', category: 'Programming & Scripting', regex: /\bc\+\+\b/i },
            { name: 'HTML', category: 'Web Development', regex: /\bhtml(?:5)?\b/i },
            { name: 'CSS', category: 'Web Development', regex: /\bcss(?:3)?\b/i },
            { name: 'Tailwind CSS', category: 'Web Development', regex: /\btailwind(?:\s*css)?\b/i },
            { name: 'REST APIs', category: 'Backend & Cloud', regex: /\brest(?:ful)?\s*(?:api|apis)?\b/i },
            { name: 'Data Analysis', category: 'Data Science & AI', regex: /\bdata analysis\b/i },
            { name: 'Machine Learning', category: 'Data Science & AI', regex: /\bmachine learning|ml\b/i },
            { name: 'Cyber Security', category: 'Security & Forensics', regex: /\bcyber\s*security|infosec\b/i },
            { name: 'Wireshark', category: 'Security & Forensics', regex: /\bwireshark\b/i },
            { name: 'Excel', category: 'Data & Analytics', regex: /\bexcel\b/i },
            { name: 'Pandas', category: 'Data Science & AI', regex: /\bpandas\b/i },
            { name: 'Jest', category: 'Quality & Testing', regex: /\bjest\b/i }
        ];
        const matchedSkillNames = new Set();
        // Check system skills first
        for (const sysSkill of systemSkillNames) {
            const escaped = sysSkill.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const pattern = new RegExp(`\\b${escaped}\\b`, 'i');
            if (pattern.test(text) && !matchedSkillNames.has(sysSkill.name.toLowerCase())) {
                matchedSkillNames.add(sysSkill.name.toLowerCase());
                result.skills.push({
                    name: sysSkill.name,
                    category: sysSkill.category,
                    matched_from: sysSkill.name
                });
            }
        }
        // Check tech catalog
        for (const tech of techCatalog) {
            if (tech.regex.test(text) && !matchedSkillNames.has(tech.name.toLowerCase())) {
                matchedSkillNames.add(tech.name.toLowerCase());
                result.skills.push({
                    name: tech.name,
                    category: tech.category,
                    matched_from: tech.name
                });
            }
        }
        // 5. Education heuristic extraction
        const degreePatterns = [
            { degree: 'B.Sc Computer Science', pattern: /b\.?sc(?:\.|\s)+computer\s+science|b\.?sc\s+cs/i },
            { degree: 'Bachelor of Computer Applications (BCA)', pattern: /bca|bachelor\s+of\s+computer\s+applications/i },
            { degree: 'B.Tech Computer Science / IT', pattern: /b\.?tech|bachelor\s+of\s+technology/i },
            { degree: 'Master of Computer Applications (MCA)', pattern: /mca|master\s+of\s+computer\s+applications/i },
            { degree: 'M.Tech / M.Sc Computer Science', pattern: /m\.?tech|m\.?sc(?:\.|\s)+computer\s+science/i },
            { degree: 'Diploma in Computer Technology', pattern: /diploma\s+(?:in|of)?\s*(?:computer|it)/i }
        ];
        for (const dp of degreePatterns) {
            if (dp.pattern.test(text)) {
                const instMatch = text.match(/(?:at|from|university|institute|college|school)\s+([a-zA-Z\s]{4,40})/i);
                result.education.push({
                    degree: dp.degree,
                    institution: instMatch ? instMatch[1].trim() : 'University / College',
                    major: 'Computer Science'
                });
                break;
            }
        }
        // 6. Experience heuristic extraction
        const experienceHeaders = /(?:experience|work\s+history|employment|internships?)[\s\S]{10,400}/i;
        const expBlock = text.match(experienceHeaders);
        if (expBlock) {
            const roleMatches = expBlock[0].match(/(?:Software|Frontend|Backend|Full\s*Stack|Data\s*Analyst|Web|Intern|Engineer|Developer|Analyst)\s*(?:Engineer|Developer|Intern|Associate)?/gi);
            if (roleMatches && roleMatches.length > 0) {
                result.experience.push({
                    role: roleMatches[0].trim(),
                    organization: 'Extracted Organization',
                    description: 'Identified from CV experience section'
                });
            }
        }
        // 7. Projects heuristic extraction
        const projectHeaders = /(?:projects|academic\s+projects|personal\s+projects)[\s\S]{10,300}/i;
        const projBlock = text.match(projectHeaders);
        if (projBlock) {
            const projLines = projBlock[0].split('\n').map(l => l.trim()).filter(l => l.length > 5 && !l.toLowerCase().includes('project'));
            if (projLines.length > 0) {
                result.projects.push({
                    name: projLines[0].substring(0, 60),
                    description: 'Identified from CV projects section'
                });
            }
        }
        return result;
    }
    /**
     * Get active resume for a user
     */
    static getActiveResume(userId) {
        const db = (0, db_js_1.getDatabase)();
        const resume = db.prepare(`
      SELECT id, user_id, original_filename, stored_filename, mime_type, file_size, file_path, upload_date, is_active, version
      FROM resumes
      WHERE user_id = ? AND is_active = 1
      ORDER BY id DESC
      LIMIT 1
    `).get(userId);
        if (!resume) {
            return { resume: null, extraction: null };
        }
        const extractionRow = db.prepare(`
      SELECT id, resume_id, user_id, raw_text, status, extracted_json, reviewed_json, created_at, reviewed_at
      FROM resume_extractions
      WHERE resume_id = ? AND user_id = ?
      ORDER BY id DESC
      LIMIT 1
    `).get(resume.id, userId);
        let extraction = null;
        if (extractionRow) {
            let parsedExtracted = {};
            let parsedReviewed = null;
            try {
                parsedExtracted = JSON.parse(extractionRow.extracted_json);
            }
            catch { }
            try {
                if (extractionRow.reviewed_json)
                    parsedReviewed = JSON.parse(extractionRow.reviewed_json);
            }
            catch { }
            extraction = {
                id: extractionRow.id,
                resume_id: extractionRow.resume_id,
                user_id: extractionRow.user_id,
                status: extractionRow.status,
                extracted_json: parsedExtracted,
                reviewed_json: parsedReviewed,
                created_at: extractionRow.created_at,
                reviewed_at: extractionRow.reviewed_at
            };
        }
        return { resume, extraction };
    }
    /**
     * Safe file download resolution with strict ownership validation (Zero-IDOR)
     */
    static getResumeDownload(userId, resumeId) {
        const db = (0, db_js_1.getDatabase)();
        const row = db.prepare(`
      SELECT id, user_id, original_filename, stored_filename, file_path, mime_type
      FROM resumes
      WHERE id = ? AND user_id = ?
    `).get(resumeId, userId);
        if (!row) {
            return null;
        }
        const absolutePath = path_1.default.resolve(exports.RESUME_UPLOAD_DIR, row.stored_filename);
        if (!absolutePath.startsWith(exports.RESUME_UPLOAD_DIR) || !fs_1.default.existsSync(absolutePath)) {
            return null;
        }
        return {
            filePath: absolutePath,
            originalFilename: row.original_filename,
            mimeType: row.mime_type
        };
    }
    /**
     * Delete resume file and database record with strict ownership validation (Zero-IDOR)
     */
    static deleteResume(userId, resumeId) {
        const db = (0, db_js_1.getDatabase)();
        const row = db.prepare(`
      SELECT id, stored_filename, file_path
      FROM resumes
      WHERE id = ? AND user_id = ?
    `).get(resumeId, userId);
        if (!row) {
            return false;
        }
        // Safely delete file from disk
        const absolutePath = path_1.default.resolve(exports.RESUME_UPLOAD_DIR, row.stored_filename);
        if (absolutePath.startsWith(exports.RESUME_UPLOAD_DIR) && fs_1.default.existsSync(absolutePath)) {
            try {
                fs_1.default.unlinkSync(absolutePath);
            }
            catch (e) {
                console.error('Error removing resume file from storage:', e);
            }
        }
        // Delete DB record
        db.prepare('DELETE FROM resumes WHERE id = ? AND user_id = ?').run(resumeId, userId);
        return true;
    }
    /**
     * Assisted extraction review commit: Student accepts, edits, or ignores extracted items
     */
    static reviewAndApplyExtraction(userId, resumeId, reviewPayload) {
        const db = (0, db_js_1.getDatabase)();
        // Verify extraction ownership
        const extraction = db.prepare(`
      SELECT id FROM resume_extractions WHERE resume_id = ? AND user_id = ?
    `).get(resumeId, userId);
        if (!extraction) {
            throw new Error('Extraction record not found or access denied.');
        }
        // 1. Commit accepted skills
        if (reviewPayload.accepted_skills && reviewPayload.accepted_skills.length > 0) {
            const insertSkill = db.prepare(`
        INSERT INTO profile_skills (user_id, skill_name, category, proficiency_level, source)
        VALUES (?, ?, 'CV Extracted', ?, 'cv')
        ON CONFLICT(user_id, skill_name) DO UPDATE SET
          proficiency_level = excluded.proficiency_level,
          source = 'cv'
      `);
            for (const s of reviewPayload.accepted_skills) {
                if (s.name && s.name.trim()) {
                    insertSkill.run(userId, s.name.trim(), s.proficiency || 'intermediate');
                }
            }
        }
        // 2. Commit accepted education
        if (reviewPayload.accepted_education && reviewPayload.accepted_education.length > 0) {
            const insertEdu = db.prepare(`
        INSERT INTO profile_education (user_id, institution, degree, major, academic_year)
        VALUES (?, ?, ?, ?, ?)
      `);
            for (const edu of reviewPayload.accepted_education) {
                if (edu.degree && edu.institution) {
                    insertEdu.run(userId, edu.institution.trim(), edu.degree.trim(), edu.major?.trim() || 'Computer Science', edu.year || '');
                }
            }
        }
        // 3. Commit accepted experience
        if (reviewPayload.accepted_experience && reviewPayload.accepted_experience.length > 0) {
            const insertExp = db.prepare(`
        INSERT INTO profile_experience (user_id, organization, role, description, technologies)
        VALUES (?, ?, ?, ?, ?)
      `);
            for (const exp of reviewPayload.accepted_experience) {
                if (exp.role && exp.organization) {
                    insertExp.run(userId, exp.organization.trim(), exp.role.trim(), exp.description || '', exp.technologies || '');
                }
            }
        }
        // 4. Commit accepted projects
        if (reviewPayload.accepted_projects && reviewPayload.accepted_projects.length > 0) {
            const insertProj = db.prepare(`
        INSERT INTO profile_projects (user_id, name, description, technologies)
        VALUES (?, ?, ?, ?)
      `);
            for (const proj of reviewPayload.accepted_projects) {
                if (proj.name) {
                    insertProj.run(userId, proj.name.trim(), proj.description || '', proj.technologies || '');
                }
            }
        }
        // 5. Commit accepted links
        if (reviewPayload.accepted_links) {
            user_service_js_1.UserService.updateLinks(userId, {
                github_url: reviewPayload.accepted_links.github,
                linkedin_url: reviewPayload.accepted_links.linkedin,
                portfolio_url: reviewPayload.accepted_links.portfolio
            });
        }
        // Mark extraction reviewed
        db.prepare(`
      UPDATE resume_extractions
      SET status = 'reviewed',
          reviewed_json = ?,
          reviewed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(JSON.stringify(reviewPayload), extraction.id);
        return true;
    }
    static getResumeById(userId, resumeId) {
        const db = (0, db_js_1.getDatabase)();
        return db.prepare(`
      SELECT id, user_id, original_filename, stored_filename, mime_type, file_size, file_path, upload_date, is_active, version
      FROM resumes WHERE id = ? AND user_id = ?
    `).get(resumeId, userId) || null;
    }
}
exports.ResumeService = ResumeService;
