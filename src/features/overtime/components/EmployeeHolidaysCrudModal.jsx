import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import HolidaysTable from '@/features/holidays/components/HolidaysTable';
import HolidayModal from '@/features/holidays/components/HolidayModal';
import { holidaysApi } from '@/features/holidays/api/holidays.api';

const extractRows = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.rows)) return response.rows;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.holidays)) return response.holidays;
  return [];
};

const belongsToEmployee = (holiday, employeeId) => {
  const rowEmployeeId =
    holiday?.employee_id ??
    holiday?.employee?.employee_id ??
    holiday?.employee?.id ??
    null;

  if (rowEmployeeId == null) return true;

  return String(rowEmployeeId) === String(employeeId);
};

export default function EmployeeHolidaysCrudModal({
  open,
  onOpenChange,
  employeeId,
  employeeName = '',
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [holidayModalOpen, setHolidayModalOpen] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState(null);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['holidays', 'employee', employeeId],
    queryFn: () =>
      holidaysApi.getHolidays({
        employee_id: employeeId,
        limit: 10000,
      }),
    enabled: open && !!employeeId,
    retry: false,
  });

  const holidays = useMemo(
    () =>
      extractRows(data)
        .filter((holiday) => belongsToEmployee(holiday, employeeId))
        .map((holiday) => ({
          ...holiday,
          employeeName:
            holiday?.employeeName ||
            holiday?.employee?.full_name ||
            employeeName ||
            '—',
        })),
    [data, employeeId, employeeName]
  );

  const handleAdd = () => {
    setSelectedHoliday(null);
    setHolidayModalOpen(true);
  };

  const handleEdit = (holiday) => {
    setSelectedHoliday(holiday);
    setHolidayModalOpen(true);
  };

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['holidays'] });
    queryClient.invalidateQueries({
      queryKey: ['holidays', 'employee', employeeId],
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] !w-[1180px] !max-w-[94vw] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t('holidays.title', 'Holidays')}
              {employeeName ? ` — ${employeeName}` : ''}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-end">
              <Button type="button" size="sm" onClick={handleAdd}>
                <Plus className="mr-1.5 h-4 w-4" />
                {t('holidays.addHoliday', 'Add Holiday')}
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-3 rounded-xl border border-slate-200 p-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <div className={isFetching ? 'opacity-70' : ''}>
                <HolidaysTable
                  data={holidays}
                  loading={isLoading}
                  onEdit={handleEdit}
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <HolidayModal
        open={holidayModalOpen}
        onOpenChange={(nextOpen) => {
          setHolidayModalOpen(nextOpen);
          if (!nextOpen) setSelectedHoliday(null);
        }}
        holiday={selectedHoliday}
        defaultEmployeeId={employeeId}
        employeeName={employeeName}
        lockEmployee
        onSuccess={handleSuccess}
      />
    </>
  );
}
