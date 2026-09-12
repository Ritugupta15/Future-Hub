import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-slate-200/80 rounded-xl ${className}`} />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="w-24 h-5 rounded-full" />
        <Skeleton className="w-16 h-4 rounded-md" />
      </div>
      <Skeleton className="w-3/4 h-6 rounded-md" />
      <div className="space-y-2">
        <Skeleton className="w-full h-4 rounded-md" />
        <Skeleton className="w-5/6 h-4 rounded-md" />
      </div>
      <div className="pt-4 border-t border-slate-100 flex gap-2">
        <Skeleton className="w-16 h-5 rounded-md" />
        <Skeleton className="w-20 h-5 rounded-md" />
        <Skeleton className="w-16 h-5 rounded-md" />
      </div>
    </div>
  );
};
