// src/features/applicants/components/StageCell.jsx
import { cn } from '@/lib/utils';

function Block({ filled }) {
  return (
    <span className={cn('h-3 w-6 rounded-md', filled ? 'bg-primary' : 'bg-slate-200')} />
  );
}

export default function StageCell({ value }) {
  const stageNumber = Number(value);
  const filledCount =
    Number.isFinite(stageNumber) && stageNumber > 0 ? Math.min(stageNumber, 5) : 0;

  return (
    <div className="min-w-0">
      <div className="mt-1 flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Block key={i} filled={i < filledCount} />
        ))}
      </div>
    </div>
  );
}