import { getDatabase } from '../database/db.js';
import { 
  UserProfile, 
  Career,
  ProfileSkill,
  ProfileEducation,
  ProfileExperience,
  ProfileProject,
  ProfileCertification,
  ProfileGoals,
  ProfileLinks,
  ProfileCompletenessResult,
  FullProfile,
  ResumeRecord
} from '../types/index.js';
import { CareerService } from './career.service.js';

export class UserService {
  static getProfile(userId: number): UserProfile | null {
    const db = getDatabase();
    const row = db.prepare(`
      SELECT u.id as user_id, u.name, u.email, u.year, u.department, u.education, u.experience_level,
             p.id as profile_id, p.dream_career, p.bio, p.phone, p.location, p.updated_at
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE u.id = ?
    `).get(userId) as any;

    if (!row) return null;

    return {
      id: row.profile_id || 0,
      user_id: row.user_id,
      name: row.name,
      email: row.email,
      year: row.year || '',
      department: row.department || '',
      education: row.education || row.year || '',
      experience_level: row.experience_level || '',
      dream_career: row.dream_career || '',
      bio: row.bio || '',
      phone: row.phone || '',
      location: row.location || '',
      updated_at: row.updated_at || new Date().toISOString()
    };
  }

  static updateProfile(
    userId: number,
    data: {
      name?: string;
      year?: string;
      department?: string;
      education?: string;
      experience_level?: string;
      dream_career?: string;
      bio?: string;
      phone?: string;
      location?: string;
    }
  ): UserProfile {
    const db = getDatabase();

    // Update users table
    if (
      data.name !== undefined ||
      data.year !== undefined ||
      data.department !== undefined ||
      data.education !== undefined ||
      data.experience_level !== undefined
    ) {
      const user = db.prepare('SELECT name, year, department, education, experience_level FROM users WHERE id = ?').get(userId) as any;
      if (!user) throw new Error('User not found.');

      const newName = data.name !== undefined ? data.name.trim() : user.name;
      const newYear = data.year !== undefined ? data.year.trim() : user.year;
      const newDept = data.department !== undefined ? data.department.trim() : user.department;
      const newEdu = data.education !== undefined ? data.education.trim() : (user.education || '');
      const newExp = data.experience_level !== undefined ? data.experience_level.trim() : (user.experience_level || '');

      db.prepare(`
        UPDATE users
        SET name = ?, year = ?, department = ?, education = ?, experience_level = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(newName, newYear, newDept, newEdu, newExp, userId);
    }

    // Upsert profile
    const existingProfile = db.prepare('SELECT id, dream_career, bio, phone, location FROM profiles WHERE user_id = ?').get(userId) as any;

    const dream_career = data.dream_career !== undefined ? data.dream_career.trim() : (existingProfile?.dream_career || '');
    const bio = data.bio !== undefined ? data.bio.trim() : (existingProfile?.bio || '');
    const phone = data.phone !== undefined ? data.phone.trim() : (existingProfile?.phone || '');
    const location = data.location !== undefined ? data.location.trim() : (existingProfile?.location || '');

    if (existingProfile) {
      db.prepare(`
        UPDATE profiles
        SET dream_career = ?, bio = ?, phone = ?, location = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).run(dream_career, bio, phone, location, userId);
    } else {
      db.prepare(`
        INSERT INTO profiles (user_id, dream_career, bio, phone, location)
        VALUES (?, ?, ?, ?, ?)
      `).run(userId, dream_career, bio, phone, location);
    }

    return this.getProfile(userId)!;
  }

  // --------------------------------------------------------------------------
  // Extended Profile Methods (Strict Multi-Tenant Isolation)
  // --------------------------------------------------------------------------

  // Skills
  static getSkills(userId: number): ProfileSkill[] {
    const db = getDatabase();
    return db.prepare(`
      SELECT id, user_id, skill_name, category, proficiency_level, source, created_at
      FROM profile_skills
      WHERE user_id = ?
      ORDER BY skill_name ASC
    `).all(userId) as unknown as ProfileSkill[];
  }

  static addSkill(userId: number, skillName: string, proficiency: string = 'intermediate', category: string = 'General', source: string = 'manual'): ProfileSkill {
    const db = getDatabase();
    const profLower = proficiency ? proficiency.toLowerCase().trim() : 'intermediate';
    if (!['beginner', 'intermediate', 'advanced'].includes(profLower)) {
      throw new Error('Invalid proficiency level. Allowed values: beginner, intermediate, advanced.');
    }
    const sourceLower = source ? source.toLowerCase().trim() : 'manual';
    if (!['manual', 'assessment', 'cv'].includes(sourceLower)) {
      throw new Error('Invalid source. Allowed values: manual, assessment, cv.');
    }
    const profNormalized = profLower;
    const sourceNormalized = sourceLower;

    db.prepare(`
      INSERT INTO profile_skills (user_id, skill_name, category, proficiency_level, source)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(user_id, skill_name) DO UPDATE SET
        proficiency_level = excluded.proficiency_level,
        category = excluded.category,
        source = excluded.source
    `).run(userId, skillName.trim(), category, profNormalized, sourceNormalized);

    return db.prepare(`
      SELECT id, user_id, skill_name, category, proficiency_level, source, created_at
      FROM profile_skills
      WHERE user_id = ? AND skill_name = ?
    `).get(userId, skillName.trim()) as unknown as ProfileSkill;
  }

  static deleteSkill(userId: number, skillIdOrName: number | string): boolean {
    const db = getDatabase();
    let res;
    if (typeof skillIdOrName === 'number') {
      res = db.prepare('DELETE FROM profile_skills WHERE id = ? AND user_id = ?').run(skillIdOrName, userId);
    } else {
      res = db.prepare('DELETE FROM profile_skills WHERE skill_name = ? AND user_id = ?').run(skillIdOrName, userId);
    }
    return res.changes > 0;
  }

  // Education
  static getEducation(userId: number): ProfileEducation[] {
    const db = getDatabase();
    return db.prepare(`
      SELECT id, user_id, institution, degree, major, academic_year, graduation_year, academic_status, coursework, created_at
      FROM profile_education
      WHERE user_id = ?
      ORDER BY id DESC
    `).all(userId) as unknown as ProfileEducation[];
  }

  static addEducation(userId: number, data: Partial<ProfileEducation>): ProfileEducation {
    const db = getDatabase();
    db.prepare(`
      INSERT INTO profile_education (user_id, institution, degree, major, academic_year, graduation_year, academic_status, coursework)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      String(data.institution || '').trim(),
      String(data.degree || '').trim(),
      String(data.major || '').trim(),
      String(data.academic_year || '').trim(),
      String(data.graduation_year || '').trim(),
      String(data.academic_status || 'enrolled').trim(),
      String(data.coursework || '').trim()
    );

    const row = db.prepare('SELECT last_insert_rowid() as id').get() as { id: number };
    return db.prepare('SELECT * FROM profile_education WHERE id = ? AND user_id = ?').get(row.id, userId) as unknown as ProfileEducation;
  }

  static deleteEducation(userId: number, eduId: number): boolean {
    const db = getDatabase();
    const res = db.prepare('DELETE FROM profile_education WHERE id = ? AND user_id = ?').run(eduId, userId);
    return res.changes > 0;
  }

  // Experience
  static getExperience(userId: number): ProfileExperience[] {
    const db = getDatabase();
    return db.prepare(`
      SELECT id, user_id, organization, role, start_date, end_date, description, technologies, experience_level, created_at
      FROM profile_experience
      WHERE user_id = ?
      ORDER BY id DESC
    `).all(userId) as unknown as ProfileExperience[];
  }

  static addExperience(userId: number, data: Partial<ProfileExperience>): ProfileExperience {
    const db = getDatabase();
    db.prepare(`
      INSERT INTO profile_experience (user_id, organization, role, start_date, end_date, description, technologies, experience_level)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      String(data.organization || '').trim(),
      String(data.role || '').trim(),
      String(data.start_date || '').trim(),
      String(data.end_date || '').trim(),
      String(data.description || '').trim(),
      String(data.technologies || '').trim(),
      String(data.experience_level || 'Entry').trim()
    );

    const row = db.prepare('SELECT last_insert_rowid() as id').get() as { id: number };
    return db.prepare('SELECT * FROM profile_experience WHERE id = ? AND user_id = ?').get(row.id, userId) as unknown as ProfileExperience;
  }

  static deleteExperience(userId: number, expId: number): boolean {
    const db = getDatabase();
    const res = db.prepare('DELETE FROM profile_experience WHERE id = ? AND user_id = ?').run(expId, userId);
    return res.changes > 0;
  }

  // Projects
  static getProjects(userId: number): ProfileProject[] {
    const db = getDatabase();
    return db.prepare(`
      SELECT id, user_id, name, description, technologies, role, project_url, github_url, demo_url, difficulty, completion_status, created_at
      FROM profile_projects
      WHERE user_id = ?
      ORDER BY id DESC
    `).all(userId) as unknown as ProfileProject[];
  }

  static addProject(userId: number, data: Partial<ProfileProject>): ProfileProject {
    const db = getDatabase();
    db.prepare(`
      INSERT INTO profile_projects (user_id, name, description, technologies, role, project_url, github_url, demo_url, difficulty, completion_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      String(data.name || '').trim(),
      String(data.description || '').trim(),
      String(data.technologies || '').trim(),
      String(data.role || '').trim(),
      String(data.project_url || '').trim(),
      String(data.github_url || '').trim(),
      String(data.demo_url || '').trim(),
      String(data.difficulty || 'intermediate').trim(),
      String(data.completion_status || 'completed').trim()
    );

    const row = db.prepare('SELECT last_insert_rowid() as id').get() as { id: number };
    return db.prepare('SELECT * FROM profile_projects WHERE id = ? AND user_id = ?').get(row.id, userId) as unknown as ProfileProject;
  }

  static deleteProject(userId: number, projId: number): boolean {
    const db = getDatabase();
    const res = db.prepare('DELETE FROM profile_projects WHERE id = ? AND user_id = ?').run(projId, userId);
    return res.changes > 0;
  }

  // Certifications
  static getCertifications(userId: number): ProfileCertification[] {
    const db = getDatabase();
    return db.prepare(`
      SELECT id, user_id, name, issuer, issue_date, credential_id, verification_url, created_at
      FROM profile_certifications
      WHERE user_id = ?
      ORDER BY id DESC
    `).all(userId) as unknown as ProfileCertification[];
  }

  static addCertification(userId: number, data: Partial<ProfileCertification>): ProfileCertification {
    const db = getDatabase();
    db.prepare(`
      INSERT INTO profile_certifications (user_id, name, issuer, issue_date, credential_id, verification_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      String(data.name || '').trim(),
      String(data.issuer || '').trim(),
      String(data.issue_date || '').trim(),
      String(data.credential_id || '').trim(),
      String(data.verification_url || '').trim()
    );

    const row = db.prepare('SELECT last_insert_rowid() as id').get() as { id: number };
    return db.prepare('SELECT * FROM profile_certifications WHERE id = ? AND user_id = ?').get(row.id, userId) as unknown as ProfileCertification;
  }

  static deleteCertification(userId: number, certId: number): boolean {
    const db = getDatabase();
    const res = db.prepare('DELETE FROM profile_certifications WHERE id = ? AND user_id = ?').run(certId, userId);
    return res.changes > 0;
  }

  // Goals
  static getGoals(userId: number): ProfileGoals | null {
    const db = getDatabase();
    return (db.prepare(`
      SELECT id, user_id, target_roles, preferred_domains, target_tech, career_interests, short_term_goal, long_term_goal, updated_at
      FROM profile_goals
      WHERE user_id = ?
    `).get(userId) as ProfileGoals) || null;
  }

  static updateGoals(userId: number, data: Partial<ProfileGoals>): ProfileGoals {
    const db = getDatabase();
    const existing = db.prepare('SELECT id FROM profile_goals WHERE user_id = ?').get(userId);
    if (existing) {
      db.prepare(`
        UPDATE profile_goals
        SET target_roles = ?, preferred_domains = ?, target_tech = ?, career_interests = ?,
            short_term_goal = ?, long_term_goal = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).run(
        data.target_roles !== undefined ? data.target_roles : '',
        data.preferred_domains !== undefined ? data.preferred_domains : '',
        data.target_tech !== undefined ? data.target_tech : '',
        data.career_interests !== undefined ? data.career_interests : '',
        data.short_term_goal !== undefined ? data.short_term_goal : '',
        data.long_term_goal !== undefined ? data.long_term_goal : '',
        userId
      );
    } else {
      db.prepare(`
        INSERT INTO profile_goals (user_id, target_roles, preferred_domains, target_tech, career_interests, short_term_goal, long_term_goal)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId,
        data.target_roles || '',
        data.preferred_domains || '',
        data.target_tech || '',
        data.career_interests || '',
        data.short_term_goal || '',
        data.long_term_goal || ''
      );
    }
    return this.getGoals(userId)!;
  }

  // Links
  static getLinks(userId: number): ProfileLinks | null {
    const db = getDatabase();
    return (db.prepare(`
      SELECT id, user_id, github_url, linkedin_url, portfolio_url, website_url, updated_at
      FROM profile_links
      WHERE user_id = ?
    `).get(userId) as ProfileLinks) || null;
  }

  static updateLinks(userId: number, data: Partial<ProfileLinks>): ProfileLinks {
    const db = getDatabase();
    const existing = db.prepare('SELECT id FROM profile_links WHERE user_id = ?').get(userId);
    if (existing) {
      db.prepare(`
        UPDATE profile_links
        SET github_url = ?, linkedin_url = ?, portfolio_url = ?, website_url = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).run(
        data.github_url !== undefined ? data.github_url : '',
        data.linkedin_url !== undefined ? data.linkedin_url : '',
        data.portfolio_url !== undefined ? data.portfolio_url : '',
        data.website_url !== undefined ? data.website_url : '',
        userId
      );
    } else {
      db.prepare(`
        INSERT INTO profile_links (user_id, github_url, linkedin_url, portfolio_url, website_url)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        userId,
        data.github_url || '',
        data.linkedin_url || '',
        data.portfolio_url || '',
        data.website_url || ''
      );
    }
    return this.getLinks(userId)!;
  }

  // --------------------------------------------------------------------------
  // Profile Completeness Engine (12 Objective Criteria)
  // --------------------------------------------------------------------------
  static getProfileCompleteness(userId: number): ProfileCompletenessResult {
    const db = getDatabase();
    const profile = this.getProfile(userId);
    const skills = this.getSkills(userId);
    const education = this.getEducation(userId);
    const experience = this.getExperience(userId);
    const projects = this.getProjects(userId);
    const certifications = this.getCertifications(userId);
    const activeResume = db.prepare(`
      SELECT id FROM resumes WHERE user_id = ? AND is_active = 1 LIMIT 1
    `).get(userId);

    const hasSkills = skills.length >= 3;
    const hasEducation = education.length > 0 || !!profile?.education;
    const hasExperience = experience.length > 0 || (!!profile?.experience_level && profile.experience_level !== 'Beginner');
    const hasProjects = projects.length > 0;
    const hasCertOrExp = certifications.length > 0 || experience.length > 0;
    const hasResume = !!activeResume;

    const criteria = [
      { key: 'name', label: 'Full Name', weight: 10, filled: !!profile?.name?.trim() },
      { key: 'email', label: 'Verified Email', weight: 10, filled: !!profile?.email?.trim() },
      { key: 'degree', label: 'Degree / Program', weight: 10, filled: !!profile?.education?.trim() || hasEducation },
      { key: 'major', label: 'Department / Major', weight: 10, filled: !!profile?.department?.trim() },
      { key: 'year', label: 'Academic Year', weight: 5, filled: !!profile?.year?.trim() },
      { key: 'experience_level', label: 'Experience Baseline', weight: 10, filled: !!profile?.experience_level?.trim() },
      { key: 'skills', label: 'Technical Skills (3+)', weight: 15, filled: hasSkills },
      { key: 'target_career', label: 'Target Career Ambition', weight: 10, filled: !!profile?.dream_career?.trim() },
      { key: 'bio', label: 'Bio / Professional Summary', weight: 5, filled: !!profile?.bio?.trim() },
      { key: 'projects', label: 'Portfolio Projects (1+)', weight: 5, filled: hasProjects },
      { key: 'certifications', label: 'Certifications or Experience', weight: 5, filled: hasCertOrExp },
      { key: 'resume', label: 'Active CV / Resume Uploaded', weight: 5, filled: hasResume }
    ];

    const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
    const earnedWeight = criteria.reduce((sum, c) => c.filled ? sum + c.weight : sum, 0);
    const score = Math.round((earnedWeight / totalWeight) * 100);
    const completedCount = criteria.filter(c => c.filled).length;

    let nextAction = 'Your profile is comprehensively documented.';
    if (!hasSkills) {
      nextAction = 'Add at least 3 technical skills to showcase your engineering capabilities.';
    } else if (!hasResume) {
      nextAction = 'Upload your CV / Resume for automated skill extraction and profile completion.';
    } else if (!profile?.dream_career?.trim()) {
      nextAction = 'Specify your dream career or target role to calibrate your recommendations.';
    } else if (!hasProjects) {
      nextAction = 'Add a portfolio project with GitHub link to demonstrate practical ability.';
    } else if (!hasCertOrExp) {
      nextAction = 'Add an internship or verified industry certification to strengthen your profile.';
    }

    return {
      score,
      criteria,
      completed_count: completedCount,
      total_count: criteria.length,
      next_recommended_action: nextAction
    };
  }

  // --------------------------------------------------------------------------
  // Full Profile Aggregator
  // --------------------------------------------------------------------------
  static getFullProfile(userId: number): FullProfile | null {
    const basic = this.getProfile(userId);
    if (!basic) return null;

    const db = getDatabase();
    const completeness = this.getProfileCompleteness(userId);
    const skills = this.getSkills(userId);
    const education = this.getEducation(userId);
    const experience = this.getExperience(userId);
    const projects = this.getProjects(userId);
    const certifications = this.getCertifications(userId);
    const goals = this.getGoals(userId);
    const links = this.getLinks(userId);
    const activeResume = (db.prepare(`
      SELECT id, user_id, original_filename, stored_filename, mime_type, file_size, file_path, upload_date, is_active, version
      FROM resumes WHERE user_id = ? AND is_active = 1 ORDER BY id DESC LIMIT 1
    `).get(userId) as unknown as ResumeRecord) || null;

    return {
      basic,
      completeness,
      skills,
      education,
      experience,
      projects,
      certifications,
      goals,
      links,
      active_resume: activeResume
    };
  }

  // --------------------------------------------------------------------------
  // Saved Careers (Strict User Isolation)
  // --------------------------------------------------------------------------
  static getSavedCareers(userId: number): Array<Career & { career_id: number; career_title: string; career_category: string; career_description: string; saved_at: string; created_at: string; notes: string }> {
    const db = getDatabase();
    const rows = db.prepare(`
      SELECT sc.career_id, sc.notes, sc.saved_at
      FROM saved_careers sc
      WHERE sc.user_id = ?
      ORDER BY sc.saved_at DESC
    `).all(userId) as Array<{ career_id: number; notes: string; saved_at: string }>;

    const result: Array<Career & { career_id: number; career_title: string; career_category: string; career_description: string; saved_at: string; created_at: string; notes: string }> = [];
    for (const r of rows) {
      const career = CareerService.getCareerBySlugOrId(r.career_id);
      if (career) {
        result.push({
          ...career,
          id: r.career_id,
          career_id: r.career_id,
          career_title: career.title,
          career_category: career.category,
          career_description: career.description,
          notes: r.notes || '',
          saved_at: r.saved_at,
          created_at: r.saved_at
        });
      }
    }

    return result;
  }

  static saveCareer(userId: number, careerId: number, notes: string = ''): boolean {
    const db = getDatabase();
    // Validate career exists
    const career = db.prepare('SELECT id FROM careers WHERE id = ?').get(careerId);
    if (!career) {
      throw new Error('Career does not exist.');
    }

    db.prepare(`
      INSERT INTO saved_careers (user_id, career_id, notes)
      VALUES (?, ?, ?)
      ON CONFLICT(user_id, career_id) DO UPDATE SET
        notes = excluded.notes,
        saved_at = CURRENT_TIMESTAMP
    `).run(userId, careerId, notes);

    return true;
  }

  static unsaveCareer(userId: number, careerId: number): boolean {
    const db = getDatabase();
    const result = db.prepare(`
      DELETE FROM saved_careers
      WHERE user_id = ? AND career_id = ?
    `).run(userId, careerId);

    return result.changes > 0;
  }

  static isCareerSaved(userId: number, careerId: number): boolean {
    const db = getDatabase();
    const row = db.prepare(`
      SELECT 1 FROM saved_careers WHERE user_id = ? AND career_id = ?
    `).get(userId, careerId);
    return !!row;
  }

  // --------------------------------------------------------------------------
  // Assessment & Recommendation History
  // --------------------------------------------------------------------------
  static recordRecommendation(
    userId: number,
    assessmentData: any,
    recommendationResult: any
  ): number {
    const db = getDatabase();

    // 1. Save assessment record
    const insertAssessment = db.prepare(`
      INSERT INTO user_assessments (user_id, name, year, department, education, skills_json, interest, experience, dream_career)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const skillsStr = JSON.stringify(assessmentData.skills || []);
    insertAssessment.run(
      userId,
      assessmentData.name || 'Student',
      assessmentData.year || '',
      assessmentData.department || '',
      assessmentData.education || '',
      skillsStr,
      assessmentData.interest || '',
      assessmentData.experience || '',
      assessmentData.dream_career || ''
    );

    const assessmentId = db.prepare('SELECT last_insert_rowid() as id').get() as { id: number };

    // 2. Save recommendation record
    const primary = recommendationResult.primary_recommendation;
    const insertRec = db.prepare(`
      INSERT INTO user_recommendations (user_id, assessment_id, primary_career_id, primary_career_title, match_score, breakdown_json)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertRec.run(
      userId,
      assessmentId.id,
      primary.id,
      primary.title,
      primary.match_score,
      JSON.stringify(recommendationResult)
    );

    const recId = db.prepare('SELECT last_insert_rowid() as id').get() as { id: number };
    return recId.id;
  }

  static getRecommendationHistory(userId: number): any[] {
    const db = getDatabase();
    const rows = db.prepare(`
      SELECT ur.id, ur.assessment_id, ur.primary_career_id, ur.primary_career_title, ur.match_score,
             ur.breakdown_json, ur.created_at,
             ua.name as student_name, ua.year, ua.department, ua.education, ua.skills_json, ua.interest, ua.experience, ua.dream_career
      FROM user_recommendations ur
      LEFT JOIN user_assessments ua ON ur.assessment_id = ua.id
      WHERE ur.user_id = ?
      ORDER BY ur.created_at DESC
    `).all(userId) as any[];

    return rows.map(r => {
      let parsed: any = {};
      try {
        parsed = JSON.parse(r.breakdown_json);
      } catch {}

      const primary = parsed.primary_recommendation;
      const alternatives = parsed.alternative_recommendations || [];
      const allRecs = primary ? [primary, ...alternatives] : (parsed.recommendations || []);

      let userSkills: string[] = [];
      if (r.skills_json) {
        try {
          userSkills = JSON.parse(r.skills_json);
        } catch {}
      } else if (parsed.submitted_profile?.skills) {
        userSkills = parsed.submitted_profile.skills;
      }

      let userInterests: string[] = [];
      if (r.interest) {
        userInterests = r.interest.split(',').map((s: string) => s.trim()).filter(Boolean);
      } else if (parsed.submitted_profile?.interests) {
        userInterests = parsed.submitted_profile.interests;
      } else if (parsed.submitted_profile?.interest) {
        userInterests = [parsed.submitted_profile.interest];
      }

      return {
        id: r.id,
        assessment_id: r.assessment_id,
        primary_career_id: r.primary_career_id,
        primary_career_title: r.primary_career_title,
        match_score: r.match_score,
        created_at: r.created_at,
        education: r.education || parsed.submitted_profile?.education || '',
        experience_level: r.experience || parsed.submitted_profile?.experience_level || parsed.submitted_profile?.experience || '',
        skills: userSkills,
        interests: userInterests,
        dream_career: r.dream_career || parsed.submitted_profile?.dream_career || '',
        recommendations: allRecs,
        primary_recommendation: primary,
        alternative_recommendations: alternatives,
        details: parsed
      };
    });
  }

  static getLatestRecommendation(userId: number): any | null {
    const history = this.getRecommendationHistory(userId);
    return history.length > 0 ? history[0] : null;
  }

  // --------------------------------------------------------------------------
  // Roadmap Progress (Strict User Isolation)
  // --------------------------------------------------------------------------
  static getRoadmapProgress(userId: number, careerId: number): Array<{ stage_order: number; is_completed: boolean }> {
    const db = getDatabase();
    const rows = db.prepare(`
      SELECT stage_order, is_completed
      FROM roadmap_progress
      WHERE user_id = ? AND career_id = ?
    `).all(userId, careerId) as Array<{ stage_order: number; is_completed: number }>;

    return rows.map(r => ({
      stage_order: r.stage_order,
      is_completed: r.is_completed === 1
    }));
  }

  static updateRoadmapProgress(
    userId: number,
    careerId: number,
    stageOrder: number,
    isCompleted: boolean
  ): boolean {
    const db = getDatabase();
    db.prepare(`
      INSERT INTO roadmap_progress (user_id, career_id, stage_order, is_completed)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id, career_id, stage_order) DO UPDATE SET
        is_completed = excluded.is_completed,
        updated_at = CURRENT_TIMESTAMP
    `).run(userId, careerId, stageOrder, isCompleted ? 1 : 0);

    return true;
  }
}
