import React from 'react';
import { Compass, CheckCircle2, Layers, Award, BarChart3 } from 'lucide-react';

export const HeroIllustration: React.FC = () => {
  return (
    <div className="relative w-full max-w-lg mx-auto select-none">
      {/* Background Soft Glow */}
      <div className="absolute inset-0 bg-blue-100/50 rounded-3xl blur-2xl -z-10 transform scale-95" />

      {/* Main Career Match Showcase Card with Double-Bezel */}
      <div className="relative bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
        {/* Top Status Bar with Preview Tag */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 leading-tight">Career Match Matrix</div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Product Preview</div>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Deterministic Model
          </span>
        </div>

        {/* Featured Career Header */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider">Top Recommendation</span>
            <h4 className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
              Full Stack Developer
            </h4>
            <div className="text-xs text-slate-500 mt-0.5">Software Engineering Domain</div>
          </div>
          <div className="flex-shrink-0 text-right">
            <div className="text-2xl sm:text-3xl font-black text-blue-600 tracking-tight">94%</div>
            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Overall Fit</div>
          </div>
        </div>

        {/* 4 Multi-Factor Evaluation Bars */}
        <div className="space-y-2.5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-600 flex justify-between">
            <span>Score Breakdown</span>
            <span>45 / 30 / 15 / 10 Formula</span>
          </div>

          {/* Skills (45%) */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                Technical Skills (45%)
              </span>
              <span className="font-bold text-blue-700">42 / 45 pts</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full" style={{ width: '93%' }} />
            </div>
          </div>

          {/* Interests (30%) */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
                Domain Interests (30%)
              </span>
              <span className="font-bold text-indigo-700">30 / 30 pts</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full" style={{ width: '100%' }} />
            </div>
          </div>

          {/* Education (15%) */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-600" />
                Degree Fit (15%)
              </span>
              <span className="font-bold text-sky-700">15 / 15 pts</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-sky-600 h-full rounded-full" style={{ width: '100%' }} />
            </div>
          </div>

          {/* Experience (10%) */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-600" />
                Practical Labs & Exp (10%)
              </span>
              <span className="font-bold text-teal-700">7 / 10 pts</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-teal-600 h-full rounded-full" style={{ width: '70%' }} />
            </div>
          </div>
        </div>

        {/* Floating Tag Badges */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-600">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            5-Stage Curriculum
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            Practical Projects
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200">
            <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
            Skill-Gap Analysis
          </span>
        </div>
      </div>
    </div>
  );
};
