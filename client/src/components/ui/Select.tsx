import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  options?: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  helperText,
  error,
  leftIcon,
  options,
  children,
  id,
  className = '',
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-bold uppercase tracking-wider text-slate-700">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
            {leftIcon}
          </div>
        )}

        <select
          id={selectId}
          className={`w-full appearance-none py-2.5 pr-10 text-sm text-slate-900 bg-white border rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent ${
            leftIcon ? 'pl-10' : 'pl-3.5'
          } ${
            error ? 'border-red-400 bg-red-50/20' : 'border-slate-300 hover:border-slate-400'
          } ${className}`}
          {...props}
        >
          {options ? options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          )) : children}
        </select>

        <div className="absolute right-3.5 pointer-events-none text-slate-400 flex items-center">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {error ? (
        <p className="text-xs font-medium text-red-600" role="alert">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
};
