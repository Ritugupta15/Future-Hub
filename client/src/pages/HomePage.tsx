import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Compass, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Award, 
  Target, 
  Code2, 
  Lock, 
  Cloud, 
  Cpu, 
  ChevronRight 
} from 'lucide-react';
import { HeroIllustration } from '../components/HeroIllustration';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

export const HomePage: React.FC = () => {
  const curatedRoles = [
    {
      id: 1,
      title: 'Full Stack Developer',
      category: 'Software Engineering',
      icon: Code2,
      desc: 'Build client-facing responsive interfaces and resilient backend systems with modern frameworks.',
      skills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript'],
      salary: '₹6,00,000 – ₹18,00,000 / yr'
    },
    {
      id: 3,
      title: 'Cloud Solutions Architect',
      category: 'Cloud & Infrastructure',
      icon: Cloud,
      desc: 'Architect scalable, fault-tolerant infrastructure and automate multi-cloud service deployments.',
      skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform'],
      salary: '₹8,00,000 – ₹24,00,000 / yr'
    },
    {
      id: 4,
      title: 'Cybersecurity Analyst',
      category: 'Security & Forensics',
      icon: Lock,
      desc: 'Protect corporate assets, perform vulnerability audits, and monitor enterprise threat detection.',
      skills: ['Network Security', 'Wireshark', 'Linux', 'Security Audits'],
      salary: '₹5,50,000 – ₹16,00,000 / yr'
    },
    {
      id: 2,
      title: 'AI / Machine Learning Engineer',
      category: 'Data Science & AI',
      icon: Cpu,
      desc: 'Develop deep learning pipelines, NLP applications, and predictive analytics platforms.',
      skills: ['Python', 'PyTorch', 'FastAPI', 'Pandas'],
      salary: '₹7,00,000 – ₹22,00,000 / yr'
    }
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-20 overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative pt-8 sm:pt-14 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Hero Column */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Career Guidance For The Next Generation</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
                Find a Career Path That Fits You.
              </h1>

              {/* Supporting Text */}
              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                FutureHub evaluates your academic background, current technical skills, domain passions, and practical experience to recommend genuine technology career paths with 100% explainable matching.
              </p>

              {/* CTA Row */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link to="/assessment">
                  <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Take Career Assessment
                  </Button>
                </Link>

                <Link to="/careers">
                  <Button size="lg" variant="secondary" leftIcon={<Compass className="w-4 h-4" />}>
                    Explore Careers
                  </Button>
                </Link>
              </div>

              {/* Trust Metric Micro-text */}
              <p className="text-xs text-slate-600 flex items-center gap-2 pt-1 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Free for university students • 2-minute assessment • Zero AI hallucinations</span>
              </p>
            </div>

            {/* Right Hero Column: Contained Tech Matrix Illustration */}
            <div className="lg:col-span-5 flex justify-center w-full">
              <HeroIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST / VALUE STRIP (Real Product Data Only) */}
      <section className="border-y border-slate-200/80 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-slate-900">15+</div>
              <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-600">
                Technology Careers
              </div>
            </div>

            <div className="space-y-1 border-l border-slate-100 sm:border-slate-200">
              <div className="text-3xl sm:text-4xl font-black text-blue-600">27</div>
              <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-600">
                Curated Skills
              </div>
            </div>

            <div className="space-y-1 border-l border-slate-100 sm:border-slate-200">
              <div className="text-3xl sm:text-4xl font-black text-indigo-600">5</div>
              <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-600">
                Roadmap Stages
              </div>
            </div>

            <div className="space-y-1 border-l border-slate-100 sm:border-slate-200">
              <div className="text-3xl sm:text-4xl font-black text-emerald-600">100%</div>
              <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-600">
                Deterministic Matching
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW FUTUREHUB WORKS (4 Clear Steps) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs uppercase font-extrabold tracking-widest text-blue-600">
            Transparent Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            How FutureHub Works
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            A structured path from your current academic baseline to a verified career roadmap.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Tell Us About You',
              desc: 'Select your degree, experience baseline, passionate domains, and mastered skills.'
            },
            {
              step: '02',
              title: 'Understand Your Strengths',
              desc: 'Our engine evaluates your competencies using our 45/30/15/10 mathematical formula.'
            },
            {
              step: '03',
              title: 'Discover Best Matches',
              desc: 'Review ranked career recommendations with complete score breakdowns and reasons.'
            },
            {
              step: '04',
              title: 'Build Your Roadmap',
              desc: 'Follow curated 5-stage milestones, study verified docs, and build resume-ready projects.'
            }
          ].map((item) => (
            <div 
              key={item.step} 
              className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 relative group hover:border-blue-300 hover:shadow-sm transition"
            >
              <div className="text-3xl font-black text-blue-600/30 group-hover:text-blue-600 transition-colors">
                {item.step}
              </div>
              <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. CAREER EXPLORATION PREVIEW (Curated 4 Cards) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-blue-600">
              Verified Industry Roles
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              High-Demand Career Pathways
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Curated salary ranges, core competencies, and progression roadmaps.
            </p>
          </div>
          <Link to="/careers">
            <Button variant="secondary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              View All 15 Careers
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {curatedRoles.map((role) => (
            <Card key={role.id} hoverable className="p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="primary" size="sm">
                    {role.category}
                  </Badge>
                  <role.icon className="w-4 h-4 text-slate-400" />
                </div>

                <h3 className="text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors">
                  {role.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {role.desc}
                </p>

                <div className="text-xs font-semibold text-slate-800 pt-1">
                  Salary: <span className="text-emerald-700 font-bold">{role.salary}</span>
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  {role.skills.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <Link
                  to={`/careers/${role.id}`}
                  className="inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-800 gap-1"
                >
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  to="/assessment"
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-800"
                >
                  Test Fit
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 5. FEATURES SECTION (4 Strong Cards) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs uppercase font-extrabold tracking-widest text-blue-600">
            Platform Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Designed for Practical Student Success
          </h2>
          <p className="text-sm text-slate-600">
            Everything you need to navigate tech roles without guesswork or confusing jargon.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Career Recommendation</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Explainable matching based on actual profile data with full mathematical transparency.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Learning Roadmap</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Structured 5-stage progression from core foundations to specialized portfolio projects.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Skill Gap Analysis</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Instantly identify skills you already have versus the critical competencies you should learn next.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Project Ideas</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Build practical, resume-worthy projects tied directly to your target career requirements.
            </p>
          </Card>
        </div>
      </section>

      {/* 6. PERSONALIZED JOURNEY SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-blue-400">
              The Guided Journey
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              From Student to Career Ready
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              FutureHub connects every stage of your career exploration into an actionable continuum.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
            {[
              { stage: 'Your Profile', desc: 'Academic baseline' },
              { stage: 'Career Match', desc: 'Weighted score' },
              { stage: 'Skill Gap', desc: 'Missing tools' },
              { stage: 'Roadmap', desc: '5 milestones' },
              { stage: 'Projects', desc: 'GitHub portfolio' },
              { stage: 'Career Ready', desc: 'Interview prepared' }
            ].map((node, idx) => (
              <div key={node.stage} className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-1">
                <div className="text-xs font-black text-blue-400">0{idx + 1}</div>
                <div className="text-sm font-bold text-white">{node.stage}</div>
                <div className="text-[11px] text-slate-400">{node.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FINAL CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Your future career starts with understanding where you are today.
        </h2>
        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
          Take the assessment now to receive verified match scores, transparent reasoning, and your personalized 5-stage roadmap.
        </p>
        <div>
          <Link to="/assessment">
            <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Discover My Career Path
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
