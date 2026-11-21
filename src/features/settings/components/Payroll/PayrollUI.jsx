import React from 'react';
import { cn } from '@/lib/utils';
import { Plus, SquarePen, Minus } from 'lucide-react';

export function SubTab({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-md px-4 py-2 text-sm font-medium transition-colors cursor-pointer',
        active
          ? 'bg-white text-primary cursor-pointer'
          : 'bg-transparent text-slate-600 hover:text-slate-800',
      )}
    >
      {children}
    </button>
  );
}

export function PrimaryButton({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      {children}
    </button>
  );
}

export function EditButton({ onClick, children = 'Edit' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-indigo-50 px-3 py-2 text-sm font-medium text-primary transition hover:bg-indigo-100"
    >
      <SquarePen className="h-4 w-4" />
      {children}
    </button>
  );
}

export function TinyPlusButton({ onClick, disabled = false, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-primary transition',
        disabled 
          ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50' 
          : 'bg-indigo-50 hover:bg-indigo-100',
        className
      )}
      aria-label="Increase days"
    >
      <Plus className="h-5 w-5" />
    </button>
  );
}

export function TinyMinusButton({ onClick, disabled = false, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-primary transition',
        disabled 
          ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50' 
          : 'bg-indigo-50 hover:bg-indigo-100',
        className
      )}
      aria-label="Decrease days"
    >
      <Minus className="h-5 w-5" />
    </button>
  );
}

export function Checkbox({ checked, onChange, label }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-primary accent-primary focus:ring-2 focus:ring-primary focus:ring-offset-0"
      />
      {label}
    </label>
  );
}
