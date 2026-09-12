import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUserData } from '../context/UserDataContext';
import { useToast } from '../context/ToastContext';
import { apiClient } from '../api/client';
import { ResumeUploadCard } from '../components/ResumeUploadCard';
import { 
  User, 
  Mail, 
  GraduationCap, 
  Target, 
  Check, 
  AlertCircle, 
  Save, 
  Sparkles,
  FileText,
  Code2,
  FolderGit2,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export type ProfileTab = 'overview' | 'resume' | 'skills' | 'education_exp' | 'projects_certs' | 'goals_links';

export interface ProfilePageProps {
  initialTab?: ProfileTab;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ initialTab }) => {
  const routerLocation = useLocation();
  const searchParams = new URLSearchParams(routerLocation.search);
  const tabParam = searchParams.get('tab') as ProfileTab | null;
  const validTabs: ProfileTab[] = ['overview', 'resume', 'skills', 'education_exp', 'projects_certs', 'goals_links'];
  const defaultTab: ProfileTab = initialTab || (tabParam && validTabs.includes(tabParam) ? tabParam : (routerLocation.pathname === '/resume' ? 'resume' : 'overview'));

  const { user, setUser, refreshUser } = useAuth();
  const { refreshAllUserData, latestAssessment, fullProfile, profileCompleteness } = useUserData();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<ProfileTab>(defaultTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    } else if (routerLocation.pathname === '/resume') {
      setActiveTab('resume');
    } else if (tabParam && validTabs.includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [routerLocation.pathname, routerLocation.search, initialTab]);

  // Basic Identity Form State
  const [name, setName] = useState('');
  const [education, setEducation] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [year, setYear] = useState('');
  const [department, setDepartment] = useState('');
  const [dreamCareer, setDreamCareer] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');

  // Sub-resource States
  const [skills, setSkills] = useState<any[]>([]);
  const [educationList, setEducationList] = useState<any[]>([]);
  const [experienceList, setExperienceList] = useState<any[]>([]);
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [certificationsList, setCertificationsList] = useState<any[]>([]);
  
  // Goal & Link States
  const [targetRoles, setTargetRoles] = useState('');
  const [preferredDomains, setPreferredDomains] = useState('');
  const [targetTech, setTargetTech] = useState('');
  const [shortTermGoal, setShortTermGoal] = useState('');
  const [longTermGoal, setLongTermGoal] = useState('');

  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  // Inline Add Form States
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProficiency, setNewSkillProficiency] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [newSkillCategory, setNewSkillCategory] = useState('Programming');

  const [newEduInstitution, setNewEduInstitution] = useState('');
  const [newEduDegree, setNewEduDegree] = useState('');
  const [newEduMajor, setNewEduMajor] = useState('');
  const [newEduYear, setNewEduYear] = useState('');

  const [newExpOrg, setNewExpOrg] = useState('');
  const [newExpRole, setNewExpRole] = useState('');
  const [newExpTech, setNewExpTech] = useState('');
  const [newExpDesc, setNewExpDesc] = useState('');

  const [newProjName, setNewProjName] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjTech, setNewProjTech] = useState('');
  const [newProjGithub, setNewProjGithub] = useState('');

  const [newCertName, setNewCertName] = useState('');
  const [newCertIssuer, setNewCertIssuer] = useState('');
  const [newCertId, setNewCertId] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    loadFullProfile();
  }, []);

  const loadFullProfile = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.getFullProfile();
      if (res.success && res.data) {
        const b = res.data.basic;
        setName(b.name || '');
        setEducation(b.education || 'B.Sc Computer Science (TYCS / SYCS / FYCS)');
        setExperienceLevel(b.experience_level || 'Beginner');
        setYear(b.year || 'Third Year (TY)');
        setDepartment(b.department || 'Computer Science');
        setDreamCareer(b.dream_career || '');
        setBio(b.bio || '');
        setPhone(b.phone || '');
        setLocation(b.location || '');

        setSkills(res.data.skills || []);
        setEducationList(res.data.education || []);
        setExperienceList(res.data.experience || []);
        setProjectsList(res.data.projects || []);
        setCertificationsList(res.data.certifications || []);

        if (res.data.goals) {
          setTargetRoles(res.data.goals.target_roles || '');
          setPreferredDomains(res.data.goals.preferred_domains || '');
          setTargetTech(res.data.goals.target_tech || '');
          setShortTermGoal(res.data.goals.short_term_goal || '');
          setLongTermGoal(res.data.goals.long_term_goal || '');
        }

        if (res.data.links) {
          setGithubUrl(res.data.links.github_url || '');
          setLinkedinUrl(res.data.links.linkedin_url || '');
          setPortfolioUrl(res.data.links.portfolio_url || '');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error loading profile.');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if saved profile differs from the latest assessment snapshot
  const assessmentEducation = latestAssessment?.user_inputs?.education_level || latestAssessment?.education;
  const assessmentExperience = latestAssessment?.user_inputs?.experience_level || latestAssessment?.experience_level;
  const isOutOfSync = Boolean(
    latestAssessment &&
    ((assessmentEducation && education && assessmentEducation !== education) ||
     (assessmentExperience && experienceLevel && assessmentExperience !== experienceLevel))
  );

  // 1. Submit basic profile
  const handleSaveBasic = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    setErrorMessage(null);

    try {
      const res = await apiClient.updateProfile({
        name,
        education,
        experience_level: experienceLevel,
        year,
        department,
        dream_career: dreamCareer,
        bio,
        phone,
        location
      });

      if (res.success && res.data) {
        const updated = {
          ...(user || {}),
          name: res.data.name,
          education: res.data.education,
          experience_level: res.data.experience_level,
          year: res.data.year,
          department: res.data.department,
          dream_career: res.data.dream_career,
          bio: res.data.bio
        };
        setUser(updated as any);
        localStorage.setItem('futurehub_user', JSON.stringify(updated));
        
        await Promise.all([
          refreshUser(),
          refreshAllUserData(),
          loadFullProfile()
        ]);

        setSaveStatus('saved');
        showToast('Profile updated.', 'success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch (err: any) {
      setSaveStatus('error');
      setErrorMessage(err.message || 'Error updating profile.');
      showToast('Unable to save.', 'error');
    }
  };

  // 2. Add technical skill
  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    try {
      await apiClient.addProfileSkill({
        skill_name: newSkillName.trim(),
        proficiency_level: newSkillProficiency,
        category: newSkillCategory,
        source: 'manual'
      });
      setNewSkillName('');
      showToast('Skill added to profile.', 'success');
      await Promise.all([refreshAllUserData(), loadFullProfile()]);
    } catch (err: any) {
      showToast(err.message || 'Failed to add skill.', 'error');
    }
  };

  const handleDeleteSkill = async (name: string) => {
    try {
      await apiClient.deleteProfileSkill(name);
      showToast('Skill removed.', 'success');
      await Promise.all([refreshAllUserData(), loadFullProfile()]);
    } catch (err: any) {
      showToast(err.message || 'Failed to remove skill.', 'error');
    }
  };

  // 3. Add Education
  const handleAddEducation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEduInstitution.trim() || !newEduDegree.trim()) return;
    try {
      await apiClient.addProfileEducation({
        institution: newEduInstitution.trim(),
        degree: newEduDegree.trim(),
        major: newEduMajor.trim() || 'Computer Science',
        academic_year: newEduYear.trim()
      });
      setNewEduInstitution('');
      setNewEduDegree('');
      setNewEduMajor('');
      setNewEduYear('');
      showToast('Education record added.', 'success');
      await Promise.all([refreshAllUserData(), loadFullProfile()]);
    } catch (err: any) {
      showToast(err.message || 'Failed to add education.', 'error');
    }
  };

  const handleDeleteEducation = async (id: number) => {
    try {
      await apiClient.deleteProfileEducation(id);
      showToast('Education record deleted.', 'success');
      await Promise.all([refreshAllUserData(), loadFullProfile()]);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete education.', 'error');
    }
  };

  // 4. Add Experience
  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpOrg.trim() || !newExpRole.trim()) return;
    try {
      await apiClient.addProfileExperience({
        organization: newExpOrg.trim(),
        role: newExpRole.trim(),
        technologies: newExpTech.trim(),
        description: newExpDesc.trim()
      });
      setNewExpOrg('');
      setNewExpRole('');
      setNewExpTech('');
      setNewExpDesc('');
      showToast('Experience entry added.', 'success');
      await Promise.all([refreshAllUserData(), loadFullProfile()]);
    } catch (err: any) {
      showToast(err.message || 'Failed to add experience.', 'error');
    }
  };

  const handleDeleteExperience = async (id: number) => {
    try {
      await apiClient.deleteProfileExperience(id);
      showToast('Experience record deleted.', 'success');
      await Promise.all([refreshAllUserData(), loadFullProfile()]);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete experience.', 'error');
    }
  };

  // 5. Add Project
  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) return;
    try {
      await apiClient.addProfileProject({
        name: newProjName.trim(),
        description: newProjDesc.trim(),
        technologies: newProjTech.trim(),
        github_url: newProjGithub.trim()
      });
      setNewProjName('');
      setNewProjDesc('');
      setNewProjTech('');
      setNewProjGithub('');
      showToast('Project added.', 'success');
      await Promise.all([refreshAllUserData(), loadFullProfile()]);
    } catch (err: any) {
      showToast(err.message || 'Failed to add project.', 'error');
    }
  };

  const handleDeleteProject = async (id: number) => {
    try {
      await apiClient.deleteProfileProject(id);
      showToast('Project deleted.', 'success');
      await Promise.all([refreshAllUserData(), loadFullProfile()]);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete project.', 'error');
    }
  };

  // 6. Add Certification
  const handleAddCertification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCertName.trim() || !newCertIssuer.trim()) return;
    try {
      await apiClient.addProfileCertification({
        name: newCertName.trim(),
        issuer: newCertIssuer.trim(),
        credential_id: newCertId.trim()
      });
      setNewCertName('');
      setNewCertIssuer('');
      setNewCertId('');
      showToast('Certification added.', 'success');
      await Promise.all([refreshAllUserData(), loadFullProfile()]);
    } catch (err: any) {
      showToast(err.message || 'Failed to add certification.', 'error');
    }
  };

  const handleDeleteCertification = async (id: number) => {
    try {
      await apiClient.deleteProfileCertification(id);
      showToast('Certification deleted.', 'success');
      await Promise.all([refreshAllUserData(), loadFullProfile()]);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete certification.', 'error');
    }
  };

  // 7. Save Goals & Links
  const handleSaveGoalsAndLinks = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await Promise.all([
        apiClient.updateProfileGoals({
          target_roles: targetRoles,
          preferred_domains: preferredDomains,
          target_tech: targetTech,
          short_term_goal: shortTermGoal,
          long_term_goal: longTermGoal
        }),
        apiClient.updateProfileLinks({
          github_url: githubUrl,
          linkedin_url: linkedinUrl,
          portfolio_url: portfolioUrl
        })
      ]);
      showToast('Goals and professional links saved.', 'success');
      await Promise.all([refreshAllUserData(), loadFullProfile()]);
    } catch (err: any) {
      showToast(err.message || 'Failed to save goals or links.', 'error');
    }
  };

  const completeness = profileCompleteness || fullProfile?.completeness;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* 1. Header Credential & Identity Card */}
      <Card className="p-6 sm:p-8 border-slate-200 bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-sm flex-shrink-0">
              {name ? name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {name || 'Student Career Profile'}
                </h1>
                <Badge variant="primary">Verified Student</Badge>
                {isLoading && (
                  <span className="text-xs font-semibold text-blue-600 animate-pulse">Syncing...</span>
                )}
              </div>
              <p className="text-sm text-slate-600 font-medium flex items-center gap-2">
                <span>{education}</span>
                <span>•</span>
                <span>{experienceLevel}</span>
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {user?.email}
                </span>
                {dreamCareer && (
                  <span className="flex items-center gap-1 text-blue-600 font-medium">
                    <Target className="w-3.5 h-3.5" />
                    Target: {dreamCareer}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Completeness Gauge */}
          {completeness && (
            <div className="w-full md:w-64 p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5 flex-shrink-0">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Profile Completeness
                </span>
                <span className="text-blue-600 font-black">{completeness.score}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${completeness.score}%` }} 
                />
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight">
                {completeness.next_recommended_action}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* 2. Out of Sync Assessment Warning */}
      {isOutOfSync && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-900">Profile Credentials Changed</h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Your profile degree or experience baseline differs from your latest assessment snapshot.
              </p>
            </div>
          </div>
          <Link to="/assessment">
            <Button variant="primary" size="sm" leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
              Retake Assessment
            </Button>
          </Link>
        </div>
      )}

      {/* 3. Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          Overview & Basic Info
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('resume')}
          className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'resume'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          Resume / CV
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('skills')}
          className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'skills'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Code2 className="w-4 h-4" />
          Technical Skills ({skills.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('education_exp')}
          className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'education_exp'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Education & Experience
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('projects_certs')}
          className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'projects_certs'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FolderGit2 className="w-4 h-4" />
          Projects & Certifications
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('goals_links')}
          className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'goals_links'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Target className="w-4 h-4" />
          Career Goals & Links
        </button>
      </div>

      {/* 4. Tab Contents */}

      {/* TAB 1: OVERVIEW & BASIC INFO */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 sm:p-8 border-slate-200 bg-white">
              <form onSubmit={handleSaveBasic} className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Academic & Personal Identity</h3>
                  <p className="text-xs text-slate-500">Core information used across recommendations.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <Input
                    label="Email Address"
                    value={user?.email || ''}
                    disabled
                    helperText="Authentication identity (read-only)"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Degree Program"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    options={[
                      { value: 'B.Sc Computer Science (TYCS / SYCS / FYCS)', label: 'B.Sc Computer Science (TYCS / SYCS / FYCS)' },
                      { value: 'Bachelor of Computer Applications (BCA)', label: 'Bachelor of Computer Applications (BCA)' },
                      { value: 'B.Tech / B.E. Computer Science / IT', label: 'B.Tech / B.E. Computer Science / IT' },
                      { value: 'Master of Computer Applications (MCA)', label: 'Master of Computer Applications (MCA)' },
                      { value: 'Diploma / Other Technical Degree', label: 'Diploma / Other Technical Degree' }
                    ]}
                  />

                  <Select
                    label="Practical Experience Level"
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    options={[
                      { value: 'Beginner', label: 'Beginner (Academic coursework & personal labs)' },
                      { value: '1–2 Years', label: '1–2 Years (Internships & practical projects)' },
                      { value: '3+ Years', label: '3+ Years (Industry experience & deployed code)' }
                    ]}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Academic Year"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    options={[
                      { value: 'First Year (FY)', label: 'First Year (FY)' },
                      { value: 'Second Year (SY)', label: 'Second Year (SY)' },
                      { value: 'Third Year (TY)', label: 'Third Year (TY)' },
                      { value: 'Final Year / Graduate', label: 'Final Year / Graduate' }
                    ]}
                  />

                  <Input
                    label="Department / Major"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  />
                </div>

                <Input
                  label="Target Ambition / Dream Career"
                  value={dreamCareer}
                  onChange={(e) => setDreamCareer(e.target.value)}
                  placeholder="e.g. Cloud Solutions Architect, Full Stack Developer"
                />

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Bio / Professional Summary</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="w-full text-sm border border-slate-300 rounded-xl p-3 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    placeholder="Brief summary of your technical interests and aspirations..."
                  />
                </div>

                {errorMessage && (
                  <p className="text-xs text-red-600 font-medium">{errorMessage}</p>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={saveStatus === 'saving'}
                    leftIcon={<Save className="w-4 h-4" />}
                  >
                    {saveStatus === 'saved' ? 'Saved' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Completeness Checklist Sidebar */}
          <div className="space-y-6">
            <Card className="p-6 border-slate-200 bg-white">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Completeness Criteria
              </h3>
              <div className="space-y-2 text-xs">
                {completeness?.criteria.map((c) => (
                  <div key={c.key} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                    <span className={c.filled ? 'text-slate-800 font-medium' : 'text-slate-400'}>
                      {c.label}
                    </span>
                    {c.filled ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> +{c.weight}%
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium">0%</span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: RESUME / CV */}
      {activeTab === 'resume' && (
        <div className="space-y-6">
          <ResumeUploadCard />
        </div>
      )}

      {/* TAB 3: TECHNICAL SKILLS */}
      {activeTab === 'skills' && (
        <div className="space-y-8">
          {/* Add Skill Card */}
          <Card className="p-6 border-slate-200 bg-white">
            <form onSubmit={handleAddSkill} className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Add Technical Skill</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <Input
                    label="Skill Name"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    placeholder="e.g. Python, Docker, PostgreSQL"
                    required
                  />
                </div>
                <div>
                  <Select
                    label="Proficiency"
                    value={newSkillProficiency}
                    onChange={(e) => setNewSkillProficiency(e.target.value as any)}
                    options={[
                      { value: 'beginner', label: 'Beginner' },
                      { value: 'intermediate', label: 'Intermediate' },
                      { value: 'advanced', label: 'Advanced' }
                    ]}
                  />
                </div>
                <div>
                  <Select
                    label="Category"
                    value={newSkillCategory}
                    onChange={(e) => setNewSkillCategory(e.target.value)}
                    options={[
                      { value: 'Programming', label: 'Programming' },
                      { value: 'Web Development', label: 'Web Development' },
                      { value: 'Backend & Cloud', label: 'Backend & Cloud' },
                      { value: 'Data Science', label: 'Data Science' },
                      { value: 'Security', label: 'Security' }
                    ]}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" variant="primary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                  Add Skill
                </Button>
              </div>
            </form>
          </Card>

          {/* Skill List */}
          <Card className="p-6 border-slate-200 bg-white">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Confirmed Skills ({skills.length})</h3>
            {skills.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No skills documented yet. Add skills or upload a CV.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {skills.map((s) => (
                  <div key={s.id || s.skill_name} className="p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-2 bg-slate-50/50">
                    <div>
                      <div className="font-bold text-xs text-slate-900">{s.skill_name}</div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-500">
                        <span className="capitalize">{s.proficiency_level}</span>
                        <span>•</span>
                        <span className="bg-slate-200/80 px-1.5 py-0.2 rounded font-medium">{s.source || 'manual'}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteSkill(s.skill_name)}
                      className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                      title="Delete skill"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 4: EDUCATION & EXPERIENCE */}
      {activeTab === 'education_exp' && (
        <div className="space-y-8">
          {/* Education Form & List */}
          <Card className="p-6 border-slate-200 bg-white space-y-6">
            <h3 className="text-sm font-bold text-slate-900">Academic History</h3>
            <form onSubmit={handleAddEducation} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <Input
                label="Institution"
                value={newEduInstitution}
                onChange={(e) => setNewEduInstitution(e.target.value)}
                placeholder="e.g. City University"
                required
              />
              <Input
                label="Degree"
                value={newEduDegree}
                onChange={(e) => setNewEduDegree(e.target.value)}
                placeholder="e.g. B.Sc Computer Science"
                required
              />
              <Input
                label="Major / Focus"
                value={newEduMajor}
                onChange={(e) => setNewEduMajor(e.target.value)}
                placeholder="e.g. Software Engineering"
              />
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Input
                    label="Year / Period"
                    value={newEduYear}
                    onChange={(e) => setNewEduYear(e.target.value)}
                    placeholder="e.g. 2022–2025"
                  />
                </div>
                <Button type="submit" variant="secondary" size="md" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                  Add
                </Button>
              </div>
            </form>

            <div className="space-y-3 pt-2">
              {educationList.map((edu) => (
                <div key={edu.id} className="p-4 rounded-xl border border-slate-200 flex items-start justify-between gap-3 bg-slate-50/40">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{edu.degree}</h4>
                    <p className="text-xs text-slate-600">{edu.institution} {edu.major ? `• ${edu.major}` : ''}</p>
                    {edu.academic_year && <p className="text-[11px] text-slate-400 mt-1">{edu.academic_year}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteEducation(edu.id)}
                    className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* Experience Form & List */}
          <Card className="p-6 border-slate-200 bg-white space-y-6">
            <h3 className="text-sm font-bold text-slate-900">Internships & Professional Experience</h3>
            <form onSubmit={handleAddExperience} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="Organization"
                  value={newExpOrg}
                  onChange={(e) => setNewExpOrg(e.target.value)}
                  placeholder="e.g. Tech Solutions Inc."
                  required
                />
                <Input
                  label="Role / Title"
                  value={newExpRole}
                  onChange={(e) => setNewExpRole(e.target.value)}
                  placeholder="e.g. Web Development Intern"
                  required
                />
                <Input
                  label="Technologies"
                  value={newExpTech}
                  onChange={(e) => setNewExpTech(e.target.value)}
                  placeholder="e.g. React, Node.js, SQL"
                />
              </div>
              <Input
                label="Summary / Responsibilities"
                value={newExpDesc}
                onChange={(e) => setNewExpDesc(e.target.value)}
                placeholder="Brief description of work done..."
              />
              <div className="flex justify-end">
                <Button type="submit" variant="secondary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                  Add Experience
                </Button>
              </div>
            </form>

            <div className="space-y-3 pt-2">
              {experienceList.map((exp) => (
                <div key={exp.id} className="p-4 rounded-xl border border-slate-200 flex items-start justify-between gap-3 bg-slate-50/40">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{exp.role}</h4>
                    <p className="text-xs text-slate-600">{exp.organization}</p>
                    {exp.technologies && <p className="text-xs text-blue-600 font-medium mt-1">Tech: {exp.technologies}</p>}
                    {exp.description && <p className="text-xs text-slate-500 mt-1">{exp.description}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteExperience(exp.id)}
                    className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 5: PROJECTS & CERTIFICATIONS */}
      {activeTab === 'projects_certs' && (
        <div className="space-y-8">
          {/* Projects */}
          <Card className="p-6 border-slate-200 bg-white space-y-6">
            <h3 className="text-sm font-bold text-slate-900">Portfolio Projects</h3>
            <form onSubmit={handleAddProject} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="Project Title"
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  placeholder="e.g. Distributed Task Queue"
                  required
                />
                <Input
                  label="Technologies Used"
                  value={newProjTech}
                  onChange={(e) => setNewProjTech(e.target.value)}
                  placeholder="e.g. Go, Redis, Docker"
                />
                <Input
                  label="GitHub Repository URL"
                  value={newProjGithub}
                  onChange={(e) => setNewProjGithub(e.target.value)}
                  placeholder="https://github.com/..."
                />
              </div>
              <Input
                label="Description & Outcomes"
                value={newProjDesc}
                onChange={(e) => setNewProjDesc(e.target.value)}
                placeholder="Describe key architectural decisions and metrics..."
              />
              <div className="flex justify-end">
                <Button type="submit" variant="secondary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                  Add Project
                </Button>
              </div>
            </form>

            <div className="space-y-3 pt-2">
              {projectsList.map((proj) => (
                <div key={proj.id} className="p-4 rounded-xl border border-slate-200 flex items-start justify-between gap-3 bg-slate-50/40">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{proj.name}</h4>
                    {proj.technologies && <p className="text-xs text-blue-600 font-medium">{proj.technologies}</p>}
                    {proj.description && <p className="text-xs text-slate-500 mt-1">{proj.description}</p>}
                    {proj.github_url && (
                      <a href={proj.github_url} target="_blank" rel="noreferrer" className="text-xs text-slate-700 hover:text-blue-600 font-semibold inline-flex items-center gap-1 mt-2">
                        <ExternalLink className="w-3 h-3" /> View Code Repository
                      </a>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteProject(proj.id)}
                    className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* Certifications */}
          <Card className="p-6 border-slate-200 bg-white space-y-6">
            <h3 className="text-sm font-bold text-slate-900">Industry Certifications</h3>
            <form onSubmit={handleAddCertification} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <Input
                label="Certification Name"
                value={newCertName}
                onChange={(e) => setNewCertName(e.target.value)}
                placeholder="e.g. AWS Cloud Practitioner"
                required
              />
              <Input
                label="Issuing Organization"
                value={newCertIssuer}
                onChange={(e) => setNewCertIssuer(e.target.value)}
                placeholder="e.g. Amazon Web Services"
                required
              />
              <Input
                label="Credential ID"
                value={newCertId}
                onChange={(e) => setNewCertId(e.target.value)}
                placeholder="Optional ID"
              />
              <div className="flex items-end">
                <Button type="submit" variant="secondary" size="md" className="w-full" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                  Add
                </Button>
              </div>
            </form>

            <div className="space-y-3 pt-2">
              {certificationsList.map((cert) => (
                <div key={cert.id} className="p-4 rounded-xl border border-slate-200 flex items-start justify-between gap-3 bg-slate-50/40">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{cert.name}</h4>
                    <p className="text-xs text-slate-600">{cert.issuer}</p>
                    {cert.credential_id && <p className="text-[11px] text-slate-400 mt-1">ID: {cert.credential_id}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteCertification(cert.id)}
                    className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 6: CAREER GOALS & LINKS */}
      {activeTab === 'goals_links' && (
        <Card className="p-6 sm:p-8 border-slate-200 bg-white">
          <form onSubmit={handleSaveGoalsAndLinks} className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Career Trajectory & Online Presence</h3>
              <p className="text-xs text-slate-500">Fine-tune your ambition targets and link your public engineering profiles.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Target Roles"
                value={targetRoles}
                onChange={(e) => setTargetRoles(e.target.value)}
                placeholder="e.g. Backend Engineer, Site Reliability Engineer"
              />
              <Input
                label="Preferred Domains"
                value={preferredDomains}
                onChange={(e) => setPreferredDomains(e.target.value)}
                placeholder="e.g. Cloud Infrastructure, Distributed Systems"
              />
            </div>

            <Input
              label="Target Technologies"
              value={targetTech}
              onChange={(e) => setTargetTech(e.target.value)}
              placeholder="e.g. Kubernetes, Terraform, Go, Rust"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Short-Term Goal (6–12 Months)</label>
                <textarea
                  value={shortTermGoal}
                  onChange={(e) => setShortTermGoal(e.target.value)}
                  rows={2}
                  className="w-full text-xs border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  placeholder="e.g. Secure a Summer Backend Engineering Internship"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Long-Term Goal (2–4 Years)</label>
                <textarea
                  value={longTermGoal}
                  onChange={(e) => setLongTermGoal(e.target.value)}
                  rows={2}
                  className="w-full text-xs border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  placeholder="e.g. Lead architecture for cloud-native systems"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Public Engineering Links</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="GitHub Profile"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/..."
                />
                <Input
                  label="LinkedIn Profile"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                />
                <Input
                  label="Portfolio / Website"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://yourname.dev"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" size="md" leftIcon={<Save className="w-4 h-4" />}>
                Save Goals & Links
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};
