import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }) {
  return (
    <div
      data-slot="skeleton"
      className={cn('bg-accent h-4 w-20 animate-pulse rounded-md', className)}
      {...props}
    />
  );
}

export { Skeleton };
