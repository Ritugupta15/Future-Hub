import React from 'react';
import { RoadmapStage } from '../types';
import { CheckCircle2, Circle, Clock, Check } from 'lucide-react';
import { Badge } from './ui/Badge';

interface RoadmapTimelineProps {
  stages?: RoadmapStage[];
  roadmaps?: RoadmapStage[];
  careerTitle?: string;
  onToggleStage?: (stageOrder: number, isCompleted: boolean) => void;
  interactive?: boolean;
}

export const RoadmapTimeline: React.FC<RoadmapTimelineProps> = ({
  stages,
  roadmaps,
  careerTitle,
  onToggleStage,
  interactive = true
}) => {
  const allStages = roadmaps || stages || [];

  if (allStages.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 text-xs italic">
        No roadmap stages available for {careerTitle || 'this career'}.
      </div>
    );
  }

  const completedCount = allStages.filter((s) => !!s.is_completed).length;
  const totalCount = allStages.length;
  const percentCompleted = Math.round((completedCount / totalCount) * 100);

  // Find index of current stage (first incomplete stage)
  const currentStageIndex = allStages.findIndex((s) => !s.is_completed);

  return (
    <div className="space-y-6">
      {/* Curriculum Overview Header & Progress Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Curriculum Progression
          </div>
          <div className="text-sm font-bold text-slate-900 mt-0.5">
            {completedCount} / {totalCount} stages completed ({percentCompleted}%)
          </div>
        </div>

        <div className="w-full sm:w-56 bg-slate-200 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${percentCompleted}%` }}
          />
        </div>
      </div>

      {/* Stage Timeline */}
      <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 space-y-6 my-4 ml-3 sm:ml-4">
        {allStages.map((stage, idx) => {
          const order = stage.stage_order || idx + 1;
          const isDone = !!stage.is_completed;
          const isCurrent = idx === currentStageIndex;

          let statusLabel = 'Upcoming';
          let statusBadgeVariant: 'success' | 'primary' | 'neutral' = 'neutral';
          if (isDone) {
            statusLabel = 'Completed';
            statusBadgeVariant = 'success';
          } else if (isCurrent) {
            statusLabel = 'Current Stage';
            statusBadgeVariant = 'primary';
          }

          return (
            <div key={idx} className="relative group">
              {/* Timeline marker */}
              <div
                className={`absolute -left-[31px] sm:-left-[39px] top-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                  isDone
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                    : isCurrent
                    ? 'bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100 shadow-sm'
                    : 'bg-white border-slate-300 text-slate-400'
                }`}
              >
                {isDone ? <Check className="w-4 h-4" /> : order}
              </div>

              {/* Stage Card with Strong Visual Emphasis for Current Stage */}
              <div
                className={`rounded-xl p-5 border transition space-y-2.5 ${
                  isCurrent
                    ? 'bg-blue-50/40 border-blue-400 shadow-xs ring-1 ring-blue-400/20'
                    : isDone
                    ? 'bg-white border-slate-200 hover:border-slate-300'
                    : 'bg-slate-50/70 border-slate-200 hover:bg-white'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={statusBadgeVariant} size="sm">
                      {statusLabel}
                    </Badge>
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Stage {order} • {stage.period}</span>
                    </span>
                  </div>

                  {interactive && onToggleStage && (
                    <button
                      type="button"
                      onClick={() => onToggleStage(order, !isDone)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer self-start sm:self-auto ${
                        isDone
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          : isCurrent
                          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                      <span>{isDone ? 'Mark Incomplete' : isCurrent ? 'Mark Stage Complete' : 'Mark Done'}</span>
                    </button>
                  )}
                </div>

                <h4 className="text-sm sm:text-base font-bold text-slate-900">
                  {stage.focus}
                </h4>

                {stage.description && (
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {stage.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
