import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CommandPalette } from './CommandPalette';
import { 
  Compass, 
  LayoutDashboard, 
  Sparkles, 
  Bookmark, 
  History, 
  User, 
  LogOut, 
  Menu, 
  X, 
  FileText,
  ExternalLink,
  ChevronRight,
  Search
} from 'lucide-react';
import logoSrc from '../assets/logo.png';

export const AppShell: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'New Assessment', path: '/assessment', icon: Sparkles },
    { name: 'Career Explorer', path: '/careers', icon: Compass },
    { name: 'Saved Careers', path: '/saved-careers', icon: Bookmark },
    { name: 'Match History', path: '/history', icon: History },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'CV / Resume', path: '/resume', icon: FileText },
  ];

  // Derive breadcrumb from current path
  const getPageTitle = () => {
    const p = location.pathname;
    if (p === '/dashboard') return 'Student Dashboard';
    if (p === '/assessment') return 'Career Fit Assessment';
    if (p.startsWith('/careers/')) return 'Career Specification & Roadmap';
    if (p === '/careers') return 'Career Explorer Catalog';
    if (p === '/saved-careers' || p === '/saved') return 'Saved Career Pathways';
    if (p === '/history') return 'Assessment Match History';
    if (p === '/profile') return 'Student Profile & Career Identity';
    if (p === '/resume') return 'Resume & CV Document Management';
    if (p === '/about') return 'Evaluation Mathematical Framework';
    return 'Career Guidance Portal';
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans text-slate-800">
      {/* Mobile Sidebar Overlay */}
      {mobileNavOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* Dark Navy Sidebar (#0F172A) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#0f172a] text-slate-300 flex flex-col transition-transform duration-300 ease-in-out border-r border-slate-800/80
        lg:sticky lg:top-0 lg:h-screen lg:translate-x-0
        ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div className="h-16 sm:h-20 flex-shrink-0 flex items-center justify-between px-6 border-b border-slate-800">
          <Link to="/" className="flex items-center space-x-3">
            <img src={logoSrc} alt="FutureHub" className="w-9 h-9 rounded-lg object-contain" />
            <div>
              <span className="font-extrabold text-white text-base tracking-tight">FutureHub</span>
              <span className="block text-[10px] text-blue-400 font-semibold uppercase tracking-wider">Student Portal</span>
            </div>
          </Link>
          <button 
            className="lg:hidden text-slate-400 hover:text-white p-1"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Navigation
          </div>
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path === '/careers' && location.pathname.startsWith('/careers/'));

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileNavOpen(false)}
                className={`
                  flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors
                  ${isActive 
                    ? 'bg-blue-600 text-white font-bold shadow-xs' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'}
                `}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}

          <div className="pt-6">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Help & Information
            </div>
            <Link
              to="/about"
              onClick={() => setMobileNavOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
            >
              <span className="flex items-center gap-2.5">
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Evaluation Formula</span>
              </span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* Bottom User Area */}
        <div className="flex-shrink-0 p-4 border-t border-slate-800 bg-[#0c1322]">
          <div className="flex items-center justify-between">
            <Link to="/profile" className="flex items-center space-x-3 min-w-0 flex-1 hover:opacity-90 transition">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-xs">
                {user?.name?.charAt(0).toUpperCase() || 'S'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate">{user?.name || 'Student'}</div>
                <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition ml-2 cursor-pointer"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workspace Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 sm:h-20 bg-white border-b border-slate-200/90 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center space-x-3 min-w-0">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider hidden sm:block">
                FutureHub Portal
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                {getPageTitle()}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Quick Search Button */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-white text-slate-500 hover:text-slate-900 text-xs transition cursor-pointer"
              title="Search careers (Cmd+K or Ctrl+K)"
              aria-label="Search technology careers"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden md:inline">Quick search careers...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white rounded border border-slate-200 text-slate-400">
                ⌘K
              </kbd>
            </button>

            <Link
              to="/assessment"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Retake Assessment</span>
              <span className="sm:hidden">Assessment</span>
            </Link>

            <Link
              to="/profile"
              className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs hover:ring-2 hover:ring-blue-300 transition shadow-xs"
              title="Profile Settings"
              aria-label="Profile Settings"
            >
              {user?.name?.charAt(0).toUpperCase() || 'S'}
            </Link>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Command Palette Dialog */}
      <CommandPalette isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
};
