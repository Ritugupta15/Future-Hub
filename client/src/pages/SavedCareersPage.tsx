import React from 'react';
import { Link } from 'react-router-dom';
import { useUserData } from '../context/UserDataContext';
import { useToast } from '../context/ToastContext';
import { Bookmark, ArrowRight, Trash2, Compass, ChevronRight, Sparkles, Layers } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/Skeleton';

export const SavedCareersPage: React.FC = () => {
  const { savedCareers, isLoadingUserData, toggleSaveCareer, latestAssessment } = useUserData();
  const { showToast } = useToast();

  const handleRemove = async (careerId: number, _title: string) => {
    try {
      await toggleSaveCareer(careerId);
      showToast('Career removed from bookmarks.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to remove saved career.', 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Saved Career Paths
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Career paths you're keeping an eye on. Access roadmap stages, portfolio ideas, and required skills.
          </p>
        </div>

        <Link to="/careers">
          <Button variant="secondary" size="md" leftIcon={<Compass className="w-4 h-4 text-blue-600" />}>
            Explore All Careers
          </Button>
        </Link>
      </div>

      {isLoadingUserData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : savedCareers.length === 0 ? (
        <EmptyState
          icon={<Bookmark className="w-8 h-8 text-slate-400" />}
          title="Keep interesting career paths in one place"
          description="You haven't saved any career pathways yet. Explore our curated technology roles and bookmark the ones that align with your aspirations."
          action={
            <Link to="/careers">
              <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Explore Career Paths
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedCareers.map((item: any) => {
            const careerId = Number(item.career_id || item.id);
            const title = item.career_title || item.title || 'Tech Career';
            const category = item.career_category || item.category || 'Technology';
            const desc = item.career_description || item.description || '';
            const salary = item.salary_range || 'Competitive';
            const dateSaved = item.saved_at || item.created_at;

            // Check if user has an assessment match score for this career
            const rec = latestAssessment?.recommendations?.find(
              (r: any) => r.career_id === careerId || (r.career_title && r.career_title.toLowerCase() === title.toLowerCase())
            );

            return (
              <Card
                key={item.id || careerId}
                hoverable
                className="p-6 flex flex-col justify-between transition-micro border-slate-200 hover:border-blue-300"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="primary" size="sm">
                        {category}
                      </Badge>
                      {rec && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Sparkles className="w-3 h-3" />
                          {rec.match_score}% Match
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleRemove(careerId, title)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Remove from saved"
                      aria-label={`Remove ${title} from saved`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <Link to={`/careers/${careerId}`}>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors">
                      {title}
                    </h3>
                  </Link>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {desc}
                  </p>

                  <div className="text-xs text-slate-700 font-medium">
                    Salary Range: <span className="text-slate-900 font-bold">{salary}</span>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to={`/careers/${careerId}`}
                    className="inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-800 gap-1 group"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>View Roadmap</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  {dateSaved && (
                    <span className="text-[10px] text-slate-400 font-medium">
                      Saved {new Date(dateSaved).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
