import React from 'react';
import { CalendarDays, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function ProfileDateFilters({ filters, onFiltersChange, className = '' }) {
  const handleDateChange = (key, date) => {
    onFiltersChange((prev) => ({
      ...(prev || {}),
      [key]: date ? new Date(date).toISOString() : '',
    }));
  };

  return (
    <div
      className={[
        'flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center',
        className,
      ].join(' ')}
    >
      {/* From */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="reset1"
            size="sm"
            className={[
              'flex h-11 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-4 text-xs font-medium text-slate-600 shadow-sm',
              'sm:w-[180px]',
            ].join(' ')}
          >
            <span className="flex min-w-0 items-center gap-2">
              <CalendarDays className="size-4 shrink-0 text-slate-400" />
              <span className="truncate">
                {filters?.from
                  ? new Date(filters.from).toLocaleDateString('en-GB')
                  : 'From'}
              </span>
            </span>
            <ChevronDown className="size-4 shrink-0 text-slate-400" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-2" align="start">
          <Calendar
            mode="single"
            selected={filters?.from ? new Date(filters.from) : undefined}
            defaultMonth={filters?.from ? new Date(filters.from) : undefined}
            onSelect={(date) => handleDateChange('from', date)}
          />
        </PopoverContent>
      </Popover>

      {/* To */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="reset1"
            size="sm"
            className={[
              'flex h-11 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-4 text-xs font-medium text-slate-600 shadow-sm',
              'sm:w-[180px]',
            ].join(' ')}
          >
            <span className="flex min-w-0 items-center gap-2">
              <CalendarDays className="size-4 shrink-0 text-slate-400" />
              <span className="truncate">
                {filters?.to
                  ? new Date(filters.to).toLocaleDateString('en-GB')
                  : 'To'}
              </span>
            </span>
            <ChevronDown className="size-4 shrink-0 text-slate-400" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-2" align="start">
          <Calendar
            mode="single"
            selected={filters?.to ? new Date(filters.to) : undefined}
            defaultMonth={filters?.to ? new Date(filters.to) : undefined}
            onSelect={(date) => handleDateChange('to', date)}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
