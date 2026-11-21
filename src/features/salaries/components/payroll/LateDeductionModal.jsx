import React, { useCallback, useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Clock, X, Download } from 'lucide-react';
import { toast } from 'sonner';
import { salariesApi } from '../../api/salariesApi';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

const formatDuration = (minutes) => {
  if (minutes === null || minutes === undefined || isNaN(minutes)) return '--';
  const total = Number(minutes);
  if (total < 60) return `${Math.round(total)} Min`;
  const hours = Math.floor(total / 60);
  const remaining = Math.round(total % 60);
  if (remaining === 0) return `${hours} Hr${hours > 1 ? 's' : ''}`;
  return `${hours} Hr${hours > 1 ? 's' : ''} ${remaining} Min`;
};

export default function LateDeductionModal({ open, onOpenChange, employeeId, year, month }) {
  const { t } = useTranslation();
  const [sheetData, setSheetData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadSheetData = useCallback(async () => {
    if (!employeeId || !year || !month) return;
    
    setIsLoading(true);
    try {
      const data = await salariesApi.getEmployeeDeductions(employeeId, year, month);
      setSheetData(data);
    } catch (error) {
      console.error('Error fetching deductions sheet:', error);
      toast.error('Failed to load late deduction sheet');
    } finally {
      setIsLoading(false);
    }
  }, [employeeId, year, month]);

  useEffect(() => {
    if (open && employeeId && year && month) {
      loadSheetData();
    }
  }, [open, employeeId, year, month, loadSheetData]);

  const handleExport = () => {
    toast.success('Sheet exported successfully');
  };

  const sheet = sheetData?.sheet || [];
  const permissionLimit = sheetData?.permission_limit_minutes || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl rounded-2xl bg-white p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-indigo-600">
              <Clock className="h-5 w-5" />
              Sheet
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="flex items-center gap-1 text-slate-600"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6">
          {/* Permission Limit Badge */}
          <div className="flex justify-end mb-4">
            <div className="bg-indigo-100 text-primary px-4 py-2 rounded-lg font-medium">
              Permission Limit : {permissionLimit} Min
            </div>
          </div>

          {/* Sheet Table */}
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="max-h-[400px] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-slate-50 sticky top-0">
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Time</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Duration</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Deduction Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="h-32 text-center">
                        <div className="flex items-center justify-center">
                          <Loader2 className="mr-2 h-5 w-5 animate-spin text-slate-400" />
                          <span className="text-sm text-slate-500">Loading sheet data...</span>
                        </div>
                      </td>
                    </tr>
                  ) : sheet.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center space-y-2 text-slate-500">
                          <Clock className="h-8 w-8 text-slate-300" />
                          <p className="text-sm font-medium">
                            {t('salaries.emptyStates.noLateTimeRecordsFound')}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    sheet.map((row, index) => (
                      <tr
                        key={index}
                        className={cn(
                          "border-b border-slate-100 hover:bg-slate-50",
                          index === sheet.length - 1 && "border-b-0"
                        )}
                      >
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {row.date}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                              row.type?.toLowerCase().includes('in')
                                ? "bg-blue-100 text-blue-700"
                                : "bg-green-100 text-green-700"
                            )}
                          >
                            {row.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {row.time}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {row.duration || formatDuration(row.duration_minutes)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-red-500">
                          Egp {row.deduction_amount?.toFixed?.(2) || row.deduction_amount || 0}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
