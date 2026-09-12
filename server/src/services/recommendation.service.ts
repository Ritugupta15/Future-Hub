import { getDatabase } from '../database/db.js';
import {
  AssessmentPayload,
  CareerRecommendation,
  RecommendationResponse,
  SkillChecklistItem,
  Resource,
  RoadmapStage,
  ProjectIdea
} from '../types/index.js';

const SKILL_ALIASES: Record<string, string> = {
  'py': 'Python',
  'python3': 'Python',
  'js': 'JavaScript',
  'javascript': 'JavaScript',
  'ts': 'TypeScript',
  'typescript': 'TypeScript',
  'html5': 'HTML',
  'html': 'HTML',
  'css3': 'CSS',
  'css': 'CSS',
  'postgres': 'SQL',
  'postgresql': 'SQL',
  'mysql': 'SQL',
  'sqlite': 'SQL',
  'sql': 'SQL',
  'ml': 'Machine Learning',
  'machine learning': 'Machine Learning',
  'dl': 'Deep Learning',
  'deep learning': 'Deep Learning',
  'nlp': 'Machine Learning',
  'powerbi': 'Power BI',
  'power bi': 'Power BI',
  'excel': 'Excel',
  'ms excel': 'Excel',
  'microsoftexcel': 'Excel',
  'git': 'Git',
  'github': 'Git',
  'docker': 'Docker',
  'containers': 'Docker',
  'linux': 'Linux',
  'ubuntu': 'Linux',
  'bash': 'Linux',
  'security': 'Cyber Security Fundamentals',
  'cybersecurity': 'Cyber Security Fundamentals',
  'cyber security': 'Cyber Security Fundamentals',
  'network': 'Networking',
  'networks': 'Networking',
  'networking': 'Networking',
  'pandas': 'Pandas',
  'numpy': 'Python',
  'stats': 'Statistics',
  'statistics': 'Statistics',
  'tableau': 'Tableau',
  'rest': 'REST APIs',
  'rest api': 'REST APIs',
  'restful': 'REST APIs',
  'api': 'REST APIs',
  'cloud': 'Cloud Fundamentals',
  'aws': 'Cloud Fundamentals',
  'azure': 'Cloud Fundamentals',
  'gcp': 'Cloud Fundamentals',
  'testing': 'Software Testing Fundamentals',
  'qa': 'Software Testing Fundamentals',
  'mobile': 'Mobile UI Design',
  'android': 'Mobile UI Design',
  'ios': 'Mobile UI Design',
  'flutter': 'Mobile UI Design',
  'react native': 'Mobile UI Design'
};

const WEIGHT_SKILLS = 0.45;
const WEIGHT_INTEREST = 0.30;
const WEIGHT_EDUCATION = 0.15;
const WEIGHT_EXPERIENCE = 0.10;

export class RecommendationService {
  static normalizeSkillName(skill: string): string {
    if (!skill || typeof skill !== 'string') return '';
    const cleaned = skill.trim();
    const lower = cleaned.toLowerCase();
    return SKILL_ALIASES[lower] || cleaned;
  }

  static normalizeUserSkills(rawSkills: string[] | string): string[] {
    let list: string[] = [];
    if (typeof rawSkills === 'string') {
      list = rawSkills.split(',').map(s => s.trim()).filter(Boolean);
    } else if (Array.isArray(rawSkills)) {
      list = rawSkills.map(s => (typeof s === 'string' ? s.trim() : '')).filter(Boolean);
    }

    const seen = new Set<string>();
    const normalized: string[] = [];

    for (const s of list) {
      const canonical = this.normalizeSkillName(s);
      if (canonical && !seen.has(canonical.toLowerCase())) {
        seen.add(canonical.toLowerCase());
        normalized.push(canonical);
      }
    }

    return normalized;
  }

  static computeSkillScore(
    userSkills: string[],
    requiredSkills: string[],
    preferredSkills: string[]
  ): {
    score: number;
    matchedSkills: string[];
    missingSkills: string[];
    matchedRequired: string[];
    matchedPreferred: string[];
  } {
    const userSet = new Set(userSkills.map(s => s.toLowerCase()));

    const matchedReq = requiredSkills.filter(s => userSet.has(s.toLowerCase()));
    const missingReq = requiredSkills.filter(s => !userSet.has(s.toLowerCase()));
    const matchedPref = preferredSkills.filter(s => userSet.has(s.toLowerCase()));
    const missingPref = preferredSkills.filter(s => !userSet.has(s.toLowerCase()));

    const reqScore = requiredSkills.length > 0 ? (matchedReq.length / requiredSkills.length) * 75.0 : 75.0;
    const prefScore = preferredSkills.length > 0 ? (matchedPref.length / preferredSkills.length) * 25.0 : 25.0;

    const totalSkillScore = Math.min(100.0, reqScore + prefScore);

    return {
      score: totalSkillScore,
      matchedSkills: [...matchedReq, ...matchedPref],
      missingSkills: [...missingReq, ...missingPref],
      matchedRequired: matchedReq,
      matchedPreferred: matchedPref
    };
  }

  static computeInterestScore(userInterest: string | string[], careerInterests: string[]): number {
    if (!userInterest) return 50.0;
    const userList: string[] = Array.isArray(userInterest)
      ? userInterest
      : userInterest.split(',').map(s => s.trim()).filter(Boolean);

    if (userList.length === 0) return 50.0;

    // Domain affinity mapping
    const relatedMap: Record<string, string[]> = {
      'data science': ['data & analytics', 'artificial intelligence', 'machine learning'],
      'data & analytics': ['data science', 'artificial intelligence', 'machine learning'],
      'web development': ['software development', 'ui/ux design', 'mobile development', 'full stack'],
      'software development': ['web development', 'cloud computing', 'data & analytics'],
      'artificial intelligence': ['data science', 'data & analytics', 'software development', 'machine learning'],
      'machine learning': ['data science', 'data & analytics', 'artificial intelligence'],
      'cyber security': ['infrastructure & networks', 'cloud computing', 'security'],
      'cloud computing': ['infrastructure & networks', 'software development', 'devops'],
      'mobile development': ['web development', 'software development', 'ui/ux design']
    };

    let bestScore = 15.0; // Unrelated baseline = 15%

    for (const item of userList) {
      const uInt = item.toLowerCase();
      let currentItemScore = 15.0;

      for (const cInt of careerInterests) {
        const cLower = cInt.toLowerCase();
        if (uInt === cLower || uInt.includes(cLower) || cLower.includes(uInt)) {
          currentItemScore = Math.max(currentItemScore, 100.0);
        }
      }

      const related = relatedMap[uInt] || [];
      for (const rel of related) {
        for (const cInt of careerInterests) {
          if (rel === cInt.toLowerCase() || cInt.toLowerCase().includes(rel) || rel.includes(cInt.toLowerCase())) {
            currentItemScore = Math.max(currentItemScore, 60.0);
          }
        }
      }

      bestScore = Math.max(bestScore, currentItemScore);
      if (bestScore >= 100.0) break;
    }

    return bestScore;
  }

  static computeEducationScore(userEdu: string, careerEduReq: string): number {
    if (!userEdu) return 70.0;
    const u = userEdu.toLowerCase();
    const c = careerEduReq.toLowerCase();

    // High degree matches
    const csTerms = ['computer science', 'cs', 'bca', 'b.tech', 'btech', 'mca', 'it', 'information technology', 'tycs', 'sycs', 'fycs'];
    const matchesUser = csTerms.some(term => u.includes(term));
    const matchesCareer = csTerms.some(term => c.includes(term));

    if (matchesUser && matchesCareer) return 95.0;
    if (matchesUser || matchesCareer) return 80.0;
    return 65.0;
  }

  static computeExperienceScore(userExp: string, minExpReq: string): number {
    const u = (userExp || 'Beginner').toLowerCase();
    const m = (minExpReq || 'Beginner').toLowerCase();

    if (m.includes('beginner')) return 100.0;
    if (u.includes('1–2') || u.includes('1-2') || u.includes('mid') || u.includes('2+') || u.includes('3+')) return 100.0;
    return 75.0; // Beginner applying to 1-2 years role
  }

  static evaluate(payload: AssessmentPayload): RecommendationResponse {
    const db = getDatabase();

    // Normalization of incoming fields
    const userName = (payload.name || 'Student').trim();
    const userYear = (payload.year || 'TYCS').trim();
    const userDept = (payload.department || 'Computer Science').trim();
    const userEdu = payload.education ? payload.education.trim() : `${userYear} ${userDept}`.trim();
    const rawInterest = payload.interest || (Array.isArray(payload.interests) ? payload.interests.join(', ') : payload.interests) || 'Data Science';
    const userInterest = String(rawInterest).trim();
    const rawExp = payload.experience || payload.experience_level;
    const userExp = rawExp ? String(rawExp).trim() : (userYear.toUpperCase().includes('TY') ? '1–2 Years' : 'Beginner');
    const userDream = (payload.dream_career || '').trim();

    const userSkills = this.normalizeUserSkills(payload.skills);
    const userSkillsLower = new Set(userSkills.map(s => s.toLowerCase()));

    // Fetch all active careers
    const careerRows = db.prepare(`
      SELECT id, slug, title, category, description, education_level, min_experience,
             career_overview, day_to_day, salary_range
      FROM careers
      WHERE active = 1
      ORDER BY id ASC
    `).all() as any[];

    // Fetch skill associations
    const careerSkillsRows = db.prepare(`
      SELECT cs.career_id, s.name, cs.importance
      FROM career_skills cs
      JOIN skills s ON cs.skill_id = s.id
    `).all() as any[];

    // Fetch interest associations
    const careerInterestRows = db.prepare(`
      SELECT ci.career_id, i.name
      FROM career_interests ci
      JOIN interests i ON ci.interest_id = i.id
    `).all() as any[];

    // Fetch resources
    const resourceRows = db.prepare(`
      SELECT id, career_id, title, resource_type, platform, url
      FROM resources
    `).all() as any[];

    // Fetch roadmaps
    const roadmapRows = db.prepare(`
      SELECT career_id, stage_order, period, focus, description
      FROM career_roadmaps
      ORDER BY stage_order ASC
    `).all() as any[];

    // Fetch projects
    const projectRows = db.prepare(`
      SELECT career_id, project_order, title, description, difficulty, skills_practiced
      FROM career_projects
      ORDER BY project_order ASC
    `).all() as any[];

    // Map relations by career_id
    const skillsByCareer: Record<number, { required: string[]; preferred: string[] }> = {};
    for (const row of careerSkillsRows) {
      if (!skillsByCareer[row.career_id]) {
        skillsByCareer[row.career_id] = { required: [], preferred: [] };
      }
      if (row.importance === 'required') {
        skillsByCareer[row.career_id].required.push(row.name);
      } else {
        skillsByCareer[row.career_id].preferred.push(row.name);
      }
    }

    const interestsByCareer: Record<number, string[]> = {};
    for (const row of careerInterestRows) {
      if (!interestsByCareer[row.career_id]) {
        interestsByCareer[row.career_id] = [];
      }
      interestsByCareer[row.career_id].push(row.name);
    }

    const resourcesByCareer: Record<number, Resource[]> = {};
    for (const row of resourceRows) {
      if (!resourcesByCareer[row.career_id]) {
        resourcesByCareer[row.career_id] = [];
      }
      resourcesByCareer[row.career_id].push(row);
    }

    const roadmapsByCareer: Record<number, Array<{ period: string; focus: string; description?: string }>> = {};
    for (const row of roadmapRows) {
      if (!roadmapsByCareer[row.career_id]) {
        roadmapsByCareer[row.career_id] = [];
      }
      roadmapsByCareer[row.career_id].push({
        period: row.period,
        focus: row.focus,
        description: row.description
      });
    }

    const projectsByCareer: Record<number, string[]> = {};
    for (const row of projectRows) {
      if (!projectsByCareer[row.career_id]) {
        projectsByCareer[row.career_id] = [];
      }
      projectsByCareer[row.career_id].push(row.title);
    }

    const scoredCareers: Array<{
      career: CareerRecommendation;
      sortKey: [number, number, number, number, number];
    }> = [];

    for (const c of careerRows) {
      const skillsData = skillsByCareer[c.id] || { required: [], preferred: [] };
      const cInterests = interestsByCareer[c.id] || [];
      const cResources = resourcesByCareer[c.id] || [];
      const cRoadmap = roadmapsByCareer[c.id] || [
        { period: 'Month 1-2', focus: 'Foundational Concepts, Syntax & Core Theory' },
        { period: 'Month 3-4', focus: 'Practical Tooling, Data Structures & Development Environment' },
        { period: 'Month 5-6', focus: 'Intermediate Frameworks, APIs & Version Control' },
        { period: 'Month 7-8', focus: 'Specialized Domain Techniques & Security Best Practices' },
        { period: 'Month 9+', focus: 'End-to-End Capstone Project & Internship Preparation' }
      ];
      const cProjects = projectsByCareer[c.id] || [
        'Domain-Specific Analytical Dashboard',
        'Automated Workflow & Task Processing Tool',
        'Interactive Management System with SQLite Persistence',
        'RESTful API Service with Comprehensive Unit Tests',
        'Open-Source Contribution or Capstone Showcase Project'
      ];

      const { score: skillScore, matchedSkills, missingSkills, matchedRequired } = this.computeSkillScore(
        userSkills,
        skillsData.required,
        skillsData.preferred
      );

      const interestScore = this.computeInterestScore(userInterest, cInterests);
      const eduScore = this.computeEducationScore(userEdu, c.education_level);
      const expScore = this.computeExperienceScore(userExp, c.min_experience);

      // Weighted combination
      let rawScore =
        skillScore * WEIGHT_SKILLS +
        interestScore * WEIGHT_INTEREST +
        eduScore * WEIGHT_EDUCATION +
        expScore * WEIGHT_EXPERIENCE;

      // Optional Dream Career alignment
      let isDreamMatch = false;
      if (userDream) {
        const dLower = userDream.toLowerCase();
        const tLower = c.title.toLowerCase();
        const sLower = c.slug.toLowerCase();
        if (tLower === dLower || sLower === dLower || tLower.includes(dLower) || dLower.includes(tLower)) {
          isDreamMatch = true;
          // Apply slight alignment boost (up to 5 points) without distorting skills reality
          rawScore = Math.min(100.0, rawScore + 4.0);
        }
      }

      const scoreInt = Math.max(0, Math.min(100, Math.round(rawScore)));

      // Explainable text generation
      const reqCount = skillsData.required.length;
      const matchedReqCount = matchedRequired.length;
      let reason = '';

      if (matchedReqCount === reqCount && reqCount > 0) {
        reason = `Outstanding match! You have mastered all ${reqCount} core required skills (${matchedRequired.join(', ')}), and your background in ${userInterest} aligns with this role.`;
      } else if (matchedReqCount > 0) {
        const missingReq = skillsData.required.filter(s => !userSkillsLower.has(s.toLowerCase()));
        reason = `Strong foundation! You possess ${matchedReqCount} of ${reqCount} required skills (${matchedRequired.join(', ')}). Prioritize learning ${missingReq.join(', ')} to become placement-ready.`;
      } else {
        reason = `High-potential growth role matching your interest in ${userInterest}. You will need to build competencies in ${skillsData.required.slice(0, 3).join(', ')}.`;
      }

      if (isDreamMatch) {
        reason = `[Your Dream Goal] ${reason}`;
      }

      // Checkable skills checklist
      const skillsChecklist: SkillChecklistItem[] = [];
      for (const s of [...skillsData.required, ...skillsData.preferred]) {
        skillsChecklist.push({
          name: s,
          status: userSkillsLower.has(s.toLowerCase()) ? 'mastered' : 'to_learn',
          is_required: skillsData.required.includes(s)
        });
      }

      const recommendationItem: CareerRecommendation = {
        id: c.id,
        slug: c.slug,
        title: c.title,
        category: c.category,
        description: c.description,
        match_score: scoreInt,
        skill_match_score: Math.round(skillScore * 10) / 10,
        interest_match_score: Math.round(interestScore * 10) / 10,
        education_match_score: Math.round(eduScore * 10) / 10,
        experience_match_score: Math.round(expScore * 10) / 10,
        score_breakdown: {
          skills_score: Math.round(skillScore * 10) / 10,
          interest_score: Math.round(interestScore * 10) / 10,
          education_score: Math.round(eduScore * 10) / 10,
          experience_score: Math.round(expScore * 10) / 10
        },
        reason,
        next_action: missingSkills.length > 0
          ? `Master ${missingSkills[0]} to bridge your primary technical skill gap.`
          : `Begin Stage 1 of the ${c.title} roadmap and build the foundational capstone project.`,
        matched_skills: matchedSkills,
        missing_skills: missingSkills,
        required_skills: skillsData.required,
        preferred_skills: skillsData.preferred,
        skills_checklist: skillsChecklist,
        roadmap: cRoadmap,
        project_ideas: cProjects,
        career_overview: c.career_overview,
        day_to_day: c.day_to_day,
        salary_range: c.salary_range,
        resources: cResources
      };

      const sortKey: [number, number, number, number, number] = [
        scoreInt,
        Math.round(skillScore * 100),
        Math.round(interestScore * 100),
        Math.round(eduScore * 100),
        Math.round(expScore * 100)
      ];

      scoredCareers.push({ career: recommendationItem, sortKey });
    }

    // Deterministic sorting (Tie-break: Skills -> Interests -> Education -> Experience -> alphabetical title)
    scoredCareers.sort((a, b) => {
      for (let i = 0; i < 5; i++) {
        if (a.sortKey[i] !== b.sortKey[i]) {
          return b.sortKey[i] - a.sortKey[i];
        }
      }
      return a.career.title.localeCompare(b.career.title);
    });

    const primary = scoredCareers[0].career;
    const alternatives = scoredCareers.slice(1, 3).map(s => s.career);

    return {
      success: true,
      submitted_profile: {
        name: userName,
        year: userYear,
        department: userDept,
        education: userEdu,
        skills: userSkills,
        interest: userInterest,
        experience: userExp,
        dream_career: userDream
      },
      primary_recommendation: primary,
      alternative_recommendations: alternatives,
      total_careers_evaluated: careerRows.length
    };
  }
}
