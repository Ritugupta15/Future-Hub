import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import logoSrc from '../assets/logo.png';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand & Purpose */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center space-x-3 group">
              <img src={logoSrc} alt="FutureHub" className="w-9 h-9 rounded-xl object-contain" />
              <span className="text-xl font-bold text-white tracking-tight">FutureHub</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Career guidance platform for computer science and IT students. Intelligent, deterministic, and career-focused.
            </p>
            <div className="inline-flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-800/60">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Deterministic Algorithm Active</span>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Product</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/careers" className="hover:text-white transition-colors">
                  Explore Careers
                </Link>
              </li>
              <li>
                <Link to="/assessment" className="hover:text-white transition-colors">
                  Career Assessment
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  Student Dashboard
                </Link>
              </li>
              <li>
                <Link to="/saved" className="hover:text-white transition-colors">
                  Saved Bookmarks
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Resources</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/careers" className="hover:text-white transition-colors">
                  Career Guides
                </Link>
              </li>
              <li>
                <Link to="/assessment" className="hover:text-white transition-colors">
                  Skills Matrix
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  Learning Roadmaps
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  Evaluation Formula
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Attribution */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About & Methodology
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  Academic Project Details
                </Link>
              </li>
            </ul>
            <div className="pt-2 text-xs text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Zero-IDOR Security Enforced</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {currentYear} FutureHub — Career Guidance Platform. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <Link to="/about" className="hover:text-slate-400 transition">Methodology</Link>
            <span className="text-slate-700">•</span>
            <span className="text-slate-400">Academic Release v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
