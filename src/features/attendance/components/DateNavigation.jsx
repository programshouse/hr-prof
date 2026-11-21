import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { useMemo } from 'react';
import { useGeneralHolidaysQuery } from '@/features/generalholidays/hooks/useGeneralHolidaysQuery';

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};


export function DateNavigation({ date, onDateChange }) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const current = startOfDay(date);
  
  // Fetch general holidays for the current year
  const { data: holidaysData } = useGeneralHolidaysQuery(current.getFullYear());
  
  // Check if current date is a holiday
  const isCurrentDateHoliday = useMemo(() => {
    // Try different possible data structures
    let holidays = [];
    if (holidaysData?.data) {
      holidays = holidaysData.data;
    } else if (Array.isArray(holidaysData)) {
      holidays = holidaysData;
    } else if (holidaysData?.holidays) {
      holidays = holidaysData.holidays;
    }
    
    if (!holidays.length) {
      return false;
    }
    
    const currentDateStr = format(current, 'yyyy-MM-dd');
    
    const isHoliday = holidays.some(holiday => {
      // Try different possible date field names
      const holidayDate = holiday.date || holiday.holiday_date || holiday.holidayDate || holiday.day;
      if (!holidayDate) return false;
      
      const dateStr = holidayDate.split('T')[0]; // Remove time part if present
      return dateStr === currentDateStr;
    });
    
    return isHoliday;
  }, [current, holidaysData]);

  // ✅ calendar rules - disable future dates only
  const isDateDisabled = (d) => {
    const check = startOfDay(d);
    return check > today;
  };

  const handlePrevDay = () => {
    const prev = new Date(current);
    prev.setDate(prev.getDate() - 1);
    onDateChange(prev);
  };

  const handleNextDay = () => {
    if (current >= today) return;
    const next = new Date(current);
    next.setDate(next.getDate() + 1);
    onDateChange(next);
  };

  const disableNext = current >= today;

  return (
    <div className="flex items-center justify-between gap-2 sm:justify-start sm:gap-4">
      <Button variant="outline" size="icon" onClick={handlePrevDay}>
        <ChevronLeft className="size-4 sm:size-5" />
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="relative">
            <CalendarIcon className="size-3 sm:size-4" />
            <span className="hidden sm:inline">{format(current, 'EEEE, d MMMM')}</span>
            <span className="sm:hidden">{format(current, 'EEE, d MMM')}</span>
            {isCurrentDateHoliday && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 py-0.5 rounded-md font-medium">
                Holiday
              </span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            mode="single"
            selected={current}
            onSelect={(d) => d && onDateChange(startOfDay(d))}
            initialFocus
            disabled={isDateDisabled}
          />
        </PopoverContent>
      </Popover>

      <Button variant="outline" size="icon" onClick={handleNextDay} disabled={disableNext}>
        <ChevronRight className="size-4 sm:size-5" />
      </Button>
    </div>
  );
}
