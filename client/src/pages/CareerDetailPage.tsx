import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { Career, Resource } from '../types';
import { RoadmapTimeline } from '../components/RoadmapTimeline';
import { ProjectCard } from '../components/ProjectCard';
import { useAuth } from '../context/AuthContext';
import { useUserData } from '../context/UserDataContext';
import { useToast } from '../context/ToastContext';
import { 
  ArrowLeft, 
  Bookmark, 
  Sparkles, 
  Layers,
  Award,
  BookOpen,
  CircleAlert,
  GraduationCap,
  Briefcase,
  ExternalLink,
  Clock,
  Compass,
  FileText,
  Video,
  Check,
  Printer
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

export const CareerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isCareerSaved, toggleSaveCareer, roadmapProgress, toggleRoadmapStage, latestAssessment } = useUserData();
  const { showToast } = useToast();

  const [career, setCareer] = useState<Career | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'roadmap' | 'projects' | 'resources'>('roadmap');

  const roadmapSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    loadCareer();
  }, [id]);

  const loadCareer = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.getCareerById(id!);
      if (res.success && res.data) {
        setCareer(res.data);
      } else {
        setError(res.error || 'Career not found.');
      }
    } catch (err: any) {
      setError(err.message || 'Error loading career details.');
    } finally {
      setIsLoading(false);
    }
  };

  const isSaved = career ? isCareerSaved(career.id) : false;

  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!career) return;

    try {
      const willBeSaved = !isSaved;
      await toggleSaveCareer(career.id);
      showToast(
        willBeSaved ? 'Career saved.' : 'Career removed from bookmarks.',
        'success'
      );
    } catch (e: any) {
      showToast(e.message || 'Error updating bookmark.', 'error');
    }
  };

  const handleStartRoadmap = () => {
    setActiveTab('roadmap');
    setTimeout(() => {
      roadmapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Loading career profile & roadmaps...</p>
      </div>
    );
  }

  if (error || !career) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center space-y-4">
        <CircleAlert className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900">Career Not Found</h2>
        <p className="text-sm text-slate-600">{error || 'The requested career pathway could not be found.'}</p>
        <Link to="/careers">
          <Button variant="secondary" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Career Explorer
          </Button>
        </Link>
      </div>
    );
  }

  // Personalization matching data if user has taken assessment
  const matchingRec = latestAssessment?.recommendations?.find(
    (r: any) => r.career_id === career.id || r.career_slug === career.slug
  );
  const userSkills = new Set<string>(latestAssessment?.user_inputs?.skills || []);
  const allCareerSkills = Array.from(new Set([
    ...(career.skills || []),
    ...(career.required_skills || []),
    ...(career.preferred_skills || [])
  ]));
  const matchedSkills = allCareerSkills.filter(s => userSkills.has(s));
  const skillCoverage = allCareerSkills.length > 0 
    ? Math.round((matchedSkills.length / allCareerSkills.length) * 100) 
    : 0;

  // Split skills into required vs preferred
  const requiredSkills = (career.required_skills && career.required_skills.length > 0)
    ? career.required_skills
    : allCareerSkills.slice(0, Math.ceil(allCareerSkills.length * 0.6));

  const preferredSkills = (career.preferred_skills && career.preferred_skills.length > 0)
    ? career.preferred_skills
    : allCareerSkills.slice(Math.ceil(allCareerSkills.length * 0.6));

  // Group resources
  const groupedResources = {
    documentation: (career.resources || []).filter(r => r.resource_type?.toLowerCase() === 'documentation' || r.resource_type?.toLowerCase() === 'doc'),
    tutorial: (career.resources || []).filter(r => r.resource_type?.toLowerCase() === 'tutorial' || r.resource_type?.toLowerCase() === 'course' || r.resource_type?.toLowerCase() === 'book'),
    certification: (career.resources || []).filter(r => r.resource_type?.toLowerCase() === 'certification' || r.resource_type?.toLowerCase() === 'cert'),
    other: (career.resources || []).filter(r => !['documentation', 'doc', 'tutorial', 'course', 'book', 'certification', 'cert'].includes(r.resource_type?.toLowerCase() || ''))
  };

  // Completed roadmap milestones count
  const completedStages = (career.roadmaps || []).filter((stage, idx) => {
    const order = stage.stage_order || idx + 1;
    return roadmapProgress[career.id]?.[order] ?? !!stage.is_completed;
  }).length;
  const totalStages = career.roadmaps?.length || 5;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back Breadcrumb */}
      <div>
        <Link
          to="/careers"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Careers</span>
        </Link>
      </div>

      {/* Hero Header Card */}
      <Card className="p-6 sm:p-10 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary" size="md">
                {career.category}
              </Badge>
              <Badge variant="success" size="md">
                Est. Salary: {career.salary_range}
              </Badge>
              {career.education_level && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                  {career.education_level}
                </span>
              )}
              {career.min_experience && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                  <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                  Min: {career.min_experience}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {career.title}
            </h1>

            <p className="text-base text-slate-600 leading-relaxed">
              {career.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 flex-shrink-0">
            <Button
              variant="primary"
              size="md"
              onClick={handleStartRoadmap}
              leftIcon={<Layers className="w-4 h-4" />}
            >
              Start Roadmap
            </Button>

            <Button
              variant={isSaved ? 'tertiary' : 'secondary'}
              size="md"
              onClick={handleToggleSave}
              leftIcon={<Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />}
            >
              {isSaved ? 'Saved to Bookmarks' : 'Bookmark Career'}
            </Button>

            <Link to="/assessment">
              <Button variant="secondary" size="md" className="w-full" leftIcon={<Sparkles className="w-4 h-4 text-blue-600" />}>
                Assess Fit
              </Button>
            </Link>

            <Button
              variant="tertiary"
              size="md"
              onClick={() => window.print()}
              leftIcon={<Printer className="w-4 h-4 text-slate-500" />}
              className="w-full text-slate-600 hover:text-slate-900"
            >
              Print Pathway
            </Button>
          </div>
        </div>
      </Card>

      {/* User Personalized Fit Banner (If Assessment Done) */}
      {latestAssessment && (
        <Card className="p-6 border-blue-100 bg-gradient-to-r from-blue-50/50 via-white to-indigo-50/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-[11px] font-bold uppercase tracking-wider">
                  Personal Assessment Alignment
                </span>
                {matchingRec && (
                  <span className="text-xs font-bold text-slate-700">
                    Overall Fit: <strong className="text-blue-600">{matchingRec.match_score}%</strong>
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-700 font-medium">
                You currently possess <strong className="text-slate-900">{matchedSkills.length}</strong> of{' '}
                <strong className="text-slate-900">{allCareerSkills.length}</strong> relevant technical skills ({skillCoverage}% coverage).
              </p>
              {matchingRec?.why_it_matches && (
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  &ldquo;{matchingRec.why_it_matches}&rdquo;
                </p>
              )}
            </div>

            <div className="flex items-center gap-4 flex-shrink-0 bg-white p-3.5 rounded-xl border border-slate-200">
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-500 block">Technical Match</span>
                <span className="text-2xl font-black text-slate-900">{skillCoverage}%</span>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-slate-100 flex items-center justify-center relative">
                <svg className="w-12 h-12 -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="18"
                    stroke="#E2E8F0"
                    strokeWidth="3"
                    fill="none"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="18"
                    stroke="#2563EB"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={113}
                    strokeDashoffset={113 - (113 * skillCoverage) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-[11px] font-bold text-blue-600">{skillCoverage}%</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Two-Column Overview & Day-in-the-Life */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">Career Overview</h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {career.career_overview || career.description}
          </p>
        </Card>

        <Card className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">Day in the Life</h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {career.day_to_day || 'Day-to-day work involves collaborating with cross-functional technical teams, designing scalable modular architectures, writing clean and maintainable code, reviewing pull requests, analyzing operational telemetry, and participating in sprint planning.'}
          </p>
        </Card>
      </div>

      {/* Technical Skills: Required Core vs Preferred & Complementary */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-lg font-bold text-slate-900">Skill Requirements Breakdown</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Key capabilities required for production readiness vs preferred tools that enhance candidate positioning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Required Core Skills */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                Required Core Skills ({requiredSkills.length})
              </span>
              <span className="text-[11px] font-semibold text-slate-400">Essential</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {requiredSkills.map((s) => {
                const isUserPossessed = userSkills.has(s);
                return (
                  <div
                    key={s}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${
                      isUserPossessed
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {isUserPossessed && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    <span>{s}</span>
                    {isUserPossessed && (
                      <span className="text-[10px] font-bold text-blue-600 ml-0.5">(Acquired)</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Preferred & Tools */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                Preferred Skills & Ecosystem Tools ({preferredSkills.length})
              </span>
              <span className="text-[11px] font-semibold text-slate-400">Competitive Edge</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {preferredSkills.map((s) => {
                const isUserPossessed = userSkills.has(s);
                return (
                  <div
                    key={s}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${
                      isUserPossessed
                        ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    {isUserPossessed && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                    <span>{s}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Interests */}
        {career.interests && career.interests.length > 0 && (
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 mr-1">Aligned Interests:</span>
            {career.interests.map((interest) => (
              <span
                key={interest}
                className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium"
              >
                {interest}
              </span>
            ))}
          </div>
        )}
      </Card>

      {/* Tabs Section: Roadmap, Projects, Curated Resources */}
      <div ref={roadmapSectionRef} className="space-y-6 pt-2">
        <div className="flex items-center border-b border-slate-200 space-x-2 sm:space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'roadmap'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>5-Stage Learning Roadmap</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {completedStages}/{totalStages} done
            </span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'projects'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Portfolio Projects</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {career.projects?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('resources')}
            className={`py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'resources'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Curated Resources</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {career.resources?.length || 0}
            </span>
          </button>
        </div>

        {/* Tab 1: Roadmap */}
        {activeTab === 'roadmap' && (
          <Card className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Structured 5-Stage Curriculum</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Check off milestones as you master core concepts. Your progress is saved to your account.
                </p>
              </div>
              <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg self-start sm:self-auto">
                Progress: <strong className="text-blue-600">{Math.round((completedStages / totalStages) * 100)}%</strong>
              </div>
            </div>

            <RoadmapTimeline
              stages={(career.roadmaps || []).map((stage, idx) => {
                const order = stage.stage_order || idx + 1;
                const isCompleted = roadmapProgress[career.id]?.[order] ?? !!stage.is_completed;
                return {
                  ...stage,
                  stage_order: order,
                  is_completed: isCompleted
                };
              })}
              careerTitle={career.title}
              interactive={isAuthenticated}
              onToggleStage={(stageOrder, isDone) => {
                toggleRoadmapStage(career.id, stageOrder, isDone);
                showToast(
                  isDone 
                    ? `Stage ${stageOrder} completed.` 
                    : `Stage ${stageOrder} in progress.`,
                  'info'
                );
              }}
            />
          </Card>
        )}

        {/* Tab 2: Projects */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
              Portfolio projects prove practical competence to prospective employers. Implement these end-to-end to build a credible GitHub showcase.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(career.projects || []).map((project) => (
                <ProjectCard key={project.id || project.title} project={project} />
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Curated Resources Grouped by Type */}
        {activeTab === 'resources' && (
          <div className="space-y-6">
            {/* Documentation */}
            {groupedResources.documentation.length > 0 && (
              <Card className="p-6 space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Official Documentation & Technical Manuals
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {groupedResources.documentation.map((r) => (
                    <ResourceLinkCard key={r.id} resource={r} />
                  ))}
                </div>
              </Card>
            )}

            {/* Guided Tutorials & Courses */}
            {groupedResources.tutorial.length > 0 && (
              <Card className="p-6 space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Video className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Guided Courses & Comprehensive Tutorials
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {groupedResources.tutorial.map((r) => (
                    <ResourceLinkCard key={r.id} resource={r} />
                  ))}
                </div>
              </Card>
            )}

            {/* Certifications */}
            {groupedResources.certification.length > 0 && (
              <Card className="p-6 space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Industry Credentials & Certifications
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {groupedResources.certification.map((r) => (
                    <ResourceLinkCard key={r.id} resource={r} />
                  ))}
                </div>
              </Card>
            )}

            {/* Other */}
            {groupedResources.other.length > 0 && (
              <Card className="p-6 space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <BookOpen className="w-4 h-4 text-slate-600" />
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Additional Learning Materials
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {groupedResources.other.map((r) => (
                    <ResourceLinkCard key={r.id} resource={r} />
                  ))}
                </div>
              </Card>
            )}

            {(!career.resources || career.resources.length === 0) && (
              <Card className="p-8 text-center space-y-2">
                <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-medium text-slate-600">No resources registered for this path yet.</p>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper component for resource links
const ResourceLinkCard: React.FC<{ resource: Resource }> = ({ resource }) => {
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-slate-50/50 transition-all flex items-start justify-between gap-3 group"
    >
      <div className="space-y-1 min-w-0">
        <h5 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
          {resource.title}
        </h5>
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <span className="font-semibold">{resource.platform}</span>
          <span>•</span>
          <span className="capitalize">{resource.resource_type}</span>
        </div>
      </div>
      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 flex-shrink-0 transition-colors mt-0.5" />
    </a>
  );
};
