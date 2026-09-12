import React from 'react';
import { Link } from 'react-router-dom';
import { AboutIllustration } from '../components/AboutIllustration';
import { 
  ShieldCheck, 
  Database, 
  Lock, 
  ArrowRight
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero / Concept Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-5">
          <Badge variant="primary" size="md">
            Academic Architecture
          </Badge>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            About FutureHub & The Deterministic Guidance Engine
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            FutureHub was built to solve the rampant ambiguity in undergraduate student career choices. Rather than relying on opaque chatbot predictions or static advice, FutureHub provides <strong>verifiable mathematical matching</strong>, structured 5-stage progression roadmaps, and real-world portfolio project specifications.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link to="/assessment">
              <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Test The Algorithm
              </Button>
            </Link>
            <Link to="/careers">
              <Button variant="secondary" size="md">
                Explore 15 Pathways
              </Button>
            </Link>
          </div>
        </div>

        <div className="lg:col-span-5 flex justify-center">
          <AboutIllustration />
        </div>
      </div>

      {/* 2. Transparent Matching Formula Breakdown */}
      <Card className="p-8 sm:p-12 space-y-8">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs uppercase font-bold tracking-wider text-blue-600">Deterministic Engine</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            The 45 / 30 / 15 / 10 Evaluation Formula
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Every career compatibility percentage in FutureHub is calculated using an explainable, deterministic multi-factor weighted equation:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-3">
            <div className="text-3xl font-black text-blue-600">45%</div>
            <h4 className="font-bold text-slate-900 text-base">Technical Skill Overlap</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Jaccard-weighted index measuring the student's mastered skills against the career's required competency matrix.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3">
            <div className="text-3xl font-black text-indigo-600">30%</div>
            <h4 className="font-bold text-slate-900 text-base">Domain Interest Alignment</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cross-correlates student's declared tech passions (AI, Cloud, Security, Web, etc.) with the target domain.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-sky-50/60 border border-sky-100 space-y-3">
            <div className="text-3xl font-black text-sky-600">15%</div>
            <h4 className="font-bold text-slate-900 text-base">Academic Qualification</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Assesses academic compatibility (B.Sc CS, BCA, B.Tech, MCA) with standard industry entry thresholds.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-teal-50/60 border border-teal-100 space-y-3">
            <div className="text-3xl font-black text-teal-600">10%</div>
            <h4 className="font-bold text-slate-900 text-base">Practical Experience</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Evaluates lab, coursework, and internship duration against typical junior/entry-level requirements.
            </p>
          </div>
        </div>
      </Card>

      {/* 3. Security & Anti-IDOR Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-900 text-base">Zero IDOR / BOLA Guarantee</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            All user-specific data (profile, assessments, saved careers, roadmap progress) is strictly queried using the verified JWT user ID from the session token. Client-supplied IDs are never trusted for authorization.
          </p>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Lock className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-900 text-base">Bcrypt & Security Headers</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Passwords are encrypted with bcrypt (10 rounds). Helmet headers prevent clickjacking, MIME-sniffing, and XSS. Sensitive auth routes are protected by IP rate limiting.
          </p>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Database className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-900 text-base">Native Node.js SQLite</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Built using Node 24 native <code className="text-slate-800 font-mono bg-slate-100 px-1 py-0.5 rounded">node:sqlite</code> (<code className="text-slate-800 font-mono bg-slate-100 px-1 py-0.5 rounded">DatabaseSync</code>), eliminating heavy native build toolchains while ensuring ACID compliance and instant local startup.
          </p>
        </Card>
      </div>

      {/* 4. Academic Attribution & Tech Stack */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-blue-400">Academic Project</span>
            <h3 className="text-xl sm:text-2xl font-bold mt-1">TYCS Final Year Capstone Project</h3>
            <p className="text-xs text-slate-400 mt-0.5">Department of Computer Science • FutureHub Guidance System</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="neutral" size="sm" className="bg-slate-800 text-slate-300 border-slate-700">
              React 19 + TypeScript
            </Badge>
            <Badge variant="neutral" size="sm" className="bg-slate-800 text-slate-300 border-slate-700">
              Node 24 + Express
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-400">
          <div>
            <strong className="text-white block mb-1">Architecture:</strong>
            Full-Stack REST + Single Page App (SPA)
          </div>
          <div>
            <strong className="text-white block mb-1">Database:</strong>
            Native SQLite DatabaseSync
          </div>
          <div>
            <strong className="text-white block mb-1">Design System:</strong>
            Tailwind v4 Design Tokens
          </div>
          <div>
            <strong className="text-white block mb-1">Automated QA:</strong>
            26 Jest Unit, Security & Algorithmic Tests
          </div>
        </div>
      </div>
    </div>
  );
};
