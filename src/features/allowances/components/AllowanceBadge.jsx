import { cn } from '@/lib/utils';

export const ALLOWANCE_TYPE_OPTIONS = [
  { value: 'transportation', label: 'Transportation' },
  { value: 'housing', label: 'Housing' },
  { value: 'mission', label: 'Mission' },
  { value: 'meal', label: 'Meal' },
  { value: 'medical', label: 'Medical' },
  { value: 'internet', label: 'Internet' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'other', label: 'Other' },
];

const TYPE_STYLES = {
  transportation: 'bg-fuchsia-50 text-fuchsia-600',
  housing: 'bg-indigo-50 text-indigo-600',
  mission: 'bg-cyan-50 text-cyan-600',
  meal: 'bg-amber-50 text-amber-600',
  medical: 'bg-emerald-50 text-emerald-600',
  internet: 'bg-violet-50 text-violet-600',
  mobile: 'bg-blue-50 text-blue-600',
  other: 'bg-slate-100 text-slate-600',
};

export function getAllowanceTypeLabel(type) {
  if (!type) return '—';

  const normalized = String(type).trim().toLowerCase();
  const option = ALLOWANCE_TYPE_OPTIONS.find((item) => item.value === normalized);

  if (option) return option.label;

  return String(type)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function AllowanceBadge({ type }) {
  const normalized = String(type || '')
    .trim()
    .toLowerCase();
  const classes = TYPE_STYLES[normalized] || TYPE_STYLES.other;

  return (
    <span
      className={cn(
        'inline-flex min-w-[92px] items-center justify-center rounded-md px-3 py-1 text-xs font-medium',
        classes
      )}
    >
      {getAllowanceTypeLabel(type)}
    </span>
  );
}
