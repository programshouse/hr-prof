// src/features/attendance/components/MonthlySummaryTrigger.jsx
import { Button } from '@/components/ui/button';
import { CalendarDays } from 'lucide-react';
import MonthlySummaryDialog from './MonthlySummaryDialog';

export default function MonthlySummaryTrigger({ employeeId, month, variant = "outline", size = "sm", className = "", data }) {
  return (
    <MonthlySummaryDialog 
      employeeId={employeeId} 
      month={month}
      data={data}
      trigger={
        <Button variant={variant} size={size} className={className}>
          <CalendarDays className="h-4 w-4 mr-2" />
          Monthly Summary
        </Button>
      }
    />
  );
}
