// src/features/attendance/pages/MonthlySummaryPage.jsx
import { useState } from 'react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MonthlySummary from '../components/MonthlySummary';

export default function MonthlySummaryPage() {
  const [employeeId, setEmployeeId] = useState('196');
  const [month, setMonth] = useState('2025-12');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          
          
        </div>
      </div>

      <Card className="p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="employee-id">Employee ID</Label>
            <Input
              id="employee-id"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="Enter employee ID"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="month">Month (YYYY-MM)</Label>
            <Input
              id="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              placeholder="2025-12"
            />
          </div>
          
          <div className="flex items-end">
            <Button 
              onClick={() => {
                // Force re-render by updating state
                const newEmployeeId = employeeId;
                const newMonth = month;
                setEmployeeId('');
                setMonth('');
                setTimeout(() => {
                  setEmployeeId(newEmployeeId);
                  setMonth(newMonth);
                }, 0);
              }}
              className="w-full"
            >
              Load Summary
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Access</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <div className="font-medium">Employee 196</div>
              <div className="text-sm text-slate-500">December 2025</div>
            </div>
            <Button 
              size="sm"
              onClick={() => {
                setEmployeeId('196');
                setMonth('2025-12');
              }}
            >
              View
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <div className="font-medium">Employee 196</div>
              <div className="text-sm text-slate-500">November 2025</div>
            </div>
            <Button 
              size="sm"
              onClick={() => {
                setEmployeeId('196');
                setMonth('2025-11');
              }}
            >
              View
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <div className="font-medium">Employee 197</div>
              <div className="text-sm text-slate-500">December 2025</div>
            </div>
            <Button 
              size="sm"
              onClick={() => {
                setEmployeeId('197');
                setMonth('2025-12');
              }}
            >
              View
            </Button>
          </div>
        </div>
      </Card>

      {/* Monthly Summary Display */}
      {(employeeId && month) && (
        <MonthlySummary
          employeeId={employeeId}
          month={month}
          onMonthChange={(date) => setMonth(format(date, 'yyyy-MM'))}
        />
      )}
    </div>
  );
}
