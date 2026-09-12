import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { apiClient } from '../api/client';
import { 
  SavedCareer, 
  ResumeRecord, 
  ResumeExtractionRecord, 
  FullProfile, 
  ProfileCompletenessResult 
} from '../types';

interface UserDataContextType {
  savedCareers: SavedCareer[];
  savedCareerIds: Set<number>;
  isCareerSaved: (careerId: number) => boolean;
  toggleSaveCareer: (careerId: number, notes?: string) => Promise<boolean>;
  
  latestAssessment: any | null;
  activeAssessmentDetail: any | null;
  setActiveAssessmentDetail: (assessment: any | null) => void;
  history: any[];
  
  roadmapProgress: Record<number, Record<number, boolean>>;
  isRoadmapStageCompleted: (careerId: number, stageOrder: number) => boolean;
  toggleRoadmapStage: (careerId: number, stageOrder: number, isCompleted: boolean) => Promise<void>;
  
  activeResume: ResumeRecord | null;
  resumeExtraction: ResumeExtractionRecord | null;
  fullProfile: FullProfile | null;
  profileCompleteness: ProfileCompletenessResult | null;
  
  isLoadingUserData: boolean;
  refreshSaved: () => Promise<void>;
  refreshAssessment: () => Promise<void>;
  refreshHistory: () => Promise<void>;
  refreshResume: () => Promise<void>;
  refreshFullProfile: () => Promise<void>;
  refreshAllUserData: () => Promise<void>;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  const [savedCareers, setSavedCareers] = useState<SavedCareer[]>([]);
  const [savedCareerIds, setSavedCareerIds] = useState<Set<number>>(new Set());
  const [latestAssessment, setLatestAssessment] = useState<any | null>(null);
  const [activeAssessmentDetail, setActiveAssessmentDetail] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [roadmapProgress, setRoadmapProgress] = useState<Record<number, Record<number, boolean>>>({});
  
  const [activeResume, setActiveResume] = useState<ResumeRecord | null>(null);
  const [resumeExtraction, setResumeExtraction] = useState<ResumeExtractionRecord | null>(null);
  const [fullProfile, setFullProfile] = useState<FullProfile | null>(null);
  const [profileCompleteness, setProfileCompleteness] = useState<ProfileCompletenessResult | null>(null);

  const [isLoadingUserData, setIsLoadingUserData] = useState<boolean>(true);

  // Load saved careers
  const refreshSaved = useCallback(async () => {
    if (!isAuthenticated) {
      setSavedCareers([]);
      setSavedCareerIds(new Set());
      return;
    }
    try {
      const res = await apiClient.getSavedCareers();
      if (res.success && res.data) {
        setSavedCareers(res.data);
        const ids = new Set<number>(res.data.map((c: any) => Number(c.career_id || c.id)));
        setSavedCareerIds(ids);
      }
    } catch (err) {
      console.error('Error loading saved careers in context:', err);
    }
  }, [isAuthenticated]);

  // Load latest assessment & recommendations
  const refreshAssessment = useCallback(async () => {
    if (!isAuthenticated) {
      setLatestAssessment(null);
      setActiveAssessmentDetail(null);
      return;
    }
    try {
      const res = await apiClient.getLatestAssessment();
      if (res.success && res.data) {
        setLatestAssessment(res.data);
        setActiveAssessmentDetail(res.data);
      } else {
        setLatestAssessment(null);
        setActiveAssessmentDetail(null);
      }
    } catch (err) {
      console.error('Error loading latest assessment in context:', err);
    }
  }, [isAuthenticated]);

  // Load assessment history
  const refreshHistory = useCallback(async () => {
    if (!isAuthenticated) {
      setHistory([]);
      return;
    }
    try {
      const res = await apiClient.getAssessmentHistory();
      if (res.success && res.data) {
        setHistory(res.data);
      }
    } catch (err) {
      console.error('Error loading assessment history in context:', err);
    }
  }, [isAuthenticated]);

  // Load resume & extractions
  const refreshResume = useCallback(async () => {
    if (!isAuthenticated) {
      setActiveResume(null);
      setResumeExtraction(null);
      return;
    }
    try {
      const res = await apiClient.getActiveResume();
      if (res.success) {
        setActiveResume(res.resume || null);
        setResumeExtraction(res.extraction || null);
      }
    } catch (err) {
      console.error('Error loading active resume in context:', err);
    }
  }, [isAuthenticated]);

  // Load full profile aggregate and completeness
  const refreshFullProfile = useCallback(async () => {
    if (!isAuthenticated) {
      setFullProfile(null);
      setProfileCompleteness(null);
      return;
    }
    try {
      const res = await apiClient.getFullProfile();
      if (res.success && res.data) {
        setFullProfile(res.data);
        setProfileCompleteness(res.data.completeness || null);
      }
    } catch (err) {
      console.error('Error loading full profile in context:', err);
    }
  }, [isAuthenticated]);

  // Unified refresh
  const refreshAllUserData = useCallback(async () => {
    if (!isAuthenticated) {
      setSavedCareers([]);
      setSavedCareerIds(new Set());
      setLatestAssessment(null);
      setActiveAssessmentDetail(null);
      setHistory([]);
      setRoadmapProgress({});
      setActiveResume(null);
      setResumeExtraction(null);
      setFullProfile(null);
      setProfileCompleteness(null);
      setIsLoadingUserData(false);
      return;
    }

    setIsLoadingUserData(true);
    await Promise.all([
      refreshSaved(),
      refreshAssessment(),
      refreshHistory(),
      refreshResume(),
      refreshFullProfile()
    ]);
    setIsLoadingUserData(false);
  }, [isAuthenticated, refreshSaved, refreshAssessment, refreshHistory, refreshResume, refreshFullProfile]);

  // Reload when user or auth changes
  useEffect(() => {
    refreshAllUserData();
  }, [isAuthenticated, user?.id, refreshAllUserData]);

  // Check if career is saved
  const isCareerSaved = useCallback((careerId: number): boolean => {
    return savedCareerIds.has(careerId);
  }, [savedCareerIds]);

  // Toggle save career
  const toggleSaveCareer = useCallback(async (careerId: number, notes: string = ''): Promise<boolean> => {
    if (!isAuthenticated) return false;

    const alreadySaved = savedCareerIds.has(careerId);

    try {
      if (alreadySaved) {
        await apiClient.unsaveCareer(careerId);
        setSavedCareerIds(prev => {
          const next = new Set(prev);
          next.delete(careerId);
          return next;
        });
        setSavedCareers(prev => prev.filter(c => Number(c.career_id || c.id) !== careerId));
        return false;
      } else {
        await apiClient.saveCareer(careerId, notes);
        setSavedCareerIds(prev => new Set(prev).add(careerId));
        await refreshSaved();
        return true;
      }
    } catch (err) {
      console.error('Error toggling saved career:', err);
      throw err;
    }
  }, [isAuthenticated, savedCareerIds, refreshSaved]);

  // Check roadmap stage completed
  const isRoadmapStageCompleted = useCallback((careerId: number, stageOrder: number): boolean => {
    return !!roadmapProgress[careerId]?.[stageOrder];
  }, [roadmapProgress]);

  // Toggle roadmap stage
  const toggleRoadmapStage = useCallback(async (careerId: number, stageOrder: number, isCompleted: boolean) => {
    if (!isAuthenticated) return;

    setRoadmapProgress(prev => ({
      ...prev,
      [careerId]: {
        ...(prev[careerId] || {}),
        [stageOrder]: isCompleted
      }
    }));

    try {
      await apiClient.updateRoadmapProgress(careerId, stageOrder, isCompleted);
    } catch (err) {
      console.error('Error updating roadmap stage in context:', err);
      // Revert optimistic update
      setRoadmapProgress(prev => ({
        ...prev,
        [careerId]: {
          ...(prev[careerId] || {}),
          [stageOrder]: !isCompleted
        }
      }));
      throw err;
    }
  }, [isAuthenticated]);

  return (
    <UserDataContext.Provider
      value={{
        savedCareers,
        savedCareerIds,
        isCareerSaved,
        toggleSaveCareer,
        latestAssessment,
        activeAssessmentDetail,
        setActiveAssessmentDetail,
        history,
        roadmapProgress,
        isRoadmapStageCompleted,
        toggleRoadmapStage,
        activeResume,
        resumeExtraction,
        fullProfile,
        profileCompleteness,
        isLoadingUserData,
        refreshSaved,
        refreshAssessment,
        refreshHistory,
        refreshResume,
        refreshFullProfile,
        refreshAllUserData
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = (): UserDataContextType => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
};
