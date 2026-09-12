import {
  User,
  UserProfile,
  Career,
  RecommendationResponse,
  ProjectIdea,
  RoadmapStage,
  SavedCareer,
  FullProfile,
  ResumeRecord,
  ResumeExtractionRecord,
  ProfileSkill,
  ProfileEducation,
  ProfileExperience,
  ProfileProject,
  ProfileCertification,
  ProfileGoals,
  ProfileLinks,
  ProfileCompletenessResult
} from '../types';

const API_BASE = '/api';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('futurehub_token');

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (response.status === 401) {
    if (token) {
      localStorage.removeItem('futurehub_token');
      localStorage.removeItem('futurehub_user');
      window.dispatchEvent(new Event('auth-state-changed'));
    }
  }

  let data: any;
  try {
    data = await response.json();
  } catch (e) {
    throw new ApiError(`Server returned status ${response.status}`, response.status);
  }

  if (!response.ok || data.success === false) {
    let errorMsg = 'An unexpected error occurred.';
    if (typeof data.error === 'string') {
      errorMsg = data.error;
    } else if (data.error && typeof data.error === 'object') {
      errorMsg = data.error.message || JSON.stringify(data.error);
    } else if (data.message) {
      errorMsg = data.message;
    }
    throw new ApiError(errorMsg, response.status);
  }

  return data as T;
}

export const api = {
  auth: {
    register: (data: { email: string; password: string; name: string; education?: string; experience_level?: string; year?: string; department?: string }) =>
      request<{ success: boolean; user: User; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data)
      }),

    login: (data: { email: string; password: string }) =>
      request<{ success: boolean; user: User; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data)
      }),

    logout: () =>
      request<{ success: boolean }>('/auth/logout', {
        method: 'POST'
      }),

    me: () =>
      request<{ success: boolean; user: User }>('/auth/me')
  },

  careers: {
    list: (params?: { search?: string; category?: string }) => {
      const query = new URLSearchParams();
      if (params?.search) query.set('search', params.search);
      if (params?.category) query.set('category', params.category);
      const qStr = query.toString() ? `?${query.toString()}` : '';
      return request<{ success: boolean; count: number; careers: Career[]; data?: Career[] }>(`/careers${qStr}`);
    },

    get: (idOrSlug: string | number) =>
      request<{ success: boolean; career?: Career; data?: Career }>(`/careers/${idOrSlug}`),

    skills: () =>
      request<{ success: boolean; skills_by_category: Array<{ category: string; skills: string[] }> }>('/careers/skills'),

    interests: () =>
      request<{ success: boolean; interests: string[] }>('/careers/interests'),

    projects: () =>
      request<{ success: boolean; count: number; projects: ProjectIdea[] }>('/careers/projects')
  },

  assessment: {
    submit: (payload: {
      name?: string;
      skills: string[];
      interests?: string[];
      interest?: string;
      education?: string;
      experience_level?: string;
      dream_career?: string;
    }) =>
      request<RecommendationResponse>('/assessment', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),

    getHistory: () =>
      request<{
        success: boolean;
        count: number;
        data?: any[];
        history?: any[];
      }>('/assessment/history'),

    getLatest: () =>
      request<{
        success: boolean;
        assessment?: any;
        latest?: any;
      }>('/assessment/latest')
  },

  saved: {
    list: () =>
      request<{ success: boolean; count: number; saved_careers?: SavedCareer[]; data?: SavedCareer[] }>('/saved-careers'),

    save: (careerId: number, notes?: string) =>
      request<{ success: boolean; message: string }>(`/saved-careers/${careerId}`, {
        method: 'POST',
        body: JSON.stringify({ notes })
      }),

    unsave: (careerId: number) =>
      request<{ success: boolean; message: string }>(`/saved-careers/${careerId}`, {
        method: 'DELETE'
      })
  },

  roadmap: {
    get: (careerIdOrSlug: string | number) =>
      request<{
        success: boolean;
        career: { id: number; slug: string; title: string };
        stages: RoadmapStage[];
      }>(`/roadmap/${careerIdOrSlug}`),

    updateProgress: (careerId: number, stageOrder: number, isCompleted: boolean) =>
      request<{ success: boolean; message: string }>('/roadmap/progress', {
        method: 'PUT',
        body: JSON.stringify({
          career_id: careerId,
          stage_order: stageOrder,
          is_completed: isCompleted
        })
      })
  },

  profile: {
    get: () =>
      request<{ success: boolean; profile?: UserProfile; data?: UserProfile }>('/profile'),

    getFull: () =>
      request<{ success: boolean; data: FullProfile }>('/profile/full'),

    getCompleteness: () =>
      request<{ success: boolean; completeness: ProfileCompletenessResult }>('/profile/completeness'),

    update: (data: Partial<UserProfile>) =>
      request<{ success: boolean; message: string; profile?: UserProfile; data?: UserProfile }>('/profile', {
        method: 'PUT',
        body: JSON.stringify(data)
      }),

    getSkills: () =>
      request<{ success: boolean; skills: ProfileSkill[] }>('/profile/skills'),

    addSkill: (data: { skill_name: string; proficiency_level?: string; category?: string; source?: string }) =>
      request<{ success: boolean; skill: ProfileSkill }>('/profile/skills', {
        method: 'POST',
        body: JSON.stringify(data)
      }),

    deleteSkill: (idOrName: number | string) =>
      request<{ success: boolean; message: string }>(`/profile/skills/${idOrName}`, {
        method: 'DELETE'
      }),

    getEducation: () =>
      request<{ success: boolean; education: ProfileEducation[] }>('/profile/education'),

    addEducation: (data: Partial<ProfileEducation>) =>
      request<{ success: boolean; education: ProfileEducation }>('/profile/education', {
        method: 'POST',
        body: JSON.stringify(data)
      }),

    deleteEducation: (id: number) =>
      request<{ success: boolean; message: string }>(`/profile/education/${id}`, {
        method: 'DELETE'
      }),

    getExperience: () =>
      request<{ success: boolean; experience: ProfileExperience[] }>('/profile/experience'),

    addExperience: (data: Partial<ProfileExperience>) =>
      request<{ success: boolean; experience: ProfileExperience }>('/profile/experience', {
        method: 'POST',
        body: JSON.stringify(data)
      }),

    deleteExperience: (id: number) =>
      request<{ success: boolean; message: string }>(`/profile/experience/${id}`, {
        method: 'DELETE'
      }),

    getProjects: () =>
      request<{ success: boolean; projects: ProfileProject[] }>('/profile/projects'),

    addProject: (data: Partial<ProfileProject>) =>
      request<{ success: boolean; project: ProfileProject }>('/profile/projects', {
        method: 'POST',
        body: JSON.stringify(data)
      }),

    deleteProject: (id: number) =>
      request<{ success: boolean; message: string }>(`/profile/projects/${id}`, {
        method: 'DELETE'
      }),

    getCertifications: () =>
      request<{ success: boolean; certifications: ProfileCertification[] }>('/profile/certifications'),

    addCertification: (data: Partial<ProfileCertification>) =>
      request<{ success: boolean; certification: ProfileCertification }>('/profile/certifications', {
        method: 'POST',
        body: JSON.stringify(data)
      }),

    deleteCertification: (id: number) =>
      request<{ success: boolean; message: string }>(`/profile/certifications/${id}`, {
        method: 'DELETE'
      }),

    getGoals: () =>
      request<{ success: boolean; goals: ProfileGoals | null }>('/profile/goals'),

    updateGoals: (data: Partial<ProfileGoals>) =>
      request<{ success: boolean; goals: ProfileGoals }>('/profile/goals', {
        method: 'PUT',
        body: JSON.stringify(data)
      }),

    getLinks: () =>
      request<{ success: boolean; links: ProfileLinks | null }>('/profile/links'),

    updateLinks: (data: Partial<ProfileLinks>) =>
      request<{ success: boolean; links: ProfileLinks }>('/profile/links', {
        method: 'PUT',
        body: JSON.stringify(data)
      })
  },

  resume: {
    upload: (file: File) => {
      const formData = new FormData();
      formData.append('resume', file);
      return request<{
        success: boolean;
        message: string;
        resume: ResumeRecord;
        extraction: ResumeExtractionRecord;
      }>('/resume/upload', {
        method: 'POST',
        body: formData
      });
    },

    getActive: () =>
      request<{
        success: boolean;
        resume: ResumeRecord | null;
        extraction: ResumeExtractionRecord | null;
      }>('/resume/active'),

    review: (id: number, payload: any) =>
      request<{ success: boolean; message: string }>(`/resume/${id}/review`, {
        method: 'POST',
        body: JSON.stringify(payload)
      }),

    delete: (id: number) =>
      request<{ success: boolean; message: string }>(`/resume/${id}`, {
        method: 'DELETE'
      })
  }
};

// Unified apiClient wrapper for smooth ergonomic usage
export const apiClient = {
  getOptions: async () => {
    return request<{
      success: boolean;
      options: {
        education_levels: string[];
        interests: string[];
        skills_by_category: Record<string, string[]>;
        experience_levels: string[];
      };
    }>('/options');
  },

  getCareers: async (params?: { search?: string; category?: string }) => {
    const res = await api.careers.list(params);
    return {
      success: res.success,
      data: res.careers || res.data || []
    };
  },

  getCareerById: async (id: number | string) => {
    const res = await api.careers.get(id);
    return {
      success: res.success,
      data: res.career || res.data || null,
      error: (res as any).error
    };
  },

  getCategories: async () => {
    return {
      success: true,
      data: [
        'Software Engineering',
        'Cloud & Infrastructure',
        'Security & Forensics',
        'Data Science & AI',
        'Quality & Testing',
        'Design & Product'
      ]
    };
  },

  submitAssessment: async (payload: {
    education: string;
    experience_level: string;
    interests: string[];
    skills: string[];
    dream_career?: string;
  }) => {
    const res = await api.assessment.submit(payload);
    return res;
  },

  getAssessmentHistory: async () => {
    const res = await api.assessment.getHistory();
    return {
      success: res.success,
      data: res.history || res.data || []
    };
  },

  getLatestAssessment: async () => {
    const res = await api.assessment.getLatest();
    return {
      success: res.success,
      data: res.latest || res.assessment || null
    };
  },

  getRoadmap: async (careerIdOrSlug: string | number) => {
    const res = await api.roadmap.get(careerIdOrSlug);
    return {
      success: res.success,
      career: res.career,
      stages: res.stages || []
    };
  },

  updateRoadmapProgress: async (careerId: number, stageOrder: number, isCompleted: boolean) => {
    return api.roadmap.updateProgress(careerId, stageOrder, isCompleted);
  },

  getSavedCareers: async () => {
    const res = await api.saved.list();
    return {
      success: res.success,
      data: res.saved_careers || res.data || []
    };
  },

  saveCareer: async (careerId: number, notes?: string) => {
    return api.saved.save(careerId, notes);
  },

  unsaveCareer: async (careerId: number) => {
    return api.saved.unsave(careerId);
  },

  getProfile: async () => {
    const res = await api.profile.get();
    return {
      success: res.success,
      data: res.profile || res.data || null
    };
  },

  getFullProfile: async () => {
    return api.profile.getFull();
  },

  getProfileCompleteness: async () => {
    return api.profile.getCompleteness();
  },

  updateProfile: async (data: Partial<UserProfile>) => {
    const res = await api.profile.update(data);
    return {
      success: res.success,
      data: res.profile || res.data || null,
      error: (res as any).error
    };
  },

  // Resume API methods
  uploadResume: async (file: File) => {
    return api.resume.upload(file);
  },

  getActiveResume: async () => {
    return api.resume.getActive();
  },

  reviewResumeExtraction: async (resumeId: number, payload: any) => {
    return api.resume.review(resumeId, payload);
  },

  deleteResume: async (resumeId: number) => {
    return api.resume.delete(resumeId);
  },

  // Sub-resource Profile APIs
  getProfileSkills: async () => api.profile.getSkills(),
  addProfileSkill: async (data: { skill_name: string; proficiency_level?: string; category?: string; source?: string }) => api.profile.addSkill(data),
  deleteProfileSkill: async (idOrName: number | string) => api.profile.deleteSkill(idOrName),

  getProfileEducation: async () => api.profile.getEducation(),
  addProfileEducation: async (data: Partial<ProfileEducation>) => api.profile.addEducation(data),
  deleteProfileEducation: async (id: number) => api.profile.deleteEducation(id),

  getProfileExperience: async () => api.profile.getExperience(),
  addProfileExperience: async (data: Partial<ProfileExperience>) => api.profile.addExperience(data),
  deleteProfileExperience: async (id: number) => api.profile.deleteExperience(id),

  getProfileProjects: async () => api.profile.getProjects(),
  addProfileProject: async (data: Partial<ProfileProject>) => api.profile.addProject(data),
  deleteProfileProject: async (id: number) => api.profile.deleteProject(id),

  getProfileCertifications: async () => api.profile.getCertifications(),
  addProfileCertification: async (data: Partial<ProfileCertification>) => api.profile.addCertification(data),
  deleteProfileCertification: async (id: number) => api.profile.deleteCertification(id),

  getProfileGoals: async () => api.profile.getGoals(),
  updateProfileGoals: async (data: Partial<ProfileGoals>) => api.profile.updateGoals(data),

  getProfileLinks: async () => api.profile.getLinks(),
  updateProfileLinks: async (data: Partial<ProfileLinks>) => api.profile.updateLinks(data)
};
