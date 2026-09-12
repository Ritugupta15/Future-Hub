export interface User {
  id: number;
  email: string;
  name: string;
  education?: string;
  experience_level?: string;
  year?: string;
  department?: string;
  dream_career?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: number;
  user_id: number;
  name: string;
  email: string;
  education?: string;
  experience_level?: string;
  year?: string;
  department?: string;
  dream_career?: string;
  bio?: string;
  phone?: string;
  location?: string;
  updated_at: string;
}

export interface Resource {
  id: number;
  career_id: number;
  title: string;
  resource_type: string;
  platform: string;
  url: string;
}

export interface RoadmapStage {
  id?: number;
  stage_order: number;
  period: string;
  focus: string;
  description?: string;
  is_completed?: boolean;
}

export interface ProjectIdea {
  id?: number;
  career_id?: number;
  project_order?: number;
  title: string;
  description: string;
  difficulty: string;
  skills_practiced: string;
  career_title?: string;
}

export interface Career {
  id: number;
  slug: string;
  title: string;
  category: string;
  description: string;
  education_level: string;
  min_experience: string;
  career_overview: string;
  day_to_day: string;
  salary_range: string;
  skills?: string[];
  required_skills: string[];
  preferred_skills: string[];
  interests: string[];
  resources: Resource[];
  roadmaps?: RoadmapStage[];
  roadmap?: RoadmapStage[];
  projects?: ProjectIdea[];
  is_saved?: boolean;
  saved_at?: string;
  notes?: string;
}

export interface SkillChecklistItem {
  name: string;
  status: 'mastered' | 'to_learn';
  is_required: boolean;
}

export interface ScoreBreakdown {
  skills_score: number;
  interest_score: number;
  education_score: number;
  experience_score: number;
}

export interface SkillsAnalysis {
  matching_skills: string[];
  missing_skills: string[];
  coverage_percent: number;
}

export interface RecommendationResult {
  career_id: number;
  career_title: string;
  category: string;
  match_score: number;
  score_breakdown: ScoreBreakdown;
  skills_analysis: SkillsAnalysis;
  reasoning: string;
  salary_range: string;
  description?: string;
}

export interface CareerRecommendation {
  id: number;
  slug: string;
  title: string;
  category: string;
  description: string;
  match_score: number;
  skill_match_score: number;
  interest_match_score: number;
  education_match_score: number;
  experience_match_score: number;
  score_breakdown?: {
    skills_score: number;
    interest_score: number;
    education_score: number;
    experience_score: number;
  };
  next_action?: string;
  reason: string;
  matched_skills: string[];
  missing_skills: string[];
  required_skills: string[];
  preferred_skills: string[];
  skills_checklist: SkillChecklistItem[];
  roadmap: Array<{ period: string; focus: string; description?: string }>;
  project_ideas: string[];
  career_overview: string;
  day_to_day: string;
  salary_range: string;
  resources: Resource[];
  is_saved?: boolean;
}

export interface RecommendationResponse {
  success: boolean;
  submitted_profile?: {
    name?: string;
    education?: string;
    skills?: string[];
    interests?: string[];
    interest?: string;
    experience?: string;
    experience_level?: string;
    dream_career?: string;
  };
  primary_recommendation?: CareerRecommendation;
  alternative_recommendations?: CareerRecommendation[];
  recommendations?: RecommendationResult[];
  total_careers_evaluated?: number;
  assessment_id?: number;
  error?: string;
}

export interface SavedCareer {
  id: number;
  user_id: number;
  career_id: number;
  career_title: string;
  career_category: string;
  career_description: string;
  salary_range: string;
  created_at: string;
}

// ----------------------------------------------------------------------------
// EXTENDED PROFILE & RESUME TYPES
// ----------------------------------------------------------------------------

export interface ProfileSkill {
  id?: number;
  user_id?: number;
  skill_name: string;
  category?: string;
  proficiency_level: 'beginner' | 'intermediate' | 'advanced';
  source: 'manual' | 'assessment' | 'cv';
  created_at?: string;
}

export interface ProfileEducation {
  id?: number;
  user_id?: number;
  institution: string;
  degree: string;
  major: string;
  academic_year?: string;
  graduation_year?: string;
  academic_status?: string;
  coursework?: string;
  created_at?: string;
}

export interface ProfileExperience {
  id?: number;
  user_id?: number;
  organization: string;
  role: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  technologies?: string;
  experience_level?: string;
  created_at?: string;
}

export interface ProfileProject {
  id?: number;
  user_id?: number;
  name: string;
  description?: string;
  technologies?: string;
  role?: string;
  project_url?: string;
  github_url?: string;
  demo_url?: string;
  difficulty?: string;
  completion_status?: string;
  created_at?: string;
}

export interface ProfileCertification {
  id?: number;
  user_id?: number;
  name: string;
  issuer: string;
  issue_date?: string;
  credential_id?: string;
  verification_url?: string;
  created_at?: string;
}

export interface ProfileGoals {
  id?: number;
  user_id?: number;
  target_roles?: string;
  preferred_domains?: string;
  target_tech?: string;
  career_interests?: string;
  short_term_goal?: string;
  long_term_goal?: string;
  updated_at?: string;
}

export interface ProfileLinks {
  id?: number;
  user_id?: number;
  github_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  website_url?: string;
  updated_at?: string;
}

export interface ProfileCompletenessCriterion {
  key: string;
  label: string;
  weight: number;
  filled: boolean;
  value?: any;
}

export interface ProfileCompletenessResult {
  score: number;
  criteria: ProfileCompletenessCriterion[];
  completed_count: number;
  total_count: number;
  next_recommended_action: string;
}

export interface FullProfile {
  basic: UserProfile;
  completeness: ProfileCompletenessResult;
  skills: ProfileSkill[];
  education: ProfileEducation[];
  experience: ProfileExperience[];
  projects: ProfileProject[];
  certifications: ProfileCertification[];
  goals: ProfileGoals | null;
  links: ProfileLinks | null;
  active_resume: ResumeRecord | null;
}

export interface ResumeRecord {
  id: number;
  user_id: number;
  original_filename: string;
  stored_filename: string;
  mime_type: string;
  file_size: number;
  file_path: string;
  upload_date: string;
  is_active: number;
  version: number;
}

export interface ExtractedEntities {
  name?: string;
  email?: string;
  phone?: string;
  links: {
    github?: string;
    linkedin?: string;
    portfolio?: string;
  };
  skills: Array<{ name: string; category: string; matched_from: string }>;
  education: Array<{ institution: string; degree: string; major?: string; year?: string }>;
  experience: Array<{ organization: string; role: string; description?: string; technologies?: string }>;
  projects: Array<{ name: string; description?: string; technologies?: string }>;
  certifications: Array<{ name: string; issuer?: string }>;
}

export interface ResumeExtractionRecord {
  id: number;
  resume_id: number;
  user_id: number;
  raw_text?: string;
  status: 'pending' | 'parsed' | 'reviewed' | 'failed';
  extracted_json: ExtractedEntities;
  reviewed_json?: any;
  created_at: string;
  reviewed_at?: string;
}

