import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUserData } from '../context/UserDataContext';
import { useToast } from '../context/ToastContext';
import { apiClient } from '../api/client';
import { 
  Sparkles, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Search, 
  X, 
  AlertCircle 
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

const EDUCATION_OPTIONS = [
  {
    id: 'B.Sc Computer Science (TYCS / SYCS / FYCS)',
    title: 'B.Sc Computer Science (TYCS / SYCS / FYCS)',
    desc: 'Core computer science theory, algorithms, software engineering, and lab foundations.'
  },
  {
    id: 'Bachelor of Computer Applications (BCA)',
    title: 'Bachelor of Computer Applications (BCA)',
    desc: 'Applied computing, commercial application development, database management, and programming.'
  },
  {
    id: 'B.Tech / B.E. Computer Science / IT',
    title: 'B.Tech / B.E. Computer Science / IT',
    desc: 'Comprehensive engineering curriculum covering hardware systems, architectures, and networks.'
  },
  {
    id: 'Master of Computer Applications (MCA)',
    title: 'Master of Computer Applications (MCA)',
    desc: 'Advanced postgraduate software engineering, research projects, and systems specialization.'
  },
  {
    id: 'Diploma / Other Technical Degree',
    title: 'Diploma / Other Technical Degree',
    desc: 'Polytechnic diplomas, data bootcamps, or specialized certifications in technology.'
  }
];

const EXPERIENCE_OPTIONS = [
  {
    id: 'Beginner',
    title: 'Beginner',
    desc: 'Academic coursework labs, foundational exercises, and introductory personal mini-projects.'
  },
  {
    id: '1–2 Years',
    title: '1–2 Years',
    desc: 'Hands-on practical development, semester projects, or entry-level technical internships.'
  },
  {
    id: '3+ Years',
    title: '3+ Years',
    desc: 'Extensive portfolio development, multiple full-stack applications, or industry production work.'
  }
];

const FALLBACK_INTERESTS = [
  'Full Stack Web Development',
  'Data Science & Analytics',
  'Artificial Intelligence & Machine Learning',
  'Cybersecurity & Network Defense',
  'Cloud Architecture & DevOps',
  'Mobile Application Development',
  'Quality Assurance & Automated Testing',
  'UI/UX Engineering & Design Systems'
];

const FALLBACK_SKILLS: Record<string, string[]> = {
  'Programming Languages': ['Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'Go', 'HTML/CSS'],
  'Web & Backend Frameworks': ['React', 'Node.js', 'Express', 'Django', 'FastAPI', 'Spring Boot'],
  'Databases & Data': ['SQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Data Science', 'Pandas', 'PyTorch'],
  'Cloud & DevOps': ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'Linux'],
  'Security & Mobile': ['Network Security', 'Wireshark', 'Cryptography', 'Flutter', 'React Native']
};

export const AssessmentPage: React.FC = () => {
  const { user } = useAuth();
  const { refreshAllUserData } = useUserData();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Wizard state: 1 to 5
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Education
  const [education, setEducation] = useState<string>(user?.education || EDUCATION_OPTIONS[0].id);

  // Step 2: Experience
  const [experience, setExperience] = useState<string>(user?.experience_level || 'Beginner');

  // Step 3: Interests
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [availableInterests, setAvailableInterests] = useState<string[]>(FALLBACK_INTERESTS);

  // Step 4: Skills
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [availableSkills, setAvailableSkills] = useState<Record<string, string[]>>(FALLBACK_SKILLS);
  const [skillSearch, setSkillSearch] = useState<string>('');

  // Step 5: Career Goal
  const [hasGoal, setHasGoal] = useState<boolean>(!!user?.dream_career);
  const [dreamCareer, setDreamCareer] = useState<string>(user?.dream_career || '');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loadingPhase, setLoadingPhase] = useState<string>('Analyzing your skills and interests...');
  const [error, setError] = useState<string | null>(null);

  // Synchronize state if user profile finishes loading
  useEffect(() => {
    if (user?.education) setEducation(user.education);
    if (user?.experience_level) setExperience(user.experience_level);
    if (user?.dream_career) {
      setDreamCareer(user.dream_career);
      setHasGoal(true);
    }
  }, [user]);

  useEffect(() => {
    // Attempt live options loading
    apiClient.getOptions()
      .then((res) => {
        if (res.success && res.options) {
          if (res.options.interests?.length) setAvailableInterests(res.options.interests);
          if (res.options.skills_by_category) setAvailableSkills(res.options.skills_by_category);
        }
      })
      .catch(() => {
        // Fallbacks already present
      });
  }, []);

  useEffect(() => {
    const isDirty = (selectedInterests.length > 0 || selectedSkills.length > 0 || currentStep > 1) && !isSubmitting;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [selectedInterests.length, selectedSkills.length, currentStep, isSubmitting]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const removeSkill = (skill: string) => {
    setSelectedSkills((prev) => prev.filter((s) => s !== skill));
  };

  const handleNext = () => {
    setError(null);
    if (currentStep === 3 && selectedInterests.length === 0) {
      setError('Please select at least 1 domain of interest to continue.');
      return;
    }
    if (currentStep === 4 && selectedSkills.length === 0) {
      setError('Please select at least 1 technical skill to continue.');
      return;
    }
    setCurrentStep((prev) => Math.min(5, prev + 1));
  };

  const handleBack = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);
    setLoadingPhase('Analyzing your skills and interests...');

    const phaseTimer1 = setTimeout(() => {
      setLoadingPhase('Matching against 15+ career paths...');
    }, 600);

    const phaseTimer2 = setTimeout(() => {
      setLoadingPhase('Building your personalized roadmap...');
    }, 1200);

    try {
      const response = await apiClient.submitAssessment({
        education,
        experience_level: experience,
        interests: selectedInterests,
        skills: selectedSkills,
        dream_career: hasGoal && dreamCareer.trim() ? dreamCareer.trim() : undefined
      });

      // Ensure minimum 1.6s duration so user sees the deliberate matching stages
      await new Promise((resolve) => setTimeout(resolve, 1600));

      if (response.success) {
        const respAny = response as any;
        const allRecs = respAny.recommendations || (respAny.primary_recommendation ? [respAny.primary_recommendation, ...(respAny.alternative_recommendations || [])] : []);

        // Cache result in sessionStorage for instant preview
        sessionStorage.setItem('futurehub_latest_assessment', JSON.stringify({
          education,
          experience_level: experience,
          interests: selectedInterests,
          skills: selectedSkills,
          dream_career: hasGoal ? dreamCareer : '',
          primary_recommendation: respAny.primary_recommendation,
          alternative_recommendations: respAny.alternative_recommendations,
          recommendations: allRecs
        }));

        // Refresh global application user data so Dashboard is instantly hydrated
        await refreshAllUserData();

        showToast('Assessment completed. Recommendations updated.', 'success');
        navigate('/dashboard');
      } else {
        clearTimeout(phaseTimer1);
        clearTimeout(phaseTimer2);
        setError(response.error || 'Failed to generate recommendations. Please try again.');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      clearTimeout(phaseTimer1);
      clearTimeout(phaseTimer2);
      setError(err.message || 'An error occurred while generating recommendations.');
      setIsSubmitting(false);
    }
  };

  // Filter skills by search query
  const allSkillsList = Object.values(availableSkills).flat();
  const searchResults = skillSearch.trim()
    ? allSkillsList.filter((s) => s.toLowerCase().includes(skillSearch.toLowerCase()))
    : null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      {/* Wizard Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Interactive Guidance
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Career Assessment
            </h1>
          </div>
          <Badge variant="primary" size="md">
            Step {currentStep} of 5
          </Badge>
        </div>

        {/* Step Progress Bar */}
        <ProgressBar value={currentStep} max={5} />
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 text-sm" role="alert">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Step Content Container */}
      <Card className="p-6 sm:p-10 space-y-6">
        {/* STEP 1: EDUCATION */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                1. What is your current degree program?
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Select your academic qualification to evaluate standard industry entry thresholds.
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50/80 px-3.5 py-2 rounded-xl border border-blue-100">
              <span className="font-bold">Why this matters:</span>
              <span>Evaluates your academic background against formal industry thresholds and entry prerequisites.</span>
            </div>

            <div className="space-y-2.5 pt-2">
              {EDUCATION_OPTIONS.map((opt) => {
                const isSelected = education === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setEducation(opt.id)}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-sm text-slate-900">{opt.title}</div>
                      {isSelected && <Check className="w-4 h-4 text-blue-600 flex-shrink-0 ml-2" />}
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{opt.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: EXPERIENCE */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                2. Practical Experience Level
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Indicate your hands-on coding, academic labs, and internship background.
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50/80 px-3.5 py-2 rounded-xl border border-blue-100">
              <span className="font-bold">Why this matters:</span>
              <span>Calibrates realistic junior vs intermediate expectations in your learning roadmap and compensation model.</span>
            </div>

            <div className="space-y-3 pt-2">
              {EXPERIENCE_OPTIONS.map((opt) => {
                const isSelected = experience === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setExperience(opt.id)}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-sm text-slate-900">{opt.title}</div>
                      {isSelected && <Check className="w-4 h-4 text-blue-600 flex-shrink-0 ml-2" />}
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{opt.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: INTERESTS */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  3. Select Your Areas of Interest
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Which tech fields excite you the most? (Multiple selections allowed)
                </p>
              </div>
              <Badge variant="primary" size="sm">
                {selectedInterests.length} selected
              </Badge>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50/80 px-3.5 py-2 rounded-xl border border-blue-100">
              <span className="font-bold">Why this matters:</span>
              <span>Influences 30% of your matching score to ensure you pursue domains you genuinely enjoy working in.</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {availableInterests.map((interest) => {
                const isSelected = selectedInterests.includes(interest);
                return (
                  <button
                    type="button"
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`p-3.5 rounded-xl border text-xs sm:text-sm font-semibold transition text-left flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>{interest}</span>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: SKILLS */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  4. Current Technical Skills
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Select languages, tools, and platforms you have learned or practiced.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="primary" size="sm">
                  {selectedSkills.length} selected
                </Badge>
                {selectedSkills.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedSkills([])}
                    className="text-xs font-semibold text-slate-400 hover:text-red-600 cursor-pointer"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50/80 px-3.5 py-2 rounded-xl border border-blue-100">
              <span className="font-bold">Why this matters:</span>
              <span>Represents 45% of your matching score and directly drives your technical skill-gap checklist.</span>
            </div>

            {/* Selected Skills Chips Bar */}
            {selectedSkills.length > 0 && (
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex flex-wrap gap-1.5 items-center">
                <span className="text-[11px] font-bold text-blue-700 mr-1 uppercase">Selected:</span>
                {selectedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 text-white text-xs font-medium shadow-2xs"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:bg-blue-700 rounded-sm p-0.5 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Skill Search Filter */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                placeholder="Search skills (e.g., Python, React, Docker)..."
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Categorized Skills / Search View */}
            {searchResults ? (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 min-h-[100px]">
                {searchResults.length === 0 ? (
                  <div className="text-xs text-slate-400 italic text-center py-4">
                    No skills found matching "{skillSearch}"
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {searchResults.map((skill) => {
                      const isSelected = selectedSkills.includes(skill);
                      return (
                        <button
                          type="button"
                          key={skill}
                          onClick={() => toggleSkill(skill)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-white border border-slate-300 text-slate-700 hover:border-blue-500'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                          <span>{skill}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(availableSkills).map(([cat, skills]) => (
                  <div key={cat} className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      {cat}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map((skill) => {
                        const isSelected = selectedSkills.includes(skill);
                        return (
                          <button
                            type="button"
                            key={skill}
                            onClick={() => toggleSkill(skill)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-2xs'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3" />}
                            <span>{skill}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 5: CAREER GOAL & REVIEW */}
        {currentStep === 5 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                5. Career Goal & Assessment Review
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Verify your inputs before generating your tailored recommendations and roadmap.
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50/80 px-3.5 py-2 rounded-xl border border-blue-100">
              <span className="font-bold">Why this matters:</span>
              <span>Allows deterministic skill-gap benchmarking against a specific ambition if you have one in mind.</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setHasGoal(false)}
                className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                  !hasGoal
                    ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="font-bold text-sm text-slate-900">Open to Exploration</div>
                <div className="text-xs text-slate-500 mt-1">
                  Discover recommended roles purely based on strengths.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setHasGoal(true)}
                className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                  hasGoal
                    ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="font-bold text-sm text-slate-900">I Have a Target Career</div>
                <div className="text-xs text-slate-500 mt-1">
                  Specify a target role to check skill gap compatibility.
                </div>
              </button>
            </div>

            {hasGoal && (
              <div className="space-y-1.5 pt-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Target Career Name
                </label>
                <input
                  type="text"
                  value={dreamCareer}
                  onChange={(e) => setDreamCareer(e.target.value)}
                  placeholder="e.g., Cloud Solutions Architect, Full Stack Developer, Security Analyst"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            )}

            {/* Structured Step 5 Review Summary */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Assessment Selections Review
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Ready for scoring</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[11px] font-semibold">Degree Program</span>
                  <strong className="text-slate-900">{education}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-semibold">Experience Level</span>
                  <strong className="text-slate-900">{experience}</strong>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400 block text-[11px] font-semibold">Interests ({selectedInterests.length})</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedInterests.map((interest) => (
                      <span key={interest} className="px-2 py-0.5 rounded bg-slate-200/70 text-slate-800 text-[11px] font-medium">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400 block text-[11px] font-semibold">Skills Evaluated ({selectedSkills.length})</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedSkills.map((skill) => (
                      <span key={skill} className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                {hasGoal && dreamCareer.trim() && (
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block text-[11px] font-semibold">Target Ambition</span>
                    <strong className="text-blue-700">{dreamCareer.trim()}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Submission loading indicator */}
            {isSubmitting && (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-center gap-3 text-blue-900">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                <span className="text-sm font-semibold">{loadingPhase}</span>
              </div>
            )}
          </div>
        )}

        {/* Wizard Navigation Footer */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handleBack}
              disabled={isSubmitting}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </Button>
          ) : <div />}

          {currentStep < 5 ? (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleNext}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continue
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              rightIcon={<Sparkles className="w-4 h-4" />}
            >
              {isSubmitting ? loadingPhase : 'Generate My Career Recommendations'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
