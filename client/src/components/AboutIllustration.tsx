import React from 'react';

export const AboutIllustration: React.FC = () => {
  return (
    <div className="relative w-full max-w-md mx-auto aspect-square flex items-center justify-center">
      <div className="absolute inset-0 bg-blue-100/50 rounded-full blur-3xl -z-10 animate-pulse" />
      <svg viewBox="0 0 500 500" className="w-full h-full drop-shadow-xl" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="aboutGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="aboutGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
          <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Base Platform */}
        <ellipse cx="250" cy="400" rx="190" ry="45" fill="#e2e8f0" />
        <ellipse cx="250" cy="395" rx="170" ry="40" fill="url(#aboutGrad2)" opacity="0.9" />
        <ellipse cx="250" cy="390" rx="150" ry="34" fill="#1e293b" />

        {/* Hologram Pillar Light */}
        <path d="M160 385 L200 140 L300 140 L340 385 Z" fill="url(#glowGrad)" opacity="0.35" />

        {/* Central Core Screen / Tablet */}
        <rect x="180" y="160" width="140" height="200" rx="16" fill="#0f172a" stroke="#3b82f6" strokeWidth="4" />
        <rect x="195" y="180" width="110" height="12" rx="6" fill="#3b82f6" opacity="0.8" />
        <rect x="195" y="202" width="75" height="8" rx="4" fill="#64748b" />
        <rect x="195" y="218" width="90" height="8" rx="4" fill="#64748b" />
        <circle cx="250" cy="270" r="30" fill="none" stroke="#22c55e" strokeWidth="6" strokeDasharray="140 45" />
        <text x="250" y="275" textAnchor="middle" fill="#22c55e" fontSize="14" fontWeight="bold" fontFamily="sans-serif">94%</text>
        <rect x="205" y="320" width="90" height="22" rx="11" fill="url(#aboutGrad1)" />

        {/* Left Floating Node: Career Rocket */}
        <g className="animate-bounce" style={{ animationDuration: '3.5s' }}>
          <rect x="60" y="120" width="110" height="80" rx="14" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
          <circle cx="90" cy="150" r="16" fill="#eff6ff" />
          <path d="M85 158 L85 142 L95 150 Z" fill="#2563eb" />
          <rect x="114" y="142" width="42" height="6" rx="3" fill="#1e293b" />
          <rect x="114" y="154" width="28" height="5" rx="2" fill="#94a3b8" />
        </g>

        {/* Right Floating Node: Skill Target */}
        <g className="animate-bounce" style={{ animationDuration: '4.2s' }}>
          <rect x="330" y="200" width="120" height="84" rx="14" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
          <circle cx="360" cy="235" r="18" fill="#ecfdf5" />
          <circle cx="360" cy="235" r="8" fill="#10b981" />
          <rect x="388" y="226" width="48" height="7" rx="3" fill="#0f172a" />
          <rect x="388" y="240" width="32" height="5" rx="2" fill="#64748b" />
        </g>

        {/* Top Connecting Beams */}
        <circle cx="250" cy="100" r="28" fill="url(#aboutGrad1)" />
        <path d="M245 92 L255 100 L245 108" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="250" y1="128" x2="250" y2="160" stroke="#3b82f6" strokeWidth="3" strokeDasharray="4 4" />
      </svg>
    </div>
  );
};
