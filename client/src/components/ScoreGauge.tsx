import React from 'react';
import { ScoreBreakdown } from '../types';

interface ScoreGaugeProps {
  score: number;
  breakdown?: ScoreBreakdown;
  careerTitle?: string;
  skillAlignmentScore?: number;
  showPraise?: boolean;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ 
  score, 
  breakdown, 
  careerTitle,
  skillAlignmentScore,
  showPraise = true 
}) => {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  let statusLabel = 'Exceptional Fit';
  let statusBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (clampedScore >= 85) {
    statusLabel = 'Exceptional Fit';
    statusBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (clampedScore >= 70) {
    statusLabel = 'Strong Match';
    statusBadgeClass = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (clampedScore >= 50) {
    statusLabel = 'Moderate Potential';
    statusBadgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
  } else {
    statusLabel = 'Developing Baseline';
    statusBadgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
  }

  return (
    <div 
      className="flex flex-col items-center text-center w-full max-w-xs"
      role="meter"
      aria-valuenow={clampedScore}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Career match score: ${clampedScore} percent (${statusLabel})`}
    >
      <div className="relative my-2">
        <svg viewBox="0 0 36 36" className="w-36 h-36 transform -rotate-90" aria-hidden="true">
          <path
            className="text-slate-100 stroke-current"
            strokeWidth="3.2"
            fill="none"
            d="M18 2.0845
               a 15.9155 15.9155 0 0 1 0 31.831
               a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className="text-blue-600 stroke-current transition-all duration-700 ease-out"
            strokeWidth="3.2"
            strokeDasharray={`${clampedScore}, 100`}
            strokeLinecap="round"
            fill="none"
            d="M18 2.0845
               a 15.9155 15.9155 0 0 1 0 31.831
               a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{clampedScore}%</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Overall Fit</span>
        </div>
      </div>

      {showPraise && (
        <div className="mt-2 space-y-1">
          <span className={`inline-block px-3 py-0.5 rounded-full border text-xs font-bold ${statusBadgeClass}`}>
            {statusLabel}
          </span>
          <p className="text-xs text-slate-500 max-w-[240px] mx-auto leading-relaxed">
            {careerTitle ? `Calculated fit for ${careerTitle}.` : 'Deterministic evaluation based on your skills and interests.'}
          </p>

          {typeof skillAlignmentScore === 'number' && (
            <div className="text-[11px] text-slate-400 pt-1">
              Technical Skill Alignment: <strong className="text-slate-700">{Math.round(skillAlignmentScore)}%</strong>
            </div>
          )}
        </div>
      )}

      {/* 4 Pillars Compact Breakdown */}
      {breakdown && (
        <div className="w-full mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-left">
          <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Skills (45%)</span>
            <span className="text-xs font-bold text-blue-600">{breakdown.skills_score} / 45 pts</span>
          </div>
          <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Interests (30%)</span>
            <span className="text-xs font-bold text-indigo-600">{breakdown.interest_score} / 30 pts</span>
          </div>
          <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Education (15%)</span>
            <span className="text-xs font-bold text-sky-600">{breakdown.education_score} / 15 pts</span>
          </div>
          <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Experience (10%)</span>
            <span className="text-xs font-bold text-teal-600">{breakdown.experience_score} / 10 pts</span>
          </div>
        </div>
      )}
    </div>
  );
};
