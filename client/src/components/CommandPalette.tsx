import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { Career } from '../types';
import { 
  Search, 
  Compass, 
  ChevronRight, 
  X, 
  Sparkles, 
  LayoutDashboard, 
  Bookmark, 
  History, 
  User, 
  FileText, 
  BookOpen 
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PaletteItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  path: string;
  type: 'navigation' | 'career';
  skills?: string[];
}

const NAV_ACTIONS: PaletteItem[] = [
  { id: 'nav-dashboard', title: 'Student Dashboard', subtitle: 'View top recommendations, next steps, and progress', category: 'Portal View', path: '/dashboard', type: 'navigation' },
  { id: 'nav-assessment', title: 'Career Fit Assessment', subtitle: '5-step structured career evaluation wizard', category: 'Assessment', path: '/assessment', type: 'navigation' },
  { id: 'nav-careers', title: 'Career Explorer', subtitle: 'Browse all 15 technology career pathways', category: 'Catalog', path: '/careers', type: 'navigation' },
  { id: 'nav-saved', title: 'Saved Careers', subtitle: 'Access your bookmarked career pathways', category: 'Bookmarks', path: '/saved-careers', type: 'navigation' },
  { id: 'nav-history', title: 'Match History', subtitle: 'Inspect previous assessment result snapshots', category: 'History', path: '/history', type: 'navigation' },
  { id: 'nav-profile', title: 'Student Profile & Identity', subtitle: 'Manage skills, education, projects, certifications', category: 'Profile', path: '/profile', type: 'navigation' },
  { id: 'nav-resume', title: 'Resume / CV Management', subtitle: 'Upload CV, view extraction, and assisted review', category: 'CV & Documents', path: '/resume', type: 'navigation' },
  { id: 'nav-about', title: 'Evaluation Methodology', subtitle: 'Transparent 4-pillar mathematical weighting model', category: 'Help', path: '/about', type: 'navigation' }
];

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [careers, setCareers] = useState<Career[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      apiClient.getCareers().then((res) => {
        if (res.success && res.data) {
          setCareers(res.data);
        }
      }).catch(() => {});
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const careerItems: PaletteItem[] = careers.map(c => ({
    id: `career-${c.id}`,
    title: c.title,
    subtitle: `${c.category} • ${c.salary_range || 'Entry to Mid'}`,
    category: c.category,
    path: `/careers/${c.slug || c.id}`,
    type: 'career',
    skills: c.skills || []
  }));

  const allItems: PaletteItem[] = [...NAV_ACTIONS, ...careerItems];

  const filtered = query.trim()
    ? allItems.filter((item) => {
        const q = query.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          (item.skills && item.skills.some((s) => s.toLowerCase().includes(q)))
        );
      })
    : [...NAV_ACTIONS.slice(0, 4), ...careerItems.slice(0, 4)];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          navigate(filtered[selectedIndex].path);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filtered, navigate, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Global search dialog"
      >
        {/* Search Input Bar */}
        <div className="relative border-b border-slate-200 flex items-center px-4 py-3.5">
          <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search technology careers, skills (Python, Docker, SQL)..."
            className="w-full pl-3 pr-8 text-sm text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No matching careers or skills found for "{query}".
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const renderIcon = () => {
                if (item.id === 'nav-dashboard') return <LayoutDashboard className="w-3.5 h-3.5" />;
                if (item.id === 'nav-assessment') return <Sparkles className="w-3.5 h-3.5" />;
                if (item.id === 'nav-careers') return <Compass className="w-3.5 h-3.5" />;
                if (item.id === 'nav-saved') return <Bookmark className="w-3.5 h-3.5" />;
                if (item.id === 'nav-history') return <History className="w-3.5 h-3.5" />;
                if (item.id === 'nav-profile') return <User className="w-3.5 h-3.5" />;
                if (item.id === 'nav-resume') return <FileText className="w-3.5 h-3.5" />;
                if (item.id === 'nav-about') return <BookOpen className="w-3.5 h-3.5" />;
                return <Compass className="w-3.5 h-3.5" />;
              };

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    navigate(item.path);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition text-xs ${
                    isSelected
                      ? 'bg-blue-50 text-blue-950 font-semibold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {renderIcon()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-slate-900 truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 truncate">
                        <span className="font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded text-[10px]">{item.category}</span>
                        <span>•</span>
                        <span>{item.subtitle}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-slate-400">
                    <span className="hidden sm:inline text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Select
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-200 font-mono text-[10px]">↑↓</kbd> Navigate</span>
            <span><kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-200 font-mono text-[10px]">↵</kbd> Open</span>
            <span><kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-200 font-mono text-[10px]">ESC</kbd> Close</span>
          </div>
          <button
            type="button"
            onClick={() => {
              navigate('/assessment');
              onClose();
            }}
            className="text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>Take Assessment</span>
          </button>
        </div>
      </div>
    </div>
  );
};
