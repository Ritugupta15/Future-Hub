import React, { useState } from 'react';
import { SkillChecklistItem } from '../types';
import { CheckCircle2, Circle } from 'lucide-react';

interface SkillsChecklistProps {
  skills?: SkillChecklistItem[];
  matchingSkills?: string[];
  missingSkills?: string[];
  coveragePercent?: number;
  careerTitle?: string;
  limit?: number;
}

export const SkillsChecklist: React.FC<SkillsChecklistProps> = ({
  skills,
  matchingSkills,
  missingSkills,
  coveragePercent,
  careerTitle: _careerTitle,
  limit
}) => {
  // Local state for learning tracking
  const [checkedToLearn, setCheckedToLearn] = useState<string[]>([]);

  const toggleChecked = (skill: string) => {
    setCheckedToLearn((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  // If passed explicit matchingSkills and missingSkills arrays
  if (matchingSkills || missingSkills) {
    const matched = matchingSkills || [];
    const missing = missingSkills || [];
    const coverage = coveragePercent ?? Math.round((matched.length / Math.max(1, matched.length + missing.length)) * 100);

    return (
      <div className="space-y-6">
        {/* Coverage Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Your Skill Alignment</div>
            <h4 className="text-base font-extrabold text-slate-900 mt-0.5">
              {matched.length} of {Math.max(1, matched.length + missing.length)} core skills mastered ({coverage}%)
            </h4>
          </div>
          <div className="w-full sm:w-48 bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, coverage))}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Matching Skills Column */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                ✓
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Mastered Skills ({matched.length})
              </h4>
            </div>

            {matched.length === 0 ? (
              <p className="text-xs text-slate-500 p-3 bg-slate-50 rounded-xl border border-slate-200">
                No matching skills found in your evaluated baseline yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {matched.map((skill, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800"
                  >
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>{skill}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wide">
                      Mastered
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Missing Skills to Learn Column */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                ○
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Skills to Learn ({missing.length})
              </h4>
            </div>

            {missing.length === 0 ? (
              <p className="text-xs text-emerald-700 font-medium p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                All primary core skill requirements for this role are satisfied.
              </p>
            ) : (
              <ul className="space-y-2">
                {missing.map((skill, idx) => {
                  const isDone = checkedToLearn.includes(skill);
                  return (
                    <li
                      key={idx}
                      onClick={() => toggleChecked(skill)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium cursor-pointer transition ${
                        isDone
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-white border-slate-200 hover:border-amber-300 text-slate-800'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        )}
                        <span className={isDone ? 'line-through text-slate-400' : ''}>{skill}</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                        isDone ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-50 text-amber-800'
                      }`}>
                        {isDone ? 'In Progress' : 'To Learn'}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Fallback: simple skills array
  const displaySkills = limit && skills ? skills.slice(0, limit) : skills || [];

  return (
    <ul className="skills-check-list space-y-2">
      {displaySkills.map((item, idx) => {
        const isMastered = item.status === 'mastered';
        return (
          <li
            key={idx}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800"
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 className={`w-4 h-4 ${isMastered ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span className="skill-name">{item.name}</span>
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
              isMastered ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
            }`}>
              {isMastered ? 'Mastered' : 'To Learn'}
            </span>
          </li>
        );
      })}
    </ul>
  );
};
