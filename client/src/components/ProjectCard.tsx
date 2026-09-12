import React from 'react';
import { ProjectIdea } from '../types';
import { Code2 } from 'lucide-react';

interface ProjectCardProps {
  project: ProjectIdea;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'beginner':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'intermediate':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'advanced':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-blue-300 hover:shadow-md transition group">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${getDifficultyColor(project.difficulty)}`}>
            {project.difficulty}
          </span>
          {project.career_title && (
            <span className="text-[11px] text-slate-400 font-medium">
              {project.career_title}
            </span>
          )}
        </div>

        <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
          {project.title}
        </h4>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {project.description}
        </p>
      </div>

      <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Code2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
          <span>Tech Stack & Skills:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {project.skills_practiced.split(',').map((skill, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium"
            >
              {skill.trim()}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

interface ProjectListProps {
  projects: string[];
  limit?: number;
}

export const ProjectBadgeList: React.FC<ProjectListProps> = ({ projects, limit }) => {
  const displayProjects = limit ? projects.slice(0, limit) : projects;

  return (
    <ol className="projects-badge-list space-y-2">
      {displayProjects.map((project, idx) => (
        <li key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-800">
          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center flex-shrink-0 text-xs">
            {idx + 1}
          </span>
          <span className="font-medium">{project}</span>
        </li>
      ))}
    </ol>
  );
};
