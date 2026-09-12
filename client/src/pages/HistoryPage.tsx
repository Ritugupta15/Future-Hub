import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserData } from '../context/UserDataContext';
import { 
  History, 
  Sparkles, 
  ArrowRight, 
  Calendar, 
  Wrench, 
  Heart, 
  TrendingUp, 
  TrendingDown, 
  Minus
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/Skeleton';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { history, isLoadingUserData, setActiveAssessmentDetail } = useUserData();

  const handleViewAssessment = (record: any) => {
    setActiveAssessmentDetail(record);
    sessionStorage.setItem('futurehub_latest_assessment', JSON.stringify({
      education: record.education,
      experience_level: record.experience_level,
      interests: record.interests,
      skills: record.skills,
      dream_career: record.dream_career,
      recommendations: record.recommendations
    }));
    navigate('/dashboard');
  };

  // Calculate overall trend if 2 or more assessments exist
  const hasMultipleAssessments = history.length >= 2;
  const latestRecScore = history[0]?.recommendations?.[0]?.match_score ?? 0;
  const oldestRecScore = history[history.length - 1]?.recommendations?.[0]?.match_score ?? 0;
  const overallDiff = latestRecScore - oldestRecScore;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Assessment & Match History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review snapshots of past career assessments and track your skill progression over time.
          </p>
        </div>

        <Link to="/assessment">
          <Button variant="primary" size="md" leftIcon={<Sparkles className="w-4 h-4" />}>
            Take New Assessment
          </Button>
        </Link>
      </div>

      {/* Progression Banner if >= 2 assessments */}
      {hasMultipleAssessments && (
        <Card className="p-5 border-blue-100 bg-gradient-to-r from-blue-50/60 via-indigo-50/30 to-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block">
                  Evaluation Trajectory ({history.length} Assessments Completed)
                </span>
                <p className="text-sm font-semibold text-slate-800">
                  Initial match: <strong className="text-slate-900">{oldestRecScore}%</strong> &rarr; Current match:{' '}
                  <strong className="text-blue-600">{latestRecScore}%</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold ${
                  overallDiff > 0
                    ? 'bg-emerald-100 text-emerald-800'
                    : overallDiff < 0
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {overallDiff > 0 && <TrendingUp className="w-3.5 h-3.5" />}
                {overallDiff < 0 && <TrendingDown className="w-3.5 h-3.5" />}
                {overallDiff === 0 && <Minus className="w-3.5 h-3.5" />}
                <span>
                  {overallDiff > 0 ? `+${overallDiff}% Total Progress` : overallDiff < 0 ? `${overallDiff}% Adjustment` : 'Consistent Match'}
                </span>
              </span>
            </div>
          </div>
        </Card>
      )}

      {isLoadingUserData ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : history.length === 0 ? (
        <EmptyState
          icon={<History className="w-8 h-8 text-slate-400" />}
          title="No assessment history found"
          description="You haven't completed any assessments yet. Take the 2-minute assessment to discover your career recommendations and start building your profile history."
          action={
            <Link to="/assessment">
              <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Take 2-Minute Assessment
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {history.map((record, index) => {
            const topRec = record.recommendations?.[0];
            const prevRecord = history[index + 1];
            const prevTopScore = prevRecord?.recommendations?.[0]?.match_score;
            const hasPrev = prevTopScore !== undefined;
            const diff = hasPrev && topRec ? topRec.match_score - prevTopScore : null;

            return (
              <Card
                key={record.id}
                hoverable
                className="p-6 space-y-4 transition-micro border-slate-200 hover:border-blue-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>
                      Assessment Snapshot: {new Date(record.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}{' '}
                      at{' '}
                      {new Date(record.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {index === 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 ml-1">
                        Active Latest
                      </span>
                    )}
                  </div>
                  <Badge variant="neutral" size="sm">
                    {record.education} • {record.experience_level}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  <div className="md:col-span-2 space-y-2.5">
                    <div className="text-xs text-slate-600 flex items-start gap-2">
                      <Heart className="w-3.5 h-3.5 text-rose-500 mt-0.5 flex-shrink-0" />
                      <span>
                        Interests:{' '}
                        <strong className="text-slate-900">
                          {Array.isArray(record.interests) ? record.interests.join(', ') : 'None specified'}
                        </strong>
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 flex items-start gap-2">
                      <Wrench className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>
                        Skills Evaluated:{' '}
                        <strong className="text-slate-900">
                          {Array.isArray(record.skills) ? `${record.skills.length} technical skills` : '0 skills'}
                        </strong>{' '}
                        <span className="text-slate-400">
                          ({Array.isArray(record.skills) ? record.skills.slice(0, 4).join(', ') + (record.skills.length > 4 ? '...' : '') : ''})
                        </span>
                      </span>
                    </div>

                    {record.dream_career && (
                      <div className="text-xs text-slate-600">
                        Target Aspiration:{' '}
                        <span className="font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {record.dream_career}
                        </span>
                      </div>
                    )}
                  </div>

                  {topRec && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-[10px] uppercase font-bold text-blue-700 tracking-wider">Top Recommendation</div>
                        <div className="text-sm font-bold text-slate-900 line-clamp-1">{topRec.career_title}</div>
                        <div className="text-xs text-slate-500">{topRec.category}</div>
                      </div>
                      <div className="text-right flex-shrink-0 pl-3">
                        <div className="text-2xl font-black text-blue-600">{topRec.match_score}%</div>
                        {diff !== null && (
                          <div className={`text-[10px] font-bold ${diff >= 0 ? 'text-emerald-600' : 'text-slate-500'}`}>
                            {diff > 0 ? `+${diff}% vs prior` : diff < 0 ? `${diff}% vs prior` : 'Equal to prior'}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    Generated <strong className="text-slate-700">{record.recommendations?.length || 0}</strong> pathway matches
                  </div>

                  <button
                    type="button"
                    onClick={() => handleViewAssessment(record)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer group"
                  >
                    <span>Load Into Active Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
