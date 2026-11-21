import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarDays, ChevronDown } from 'lucide-react';

export default function EmployeeHolidaysDateFilters({
  filters,
  onFiltersChange,
  fromKey = 'from',
  toKey = 'to',
  className = '',
}) {
  const handleDateChange = (key, date) => {
    onFiltersChange((prev) => ({
      ...(prev || {}),
      [key]: date ? new Date(date).toISOString() : '',
    }));
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* From */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="reset1"
            size="sm"
            className="flex h-11 w-full items-center justify-between rounded-md border-slate-200 bg-white px-4 text-xs font-medium text-slate-600 shadow-sm xl:w-[180px]"
          >
            <span className="flex items-center gap-2">
              <CalendarDays className="size-4 text-slate-400" />
              {filters?.[fromKey] ? new Date(filters[fromKey]).toLocaleDateString('en-GB') : 'From'}
            </span>
            <ChevronDown className="size-4 text-slate-400" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <Calendar
            mode="single"
            selected={filters?.[fromKey] ? new Date(filters[fromKey]) : undefined}
            onSelect={(date) => handleDateChange(fromKey, date)}
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
            className="flex h-11 w-full items-center justify-between rounded-md border-slate-200 bg-white px-4 text-xs font-medium text-slate-600 shadow-sm xl:w-[180px]"
          >
            <span className="flex items-center gap-2">
              <CalendarDays className="size-4 text-slate-400" />
              {filters?.[toKey] ? new Date(filters[toKey]).toLocaleDateString('en-GB') : 'To'}
            </span>
            <ChevronDown className="size-4 text-slate-400" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <Calendar
            mode="single"
            selected={filters?.[toKey] ? new Date(filters[toKey]) : undefined}
            onSelect={(date) => handleDateChange(toKey, date)}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
