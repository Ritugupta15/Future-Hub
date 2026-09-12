import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUserData } from '../context/UserDataContext';
import { useToast } from '../context/ToastContext';
import { apiClient } from '../api/client';
import { Career } from '../types';
import { SkillsChecklist } from '../components/SkillsChecklist';
import { RoadmapTimeline } from '../components/RoadmapTimeline';
import { ProjectCard } from '../components/ProjectCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { CardSkeleton } from '../components/ui/Skeleton';
import { 
  Bookmark, 
  Sparkles, 
  Compass, 
  CheckCircle2, 
  Layers,
  BookOpen,
  ArrowRight,
  GraduationCap,
  Briefcase,
  AlertTriangle,
  ChevronRight,
  Target,
  Award,
  Check,
  ArrowUpRight,
  Printer
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { 
    latestAssessment, 
    activeAssessmentDetail, 
    setActiveAssessmentDetail,
    isCareerSaved, 
    toggleSaveCareer, 
    savedCareers,
    roadmapProgress, 
    toggleRoadmapStage, 
    isLoadingUserData 
  } = useUserData();
  const { showToast } = useToast();

  const [selectedCareerIndex, setSelectedCareerIndex] = useState<number>(0);
  const [careerDetail, setCareerDetail] = useState<Career | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'skills' | 'roadmap' | 'projects'>('skills');

  // Active assessment data (either selected historical or latest)
  const currentAssessment = activeAssessmentDetail || latestAssessment;

  // Extract recommendations array, ordered deterministically by match score descending
  const recommendations: any[] = useMemo(() => {
    if (!currentAssessment) return [];
    
    const primary = currentAssessment.primary_recommendation || currentAssessment.details?.primary_recommendation;
    const alts = currentAssessment.alternative_recommendations || currentAssessment.details?.alternative_recommendations || [];
    
    let list: any[] = [];
    if (primary) {
      list = [primary, ...alts];
    } else if (Array.isArray(currentAssessment.recommendations)) {
      list = [...currentAssessment.recommendations];
    }

    return list;
  }, [currentAssessment]);

  const activeRec = recommendations[selectedCareerIndex] || recommendations[0];
  const activeCareerId = activeRec ? Number(activeRec.id || activeRec.career_id) : 0;

  // Fetch full details for the selected career
  useEffect(() => {
    if (!activeCareerId) return;

    let isMounted = true;
    apiClient.getCareerById(activeCareerId).then((res) => {
      if (isMounted && res.success && res.data) {
        setCareerDetail(res.data);
      }
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [activeCareerId]);

  const handleToggleSave = async (careerId: number) => {
    setIsSaving(true);
    try {
      const nowSaved = await toggleSaveCareer(careerId);
      showToast(
        nowSaved ? 'Career saved.' : 'Career removed from saved.',
        nowSaved ? 'success' : 'info'
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to update bookmark.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Loading Skeleton State
  if (isLoadingUserData) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-slate-200 animate-pulse rounded-lg" />
        <CardSkeleton />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  // Onboarding Empty State for Brand New User (No Assessment Yet)
  if (!currentAssessment || recommendations.length === 0) {
    return (
      <div className="space-y-8 pb-12">
        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome to FutureHub, {user?.name || 'Student'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Your centralized academic career discovery dashboard.
          </p>
        </div>

        <Card className="p-8 sm:p-12 text-center space-y-6 max-w-3xl mx-auto border-blue-200/80 shadow-md">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
            <Compass className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <Badge variant="primary" size="sm">
              Action Required
            </Badge>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Begin your career evaluation
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Complete the deterministic 2-minute career evaluation. We analyze your degree program, technical competencies, and domain interests to calculate your career match matrix, personalized skill gaps, and curated 5-stage progression roadmaps.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to="/assessment" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" rightIcon={<Sparkles className="w-4 h-4" />}>
                Start Career Assessment
              </Button>
            </Link>
            <Link to="/careers" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" leftIcon={<BookOpen className="w-4 h-4" />}>
                Explore Technology Careers
              </Button>
            </Link>
          </div>

          {/* 4 Pillars Explanatory Strip */}
          <div className="pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="text-[10px] font-bold text-blue-600 uppercase">45% Weight</div>
              <div className="text-xs font-bold text-slate-900">Technical Skills</div>
              <div className="text-[11px] text-slate-500">Jaccard similarity match</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="text-[10px] font-bold text-indigo-600 uppercase">30% Weight</div>
              <div className="text-xs font-bold text-slate-900">Domain Interests</div>
              <div className="text-[11px] text-slate-500">Affinity matrix mapping</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="text-[10px] font-bold text-sky-600 uppercase">15% Weight</div>
              <div className="text-xs font-bold text-slate-900">Education Degree</div>
              <div className="text-[11px] text-slate-500">Prerequisite threshold</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="text-[10px] font-bold text-teal-600 uppercase">10% Weight</div>
              <div className="text-xs font-bold text-slate-900">Experience Tier</div>
              <div className="text-[11px] text-slate-500">Practical labs & projects</div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Active Recommendation Data Normalization
  const matchScore = Math.round(activeRec.match_score || 0);
  const skillsScore = Math.round(activeRec.skill_match_score ?? activeRec.score_breakdown?.skills_score ?? 34);
  const interestScore = Math.round(activeRec.interest_match_score ?? activeRec.score_breakdown?.interest_score ?? 25);
  const educationScore = Math.round(activeRec.education_match_score ?? activeRec.score_breakdown?.education_score ?? 15);
  const experienceScore = Math.round(activeRec.experience_match_score ?? activeRec.score_breakdown?.experience_score ?? 7);

  const matchingSkills: string[] = activeRec.matched_skills || activeRec.skills_analysis?.matching_skills || [];
  const missingSkills: string[] = activeRec.missing_skills || activeRec.skills_analysis?.missing_skills || [];
  const totalKeySkills = Math.max(1, matchingSkills.length + missingSkills.length);
  const coveragePercent = Math.round((matchingSkills.length / totalKeySkills) * 100);

  const careerTitle = activeRec.title || activeRec.career_title || 'Career Path';
  const category = activeRec.category || 'Technology';
  const salaryRange = activeRec.salary_range || careerDetail?.salary_range || 'Competitive';
  const educationReq = activeRec.education_level || careerDetail?.education_level || currentAssessment.education || 'Degree in CS/IT';
  const minExperience = activeRec.min_experience || careerDetail?.min_experience || '0–1 Years';
  const description = activeRec.description || careerDetail?.description || '';

  const isCurrentSaved = isCareerSaved(activeCareerId);
  const alternatives = recommendations.filter((_, idx) => idx !== selectedCareerIndex);

  // Qualitative fit label
  const getFitLabel = (score: number) => {
    if (score >= 85) return 'Exceptional Fit';
    if (score >= 70) return 'Strong Match';
    if (score >= 55) return 'Moderate Potential';
    return 'Developing Baseline';
  };

  // Merge roadmap stages with user completion progress
  const baseRoadmapStages = careerDetail?.roadmap || careerDetail?.roadmaps || activeRec.roadmap || [];
  const activeRoadmapStages = baseRoadmapStages.map((stage: any, idx: number) => {
    const order = stage.stage_order || idx + 1;
    const isCompleted = roadmapProgress[activeCareerId]?.[order] ?? !!stage.is_completed;
    return {
      ...stage,
      stage_order: order,
      is_completed: isCompleted
    };
  });

  const completedStagesCount = activeRoadmapStages.filter((s: any) => s.is_completed).length;
  const totalStagesCount = activeRoadmapStages.length || 5;
  const roadmapPercent = Math.round((completedStagesCount / totalStagesCount) * 100);

  // Time-of-day greeting (calm, academic)
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Assessment date string
  const assessedDate = currentAssessment?.created_at 
    ? new Date(currentAssessment.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Recent';

  // Profile credentials changed notice
  const isProfileOutOfSync = Boolean(
    currentAssessment &&
    user &&
    ((user.education && currentAssessment.education && user.education !== currentAssessment.education) ||
     (user.experience_level && currentAssessment.experience_level && user.experience_level !== currentAssessment.experience_level))
  );

  const isViewingHistorical = Boolean(
    activeAssessmentDetail &&
    latestAssessment &&
    activeAssessmentDetail.id &&
    latestAssessment.id &&
    activeAssessmentDetail.id !== latestAssessment.id
  );

  // Deterministic Next Action Calculation (Strict priority order from Section 05)
  const nextIncompleteStage = activeRoadmapStages.find((s: any) => !s.is_completed);
  const nextAction = useMemo(() => {
    if (missingSkills.length > 0) {
      const topSkill = missingSkills[0];
      return {
        type: 'skill',
        actionLabel: `Complete ${topSkill} Fundamentals`,
        why: `${topSkill} is one of the missing skills for your recommended career.`,
        cta: 'Continue to Skill Gap',
        onClick: () => setActiveTab('skills')
      };
    }
    if (nextIncompleteStage) {
      return {
        type: 'roadmap',
        actionLabel: `Complete Stage ${nextIncompleteStage.stage_order}: ${nextIncompleteStage.focus}`,
        why: `Next milestone in your ${careerTitle} roadmap.`,
        cta: 'Continue Roadmap',
        onClick: () => setActiveTab('roadmap')
      };
    }
    if (careerDetail?.projects && careerDetail.projects.length > 0) {
      return {
        type: 'project',
        actionLabel: `Build ${careerDetail.projects[0].title}`,
        why: `Recommended portfolio project to demonstrate practical competency.`,
        cta: 'View Project Brief',
        onClick: () => setActiveTab('projects')
      };
    }
    if (alternatives.length > 0) {
      return {
        type: 'alternative',
        actionLabel: `Explore Alternative: ${alternatives[0].title || alternatives[0].career_title}`,
        why: `${Math.round(alternatives[0].match_score || 0)}% compatibility match based on your profile.`,
        cta: 'Switch Career',
        onClick: () => setSelectedCareerIndex(1)
      };
    }
    return {
      type: 'complete',
      actionLabel: 'Maintain Current Profile',
      why: 'You have covered all core requirements and roadmap milestones.',
      cta: 'Explore All Careers',
      onClick: () => {}
    };
  }, [missingSkills, nextIncompleteStage, careerDetail, alternatives, careerTitle]);

  return (
    <div className="space-y-8 pb-12">
      {/* Historical Assessment Notice */}
      {isViewingHistorical && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-800">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded text-[10px]">
              Archive Snapshot
            </span>
            <span>
              Viewing assessment from <strong>{assessedDate}</strong> ({activeAssessmentDetail.education})
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveAssessmentDetail(latestAssessment);
              setSelectedCareerIndex(0);
            }}
            className="font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer self-start sm:self-auto"
          >
            Return to latest assessment →
          </button>
        </div>
      )}

      {/* Profile Desynchronization Notice */}
      {isProfileOutOfSync && !isViewingHistorical && (
        <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>
              Your profile degree or experience has changed since your last assessment.
            </span>
          </div>
          <Link
            to="/assessment"
            className="font-bold text-blue-700 hover:text-blue-900 underline self-start sm:self-auto"
          >
            Retake assessment to refresh matches →
          </Link>
        </div>
      )}

      {/* ------------------------------------------------
          1. HEADER (Section 05)
          ------------------------------------------------ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {getGreeting()}, {user?.name || 'Student'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-2">
            <span>Latest assessment:</span>
            <span className="font-semibold text-slate-700">{assessedDate}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="tertiary"
            size="md"
            onClick={() => window.print()}
            leftIcon={<Printer className="w-4 h-4 text-slate-500" />}
            className="hidden sm:inline-flex no-print"
            title="Print or save your academic career match report as PDF"
          >
            Print Career Report
          </Button>

          <Link to="/assessment" className="no-print">
            <Button variant="secondary" size="md" leftIcon={<Sparkles className="w-4 h-4 text-blue-600" />}>
              Retake Assessment
            </Button>
          </Link>
        </div>
      </div>

      {/* ------------------------------------------------
          2. PRIMARY CAREER MATCH (Section 05)
          ------------------------------------------------ */}
      <Card className="p-6 sm:p-8 border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
              {selectedCareerIndex === 0 ? 'Your Strongest Career Match' : 'Selected Career Evaluation'}
            </span>
            {selectedCareerIndex !== 0 && (
              <button
                type="button"
                onClick={() => setSelectedCareerIndex(0)}
                className="text-xs font-semibold text-slate-500 hover:text-blue-600 underline cursor-pointer"
              >
                (Switch back to top match)
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleToggleSave(activeCareerId)}
              isLoading={isSaving}
              leftIcon={<Bookmark className={`w-3.5 h-3.5 ${isCurrentSaved ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />}
            >
              {isCurrentSaved ? 'Saved' : 'Save'}
            </Button>
            <Link to={`/careers/${activeCareerId}`}>
              <Button variant="primary" size="sm" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                View Details
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Metadata & Career Specs */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary" size="sm">
                {category}
              </Badge>
              <Badge variant="success" size="sm">
                Salary: {salaryRange}
              </Badge>
              <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full font-medium">
                <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                {educationReq}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full font-medium">
                <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                Exp: {minExperience}
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {careerTitle}
            </h2>

            <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
              {description}
            </p>
          </div>

          {/* Right: Score Display & 4-Pillar Breakdown */}
          <div className="lg:col-span-5 bg-slate-50 p-6 rounded-2xl border border-slate-200/90 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
              <div>
                <div className="text-4xl font-black text-blue-600 tracking-tight">
                  {matchScore}%
                </div>
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mt-0.5">
                  {getFitLabel(matchScore)}
                </div>
              </div>

              <div className="text-right text-[11px] text-slate-500 font-medium">
                <span>Deterministic Score</span>
                <span className="block text-slate-400">45 / 30 / 15 / 10 Formula</span>
              </div>
            </div>

            {/* Score Breakdown (Points out of total) */}
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    Technical Skills (45% Weight)
                  </span>
                  <span className="font-bold text-blue-700">{skillsScore} / 45</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${(skillsScore / 45) * 100}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    Interests (30% Weight)
                  </span>
                  <span className="font-bold text-indigo-700">{interestScore} / 30</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${(interestScore / 30) * 100}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-600" />
                    Education (15% Weight)
                  </span>
                  <span className="font-bold text-sky-700">{educationScore} / 15</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-sky-600 h-full rounded-full transition-all duration-500" style={{ width: `${(educationScore / 15) * 100}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-teal-600" />
                    Experience (10% Weight)
                  </span>
                  <span className="font-bold text-teal-700">{experienceScore} / 10</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-teal-600 h-full rounded-full transition-all duration-500" style={{ width: `${(experienceScore / 10) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ------------------------------------------------
          3. WHY THIS CAREER FITS (Section 05 & 07)
          ------------------------------------------------ */}
      <Card className="p-6 sm:p-8 space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Explainable Matching</span>
          <h3 className="text-lg font-bold text-slate-900 mt-0.5">
            Why this career fits you
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Technical Skill Overlap</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {matchingSkills.length > 0 ? (
                <>Your skills (<strong className="text-slate-800">{matchingSkills.slice(0, 3).join(', ')}</strong>) overlap with the core technical requirements.</>
              ) : (
                <>Baseline competency matching. Build foundational requirements in {careerTitle}.</>
              )}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-700">
              <Check className="w-4 h-4 text-blue-600" />
              <span>Education Requirement Met</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your degree satisfies the academic prerequisites for standard entry-level hiring.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-700">
              <Check className="w-4 h-4 text-indigo-600" />
              <span>Domain Interest Alignment</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your selected technology interests strongly correlate with the {category} discipline.
            </p>
          </div>
        </div>

        {missingSkills.length > 0 && (
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span className="font-bold text-slate-700">Development Areas:</span>
            {missingSkills.slice(0, 4).map((s) => (
              <span key={s} className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-medium text-[11px]">
                → {s}
              </span>
            ))}
          </div>
        )}
      </Card>

      {/* ------------------------------------------------
          4. YOUR NEXT STEP (Section 05 High Visual Prominence)
          ------------------------------------------------ */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider border border-blue-500/30">
            <Target className="w-3.5 h-3.5" />
            <span>Next Step</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {nextAction.actionLabel}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            {nextAction.why}
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={nextAction.onClick}
          rightIcon={<ArrowRight className="w-4 h-4" />}
          className="flex-shrink-0 self-start md:self-center cursor-pointer shadow-lg shadow-blue-600/30"
        >
          {nextAction.cta}
        </Button>
      </div>

      {/* ------------------------------------------------
          5. PROGRESS (Section 05 Three Meaningful Real Metrics)
          ------------------------------------------------ */}
      <div className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Career Development Progress
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Metric 1: Skill Alignment */}
          <Card className="p-5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Skill Alignment</span>
              <span className="font-bold text-blue-600">{coveragePercent}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full transition-all" style={{ width: `${coveragePercent}%` }} />
            </div>
            <p className="text-xs text-slate-500">
              <strong>{matchingSkills.length}</strong> of {totalKeySkills} core skills mastered for this role.
            </p>
          </Card>

          {/* Metric 2: Roadmap Progress */}
          <Card className="p-5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Roadmap Progress</span>
              <span className="font-bold text-emerald-600">{roadmapPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full transition-all" style={{ width: `${roadmapPercent}%` }} />
            </div>
            <p className="text-xs text-slate-500">
              <strong>{completedStagesCount}</strong> of {totalStagesCount} curriculum milestones completed.
            </p>
          </Card>

          {/* Metric 3: Saved Careers */}
          <Card className="p-5 space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Saved Careers</span>
                <span className="font-bold text-amber-600">{savedCareers.length}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Target pathways bookmarked for ongoing tracking.
              </p>
            </div>
            <Link to="/saved-careers" className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 pt-1">
              <span>View Bookmarks</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </Card>
        </div>
      </div>

      {/* ------------------------------------------------
          6. ALTERNATIVE MATCHES (Section 05)
          ------------------------------------------------ */}
      {alternatives.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Alternative Career Matches ({alternatives.length})
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {alternatives.slice(0, 3).map((alt) => {
              const altId = alt.id || alt.career_id;
              const originalIndex = recommendations.findIndex((r) => (r.id || r.career_id) === altId);
              const altScore = Math.round(alt.match_score || 0);
              const oneLineReason = alt.reason 
                ? alt.reason.replace(/^\[Your Dream Goal\]\s*/, '').split('.')[0] + '.'
                : `Alternative option matching your technical background in ${alt.category}.`;

              return (
                <Card
                  key={altId}
                  hoverable
                  className="p-5 flex flex-col justify-between space-y-3 cursor-pointer border-slate-200 hover:border-blue-300"
                  onClick={() => setSelectedCareerIndex(originalIndex)}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="primary" size="sm">
                        {alt.category}
                      </Badge>
                      <span className="text-sm font-black text-slate-900">
                        {altScore}%
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors">
                      {alt.title || alt.career_title}
                    </h4>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {oneLineReason}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                    <span>Inspect Match</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------
          7. DEEP DIVES (Tabs: Skills Gap, Roadmap, Projects)
          ------------------------------------------------ */}
      <div className="space-y-6 pt-4">
        {/* Tab Header Controls */}
        <div className="flex items-center border-b border-slate-200 space-x-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('skills')}
            className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'skills'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Skill Gap Analysis ({matchingSkills.length}/{totalKeySkills})</span>
          </button>

          <button
            onClick={() => setActiveTab('roadmap')}
            className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'roadmap'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>5-Stage Roadmap ({completedStagesCount}/{totalStagesCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'projects'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Portfolio Projects ({careerDetail?.projects?.length || 0})</span>
          </button>
        </div>

        {/* Tab 1: Skills Gap */}
        {activeTab === 'skills' && (
          <Card className="p-6 sm:p-8">
            <SkillsChecklist
              matchingSkills={matchingSkills}
              missingSkills={missingSkills}
              coveragePercent={coveragePercent}
              careerTitle={careerTitle}
            />
          </Card>
        )}

        {/* Tab 2: Roadmap */}
        {activeTab === 'roadmap' && (
          <Card className="p-6 sm:p-8">
            <RoadmapTimeline
              stages={activeRoadmapStages}
              careerTitle={careerTitle}
              interactive={true}
              onToggleStage={(stageOrder, isDone) => {
                toggleRoadmapStage(activeCareerId, stageOrder, isDone);
                showToast(
                  isDone ? 'Roadmap stage completed.' : 'Roadmap stage marked in progress.',
                  'info'
                );
              }}
            />
          </Card>
        )}

        {/* Tab 3: Projects */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
              Build these practical portfolio applications to validate your capabilities and demonstrate concrete technical competency.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(careerDetail?.projects || []).map((project) => (
                <ProjectCard key={project.id || project.title} project={project} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
