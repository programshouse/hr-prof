import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, isSameMonth, isFuture } from 'date-fns';
import { ar as arLocale, enUS } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function MonthNavigation({ date, onDateChange, disableFutureMonths = false }) {
  const { i18n } = useTranslation();
  const [isRTL, setIsRTL] = useState(false);
  const dateLocale = i18n.language?.startsWith('ar') ? arLocale : enUS;
  
  useEffect(() => {
    const checkDirection = () => {
      const isRtl = document.documentElement.dir === 'rtl' || 
                    document.documentElement.getAttribute('dir') === 'rtl' ||
                    document.documentElement.lang === 'ar';
      setIsRTL(isRtl);
    };
    
    checkDirection();
    
    // Listen for direction changes
    const observer = new MutationObserver(checkDirection);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['dir', 'lang']
    });
    
    return () => observer.disconnect();
  }, []);

  const isCurrentOrFutureMonth = disableFutureMonths && (isSameMonth(date, new Date()) || isFuture(date));

  const handlePrevMonth = () => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() - 1);
    onDateChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + 1);
    onDateChange(newDate);
  };

  // In RTL, swap the arrows and their functions
  const LeftArrow = isRTL ? ChevronRight : ChevronLeft;
  const RightArrow = isRTL ? ChevronLeft : ChevronRight;
  const leftArrowAction = isRTL ? handleNextMonth : handlePrevMonth;
  const rightArrowAction = isRTL ? handlePrevMonth : handleNextMonth;
  const rightArrowDisabled = isRTL ? false : isCurrentOrFutureMonth;

  return (
    <div className="flex items-center justify-between gap-2 sm:justify-start sm:gap-4">
      <Button variant="outline" size="icon" onClick={leftArrowAction}>
        <LeftArrow className="size-4 sm:size-5" />
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            <CalendarIcon className="size-3 sm:size-4" />
            <span className="hidden sm:inline">{format(date, 'MMMM yyyy', { locale: dateLocale })}</span>
            <span className="sm:hidden">{format(date, 'MMM yyyy', { locale: dateLocale })}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => newDate && onDateChange(newDate)}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <Button variant="outline" size="icon" onClick={rightArrowAction} disabled={rightArrowDisabled}>
        <RightArrow className="size-4 sm:size-5" />
      </Button>
    </div>
  );
}
