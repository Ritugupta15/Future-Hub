-- ============================================================================
-- FutureHub Database Schema (SQLite 3)
-- Normalized architecture: Strict separation between Global Data and User Data
-- Foreign Keys enforced. Indexes for sub-millisecond lookups.
-- ============================================================================

PRAGMA foreign_keys = ON;

-- ----------------------------------------------------------------------------
-- GLOBAL REFERENCE TABLES
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS careers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    education_level TEXT NOT NULL,
    min_experience TEXT NOT NULL,
    career_overview TEXT NOT NULL,
    day_to_day TEXT NOT NULL,
    salary_range TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS career_skills (
    career_id INTEGER NOT NULL,
    skill_id INTEGER NOT NULL,
    importance TEXT NOT NULL CHECK (importance IN ('required', 'preferred')),
    PRIMARY KEY (career_id, skill_id),
    FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS interests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS career_interests (
    career_id INTEGER NOT NULL,
    interest_id INTEGER NOT NULL,
    weight REAL NOT NULL DEFAULT 1.0,
    PRIMARY KEY (career_id, interest_id),
    FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE CASCADE,
    FOREIGN KEY (interest_id) REFERENCES interests(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    career_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    platform TEXT NOT NULL,
    url TEXT NOT NULL,
    FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS career_roadmaps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    career_id INTEGER NOT NULL,
    stage_order INTEGER NOT NULL,
    period TEXT NOT NULL,
    focus TEXT NOT NULL,
    description TEXT,
    FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS career_projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    career_id INTEGER NOT NULL,
    project_order INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    skills_practiced TEXT NOT NULL,
    FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------------------
-- USER SPECIFIC TABLES (Strict Isolation & Ownership)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    year TEXT,
    department TEXT,
    education TEXT,
    experience_level TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    dream_career TEXT,
    bio TEXT,
    phone TEXT,
    location TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    year TEXT NOT NULL,
    department TEXT NOT NULL,
    education TEXT NOT NULL,
    skills_json TEXT NOT NULL, -- Stored as JSON array: ["Python", "SQL"]
    interest TEXT NOT NULL,
    experience TEXT NOT NULL,
    dream_career TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    assessment_id INTEGER,
    primary_career_id INTEGER NOT NULL,
    primary_career_title TEXT NOT NULL,
    match_score INTEGER NOT NULL,
    breakdown_json TEXT NOT NULL, -- Stored as JSON detailing skills, roadmap, projects, explanations
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assessment_id) REFERENCES user_assessments(id) ON DELETE SET NULL,
    FOREIGN KEY (primary_career_id) REFERENCES careers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS saved_careers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    career_id INTEGER NOT NULL,
    notes TEXT,
    saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, career_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS roadmap_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    career_id INTEGER NOT NULL,
    stage_order INTEGER NOT NULL,
    is_completed INTEGER NOT NULL DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, career_id, stage_order),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------------------
-- EXTENDED PROFILE & RESUME TABLES (Strict Multi-Tenant Isolation)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS profile_skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    skill_name TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    proficiency_level TEXT DEFAULT 'intermediate' CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced')),
    source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'assessment', 'cv')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, skill_name),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS profile_education (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    institution TEXT NOT NULL,
    degree TEXT NOT NULL,
    major TEXT NOT NULL,
    academic_year TEXT,
    graduation_year TEXT,
    academic_status TEXT DEFAULT 'enrolled',
    coursework TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS profile_experience (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    organization TEXT NOT NULL,
    role TEXT NOT NULL,
    start_date TEXT,
    end_date TEXT,
    description TEXT,
    technologies TEXT,
    experience_level TEXT DEFAULT 'Entry',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS profile_projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    technologies TEXT,
    role TEXT,
    project_url TEXT,
    github_url TEXT,
    demo_url TEXT,
    difficulty TEXT DEFAULT 'intermediate',
    completion_status TEXT DEFAULT 'completed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS profile_certifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    issuer TEXT NOT NULL,
    issue_date TEXT,
    credential_id TEXT,
    verification_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS profile_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    target_roles TEXT,
    preferred_domains TEXT,
    target_tech TEXT,
    career_interests TEXT,
    short_term_goal TEXT,
    long_term_goal TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS profile_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    github_url TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    website_url TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS resumes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    original_filename TEXT NOT NULL,
    stored_filename TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active INTEGER NOT NULL DEFAULT 1,
    version INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS resume_extractions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    resume_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    raw_text TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'parsed', 'reviewed', 'failed')),
    extracted_json TEXT NOT NULL,
    reviewed_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    reviewed_at DATETIME,
    FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------------------
-- INDEXES FOR SUB-MILLISECOND PERFORMANCE
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_careers_slug ON careers(slug);
CREATE INDEX IF NOT EXISTS idx_careers_active ON careers(active);
CREATE INDEX IF NOT EXISTS idx_skills_name ON skills(name);
CREATE INDEX IF NOT EXISTS idx_interests_name ON interests(name);
CREATE INDEX IF NOT EXISTS idx_career_skills_cid ON career_skills(career_id);
CREATE INDEX IF NOT EXISTS idx_career_interests_cid ON career_interests(career_id);
CREATE INDEX IF NOT EXISTS idx_resources_cid ON resources(career_id);
CREATE INDEX IF NOT EXISTS idx_career_roadmaps_cid ON career_roadmaps(career_id);
CREATE INDEX IF NOT EXISTS idx_career_projects_cid ON career_projects(career_id);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_assessments_uid ON user_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_recommendations_uid ON user_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_careers_uid ON saved_careers(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_progress_uid ON roadmap_progress(user_id);

CREATE INDEX IF NOT EXISTS idx_profile_skills_uid ON profile_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_edu_uid ON profile_education(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_exp_uid ON profile_experience(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_proj_uid ON profile_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_cert_uid ON profile_certifications(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_goals_uid ON profile_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_links_uid ON profile_links(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_uid ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_active ON resumes(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_resume_extractions_uid ON resume_extractions(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_extractions_rid ON resume_extractions(resume_id);
