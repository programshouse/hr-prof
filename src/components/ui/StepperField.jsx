// src/components/shared/StepperField.jsx
import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StepperField({
  label,
  _valueLabel, // "Days" | "Hours" | "Min" ...
  value,
  onMinus,
  onPlus,
  helpText,
  rightHelp,
  decimals = false,
  className,
  disabled = false,
  onChange,
  min,
  max,
}) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        {rightHelp ? <p className="text-xs text-slate-500">{rightHelp}</p> : null}
      </div>

      {/* EXACT look: wide input + two light-indigo buttons */}
      <div className="flex items-center gap-3">
        {/* value input */}
        <div className="flex-1">
          <input
            type="text"
            inputMode="decimal"
            value={value}
            onChange={onChange}
            disabled={disabled}
            min={min}
            max={max}
            className={cn(
              'flex h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-700',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0',
              'disabled:cursor-default disabled:bg-white disabled:text-slate-700',
              decimals && 'tabular-nums',
              'placeholder:text-slate-400'
            )}
          />
        </div>

        {/* + button */}
        <button
          type="button"
          onClick={onPlus}
          disabled={disabled}
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-lg cursor-pointer',
            'border border-slate-200 bg-indigo-50',
            'text-indigo-600',
            'transition hover:bg-indigo-100',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
          aria-label={`Increase ${label}`}
        >
          <Plus className="h-5 w-5 " />
        </button>

        {/* - button */}
        <button
          type="button"
          onClick={onMinus}
          disabled={disabled}
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-lg cursor-pointer',
            'border border-slate-200 bg-indigo-50',
            'text-indigo-600',
            'transition hover:bg-indigo-100',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
          aria-label={`Decrease ${label}`}
        >
          <Minus className="h-5 w-5" />
        </button>
      </div>

      {helpText ? <p className="text-xs text-slate-500">{helpText}</p> : null}
    </div>
  );
}
