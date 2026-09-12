import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Compass, 
  Sparkles, 
  LogOut, 
  Menu, 
  X, 
  ArrowRight, 
  LayoutDashboard, 
  Bookmark,
  User,
  Info
} from 'lucide-react';
import logoSrc from '../assets/logo.png';
import { Button } from './ui/Button';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Explore Careers', path: '/careers', icon: Compass },
    { name: 'Career Assessment', path: '/assessment', icon: Sparkles },
    { name: 'About & Methodology', path: '/about', icon: Info },
  ];

  const authLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Saved Careers', path: '/saved', icon: Bookmark },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Wordmark */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-xl p-1"
          >
            <img src={logoSrc} alt="FutureHub" className="w-10 h-10 rounded-xl object-contain" />
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 block leading-tight">
                FutureHub
              </span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                Career Guidance Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2" aria-label="Main Navigation">
            {navLinks.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors
                  ${isActive 
                    ? 'text-blue-600 bg-blue-50/80 font-bold' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'}
                `}
              >
                {item.name}
              </NavLink>
            ))}

            {isAuthenticated && authLinks.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5
                  ${isActive 
                    ? 'text-blue-600 bg-blue-50/80 font-bold' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'}
                `}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>

          {/* Desktop Auth CTA */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-sm font-medium transition"
                  title="Profile Settings"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                    {user?.name?.charAt(0).toUpperCase() || 'S'}
                  </div>
                  <span className="truncate max-w-[120px] font-semibold">{user?.name}</span>
                </Link>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleLogout}
                  leftIcon={<LogOut className="w-3.5 h-3.5 text-slate-500" />}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="tertiary" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="space-y-1">
            {navLinks.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3.5 py-3 rounded-xl text-base font-semibold transition-colors
                  ${isActive 
                    ? 'text-blue-600 bg-blue-50 font-bold' 
                    : 'text-slate-700 hover:bg-slate-50'}
                `}
              >
                <item.icon className="w-5 h-5 text-slate-500" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            {isAuthenticated ? (
              <>
                <NavLink
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-base font-semibold text-blue-600 bg-blue-50"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span>Student Dashboard</span>
                </NavLink>

                <NavLink
                  to="/saved"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Bookmark className="w-5 h-5 text-slate-500" />
                  <span>Saved Careers</span>
                </NavLink>

                <NavLink
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <User className="w-5 h-5 text-slate-500" />
                  <span>Profile Settings ({user?.name})</span>
                </NavLink>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-base font-semibold text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" size="md" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="md" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
