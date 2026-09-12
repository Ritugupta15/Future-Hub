import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { Career } from '../types';
import { 
  Compass, 
  Search, 
  Filter, 
  Bookmark,
  ChevronRight,
  GraduationCap,
  ArrowUpDown,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUserData } from '../context/UserDataContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { CardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';

export const CareerExplorerPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { isCareerSaved, toggleSaveCareer, latestAssessment } = useUserData();
  const { showToast } = useToast();

  const [careers, setCareers] = useState<Career[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'match' | 'alphabetical' | 'category'>('alphabetical');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Map career ID to match score if user has taken assessment
  const careerScoreMap = useMemo(() => {
    const map = new Map<number, number>();
    if (!latestAssessment) return map;

    const primary = latestAssessment.primary_recommendation || latestAssessment.details?.primary_recommendation;
    const alts = latestAssessment.alternative_recommendations || latestAssessment.details?.alternative_recommendations || [];
    const recs = latestAssessment.recommendations || [];

    if (primary) {
      map.set(Number(primary.id || primary.career_id), Math.round(primary.match_score || 0));
    }
    alts.forEach((r: any) => {
      map.set(Number(r.id || r.career_id), Math.round(r.match_score || 0));
    });
    recs.forEach((r: any) => {
      map.set(Number(r.id || r.career_id), Math.round(r.match_score || 0));
    });

    return map;
  }, [latestAssessment]);

  useEffect(() => {
    loadCareers();
  }, []);

  // When assessment scores become available, allow matching sort
  useEffect(() => {
    if (careerScoreMap.size > 0) {
      setSortBy('match');
    }
  }, [careerScoreMap]);

  const loadCareers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [careersRes, categoriesRes] = await Promise.all([
        apiClient.getCareers(),
        apiClient.getCategories()
      ]);

      if (careersRes.success && careersRes.data) {
        setCareers(careersRes.data);
      } else {
        setError('Unable to load career catalog.');
      }

      if (categoriesRes.success && categoriesRes.data) {
        setCategories(['All', ...categoriesRes.data]);
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching career catalog.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort careers
  const filteredCareers = useMemo(() => {
    let result = [...careers];

    if (selectedCategory !== 'All') {
      result = result.filter((c) => c.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.skills?.some((s) => s.toLowerCase().includes(q))
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'match' && careerScoreMap.size > 0) {
        const scoreA = careerScoreMap.get(a.id) || 0;
        const scoreB = careerScoreMap.get(b.id) || 0;
        if (scoreA !== scoreB) return scoreB - scoreA;
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'alphabetical') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'category') {
        return a.category.localeCompare(b.category);
      }
      return a.title.localeCompare(b.title);
    });

    return result;
  }, [careers, selectedCategory, searchQuery, sortBy, careerScoreMap]);

  const toggleSave = async (e: React.MouseEvent, careerId: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      showToast('Please sign in to bookmark careers.', 'info');
      return;
    }

    try {
      const nowSaved = await toggleSaveCareer(careerId);
      showToast(
        nowSaved ? 'Career saved.' : 'Career removed from bookmarks.',
        nowSaved ? 'success' : 'info'
      );
    } catch (e: any) {
      showToast(e.message || 'Error updating bookmark.', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="space-y-2">
        <Badge variant="primary" size="sm">
          Career Directory
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Explore Technology Careers
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
          Compare career paths and understand what each one requires. Browse verified skill prerequisites, realistic compensation, and 5-stage learning roadmaps.
        </p>
      </div>

      {/* Controls: Search, Sorting, and Category Pills */}
      <Card className="p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or keyword..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <ArrowUpDown className="w-4 h-4 text-slate-400 hidden sm:inline" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
              aria-label="Sort careers"
            >
              {careerScoreMap.size > 0 && (
                <option value="match">Sort: Highest Match</option>
              )}
              <option value="alphabetical">Sort: Alphabetical (A–Z)</option>
              <option value="category">Sort: Category</option>
            </select>
          </div>
        </div>

        {/* Category filter pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </Card>

      {/* Error state */}
      {error && (
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl flex flex-col items-center justify-center space-y-3 text-center">
          <AlertCircle className="w-8 h-8 text-red-500" />
          <div className="text-sm font-bold text-red-800">{error}</div>
          <Button variant="secondary" size="sm" onClick={loadCareers}>
            Try Again
          </Button>
        </div>
      )}

      {/* Career Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredCareers.length === 0 ? (
        <EmptyState
          icon={<Compass className="w-7 h-7" />}
          title="No careers found"
          description={`We couldn't find any careers matching "${searchQuery}". Try searching for another term or selecting "All" categories.`}
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
            >
              Reset Filters
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCareers.map((career) => {
            const isSaved = isCareerSaved(career.id);
            const userScore = careerScoreMap.get(career.id);

            return (
              <Card
                key={career.id}
                hoverable
                className="p-6 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="primary" size="sm">
                        {career.category}
                      </Badge>
                      {typeof userScore === 'number' && userScore > 0 && (
                        <Badge variant="success" size="sm">
                          <Sparkles className="w-3 h-3 text-emerald-600 mr-0.5" />
                          {userScore}% Match
                        </Badge>
                      )}
                    </div>
                    <button
                      onClick={(e) => toggleSave(e, career.id)}
                      className={`p-1.5 rounded-lg transition cursor-pointer ${
                        isSaved ? 'text-amber-500 bg-amber-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                      }`}
                      title={isSaved ? 'Remove from saved' : 'Save career'}
                      aria-label={isSaved ? `Remove ${career.title} from bookmarks` : `Bookmark ${career.title}`}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500' : ''}`} />
                    </button>
                  </div>

                  <h2 className="text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors">
                    {career.title}
                  </h2>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {career.description}
                  </p>

                  <div className="flex flex-col gap-1 text-xs text-slate-700 pt-1">
                    <div>
                      Salary Range: <span className="text-emerald-700 font-bold">{career.salary_range}</span>
                    </div>
                    {career.education_level && (
                      <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                        <GraduationCap className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{career.education_level}</span>
                      </div>
                    )}
                  </div>

                  {career.skills && career.skills.length > 0 && (
                    <div className="space-y-1 pt-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        Core Competencies
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {career.skills.slice(0, 4).map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium"
                          >
                            {s}
                          </span>
                        ))}
                        {career.skills.length > 4 && (
                          <span className="px-1.5 py-0.5 text-slate-400 text-[10px] font-medium">
                            +{career.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to={`/careers/${career.slug || career.id}`}
                    className="inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-800 gap-1"
                  >
                    <span>View Career Path</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    to="/assessment"
                    className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold"
                  >
                    Test Fit
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
