// EmployeeHolidays.jsx
import React, { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Eye, X, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AddHolidayDialog from './AddHolidayDialog.jsx';
import { useHolidayQuery } from '@/features/employees/hooks/useHolidayQuery';
import { employeesApi } from '@/features/employees/api/employees.api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { formatCountWithUnit } from '@/utils/durationLabels';
import { useAuthStore } from '@/services/auth/auth.store';

function UsedTypeBadge({ type }) {
  const styles =
    type === 'Annual'
      ? 'bg-orange-100 text-orange-700'
      : type === 'Sick'
        ? 'bg-rose-100 text-rose-700'
        : type === 'Carried Over'
          ? 'bg-purple-100 text-purple-700'
          : type === 'Unused Leave Encashment'
            ? 'bg-blue-100 text-blue-700'
            : 'bg-slate-100 text-slate-700';

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-[11px] font-medium ${styles}`}>
      {type}
    </span>
  );
}

function ReasonBadge({ label }) {
  const styles =
    label === 'carried-over'
      ? 'bg-orange-100 text-orange-700'
      : label === 'renewed'
        ? 'bg-rose-100 text-rose-700'
        : label === 'reason'
          ? 'bg-blue-100 text-blue-700'
          : label === 'Carried Over'
            ? 'bg-orange-100 text-orange-700'
            : label === 'Renewed Leave'
              ? 'bg-rose-100 text-rose-700'
              : 'bg-slate-100 text-slate-700';

  const displayLabel = label || 'No Reason';

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-[11px] font-medium ${styles}`}>
      {displayLabel}
    </span>
  );
}

function HolidayDetailsModal({ open, onClose, title, usedDays, holidayDetails = [] }) {
  const { t } = useTranslation();

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/30" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div
          className="w-full max-w-[460px] rounded-xl border border-slate-200 bg-white shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 py-4">
            <p className="text-base font-semibold text-slate-900">
              {t('employees.profile.details.holidays.detailsTitle', { title })}
            </p>

            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onClose}>
              <X className="h-4 w-4 text-slate-600" />
            </Button>
          </div>

          <div className="px-5 pb-5">
            <div className="mb-4">
              <p className="text-sm text-slate-600">
                {t('employees.profile.details.holidays.totalDaysUsed')}:{' '}
                <span className="font-semibold text-slate-900">{usedDays}</span>
              </p>
            </div>

            <div className="my-4 h-px bg-slate-100" />

            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-900">Holiday Dates</p>

              <div className="overflow-hidden rounded-lg border border-slate-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 border-slate-200">
                      <TableHead className="h-10 px-4 text-xs font-medium text-slate-700">Date</TableHead>
                      <TableHead className="h-10 px-4 text-right text-xs font-medium text-slate-700">
                        Document
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {holidayDetails.map((holiday, index) => (
                      <TableRow key={index} className="border-slate-100">
                        <TableCell className="py-3 px-4 text-sm text-slate-900">
                          {format(new Date(holiday.date), 'MMM dd, yyyy')}
                        </TableCell>

                        <TableCell className="py-3 px-4 text-right">
                          {holiday.pdf ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(holiday.pdf, '_blank')}
                              className="h-7 px-2 text-xs"
                            >
                              View PDF
                            </Button>
                          ) : (
                            <span className="text-xs text-slate-400">No document</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}

                    {holidayDetails.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} className="py-8 text-center text-sm text-slate-500">
                          No holiday dates to display.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={onClose} className="h-10 rounded-md px-6">
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function EmployeeHolidays({ employeeId, isLoading = false }) {
  const { t } = useTranslation();
  const { role } = useAuthStore();
  const isEmployeeRole = role === 'employee';
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [filters] = useState({});
  const [viewingDetails, setViewingDetails] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [holidayToDelete, setHolidayToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState('holiday');
  const queryClient = useQueryClient();

  const { isLoading: isBalanceLoading } = useHolidayQuery(employeeId);

  const { data: holidaysData, isLoading: isHolidaysLoading } = useQuery({
    queryKey: ['employee-holidays', employeeId],
    queryFn: () => employeesApi.getHolidays(employeeId),
    enabled: !!employeeId,
    retry: false,
  });

  const { data: holidayDetails } = useQuery({
    queryKey: ['holiday-details', employeeId],
    queryFn: () => employeesApi.getHolidayDetails(employeeId),
    enabled: !!employeeId && !!viewingDetails,
    retry: false,
  });

  const { data: exceptionalHistoryData, isLoading: isExceptionalLoading } = useQuery({
    queryKey: ['exceptional-holidays-history', employeeId],
    queryFn: () => employeesApi.getExceptionalHolidaysHistory(employeeId),
    enabled: !!employeeId,
    retry: false,
  });

  const { data: settleHistoryData, isLoading: isSettleLoading } = useQuery({
    queryKey: ['settle-holidays-history', employeeId],
    queryFn: () => employeesApi.getSettleHolidaysHistory(employeeId),
    enabled: !!employeeId,
    retry: false,
  });

  const isComponentLoading =
    isLoading || isBalanceLoading || isHolidaysLoading || isExceptionalLoading || isSettleLoading;

  const usedHolidaysRows = useMemo(() => {
    const usedData = holidaysData?.used || {};

    const rows = [
      { key: 'annual', type: 'Annual', used: usedData['Annual Leave'] || 0 },
      { key: 'sick', type: 'Sick', used: usedData['Sick Leave'] || 0 },
      { key: 'casual', type: 'Casual', used: usedData['Casual Leave'] || 0 },
      { key: 'carriedOver', type: 'Carried Over', used: 0 },
      { key: 'unusedLeaveEncashment', type: 'Unused Leave Encashment', used: 0 },
    ];

    return rows.filter((row) => row.used !== 0 && row.used !== '0');
  }, [holidaysData]);

  const safeDate = (dateString) => {
    try {
      const d = new Date(dateString);
      return isNaN(d.getTime()) ? new Date() : d;
    } catch {
      return new Date();
    }
  };

  const additionalDaysRows = useMemo(() => {
    const rows = exceptionalHistoryData?.rows || [];

    return rows.map((row) => ({
      id: row.id,
      reason: row.reason,
      requestDate: safeDate(row.action_date),
      annual: Number(row.annual ?? row.annual_days ?? 0),
      casual: Number(row.casual ?? row.casual_days ?? 0),
      createdAt: row.created_at,
    }));
  }, [exceptionalHistoryData]);

  const amountRows = useMemo(() => {
    const rows = settleHistoryData?.rows || [];

    return rows.map((row) => ({
      id: row.id,
      reason: row.reason,
      requestDate: safeDate(row.action_date),
      date: safeDate(row.payroll_date),
      amount: parseFloat(row.cash_amount) || 0,
    }));
  }, [settleHistoryData]);

  const filteredAdditionalDaysRows = useMemo(() => {
    return additionalDaysRows.filter((row) => {
      const d = new Date(row.requestDate);
      if (filters?.from && d < new Date(filters.from)) return false;
      if (filters?.to && d > new Date(filters.to)) return false;
      return true;
    });
  }, [additionalDaysRows, filters]);

  const filteredAmountRows = useMemo(() => {
    return amountRows.filter((row) => {
      const d = new Date(row.requestDate);
      if (filters?.from && d < new Date(filters.from)) return false;
      if (filters?.to && d > new Date(filters.to)) return false;
      return true;
    });
  }, [amountRows, filters]);

  const addHolidayMutation = useMutation({
    mutationFn: (formData) => employeesApi.addSettleCashout(employeeId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exceptional-holidays-history', employeeId] });
      queryClient.invalidateQueries({ queryKey: ['settle-holidays-history', employeeId] });
      queryClient.invalidateQueries({ queryKey: ['employee-holidays', employeeId] });
      setIsAddDialogOpen(false);
    },
  });

  const deleteHolidayMutation = useMutation({
    mutationFn: (id) => employeesApi.deleteExceptionalHoliday(employeeId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exceptional-holidays-history', employeeId] });
      queryClient.invalidateQueries({ queryKey: ['employee-holidays', employeeId] });
      setDeleteModalOpen(false);
      setHolidayToDelete(null);
      toast.success('Holiday balance deleted successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to delete holiday balance');
    },
  });

  const deleteEncashmentMutation = useMutation({
    mutationFn: (id) => employeesApi.deleteSettleHoliday(employeeId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settle-holidays-history', employeeId] });
      queryClient.invalidateQueries({ queryKey: ['employee-holidays', employeeId] });
      setDeleteModalOpen(false);
      setHolidayToDelete(null);
      toast.success('Leave encashment deleted successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to delete leave encashment');
    },
  });

  const sheet_holidays = (type) => setViewingDetails(type);

  const recentActivity = useMemo(() => {
    if (!viewingDetails || !holidayDetails) return [];

    const detailsByType = holidayDetails?.details_by_type || {};
    const typeMapping = {
      annual: 'Annual Leave',
      sick: 'Sick Leave',
      casual: 'Casual Leave',
    };

    const leaveType = typeMapping[viewingDetails];
    return detailsByType[leaveType] || [];
  }, [viewingDetails, holidayDetails]);

  const viewingTitle = useMemo(() => {
    if (!viewingDetails) return '';
    return usedHolidaysRows.find((r) => r.key === viewingDetails)?.type || '';
  }, [viewingDetails, usedHolidaysRows]);

  const viewingUsedDays = useMemo(() => {
    if (!viewingDetails) return 0;
    return usedHolidaysRows.find((r) => r.key === viewingDetails)?.used || 0;
  }, [viewingDetails, usedHolidaysRows]);

  if (isComponentLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-full animate-pulse rounded-md bg-slate-100" />
        <div className="h-40 w-full animate-pulse rounded-xl bg-slate-100" />
        <div className="h-40 w-full animate-pulse rounded-xl bg-slate-100" />
        <div className="h-40 w-full animate-pulse rounded-xl bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <CardContent className="p-0">
          <div className="p-4">
            <p className="text-sm font-semibold text-slate-900">
              {t('employees.profile.details.holidays.used.title')}
            </p>
          </div>

          <div className="border-t border-slate-100">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 border-slate-200">
                  <TableHead className="h-10 px-4 text-xs font-medium text-slate-700">
                    {t('employees.profile.details.holidays.used.table.type')}
                  </TableHead>
                  <TableHead className="h-10 px-4 text-xs font-medium text-slate-700">
                    {t('employees.profile.details.holidays.used.table.used')}
                  </TableHead>
                  <TableHead className="h-10 px-4 text-right text-xs font-medium text-slate-700">
                    {t('employees.profile.details.holidays.used.table.action')}
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {usedHolidaysRows.map((row) => (
                  <TableRow key={row.key} className="border-slate-100">
                    <TableCell className="py-4 px-4">
                      <UsedTypeBadge type={row.type} />
                    </TableCell>

                    <TableCell className="py-4 px-4 text-sm text-slate-900">
                      {formatCountWithUnit(t, row.used, 'day')}
                    </TableCell>

                    <TableCell className="py-4 px-4 text-right">
                      <Button variant="ghost" size="icon" onClick={() => sheet_holidays(row.key)} className="h-8 w-8">
                        <Eye className="h-4 w-4 text-slate-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {usedHolidaysRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="py-8 text-center text-sm text-slate-500">
                      {t('employees.profile.details.holidays.used.noRecords')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4">
            <p className="text-sm font-semibold text-slate-900">
              {t('employees.profile.details.holidays.balance.title')}
            </p>

            {!isEmployeeRole && (
              <Button variant="outline" size="sm" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t('employees.profile.details.holidays.balance.addHoliday')}
              </Button>
            )}
          </div>

          <div className="border-t border-slate-100">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 border-slate-200">
                  <TableHead className="h-10 px-4 text-xs font-medium text-slate-700">
                    {t('employees.profile.details.holidays.balance.table.reason')}
                  </TableHead>
                  <TableHead className="h-10 px-4 text-xs font-medium text-slate-700">
                    {t('employees.profile.details.holidays.balance.table.requestDate')}
                  </TableHead>
             <TableHead className="h-10 px-4 text-right text-xs font-medium text-slate-700">
  {t('employees.profile.details.holidays.balance.table.annual')}
</TableHead>

<TableHead className="h-10 px-4 text-right text-xs font-medium text-slate-700">
  {t('employees.profile.details.holidays.balance.table.casual')}
</TableHead>
                  <TableHead className="h-10 px-4 text-right text-xs font-medium text-slate-700">
                    {t('employees.profile.details.holidays.balance.table.action')}
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredAdditionalDaysRows.length > 0 ? (
                  filteredAdditionalDaysRows.map((r) => (
                    <TableRow key={r.id} className="border-slate-100">
                      <TableCell className="py-4 px-4">
                        <ReasonBadge label={r.reason} />
                      </TableCell>

                      <TableCell className="py-4 px-4 text-sm text-slate-900">
                        {format(new Date(r.requestDate), 'MMM dd,yyyy')}
                      </TableCell>

                      <TableCell className="py-4 px-4 text-right text-sm text-slate-900">
                        {formatCountWithUnit(t, r.annual, 'day')}
                      </TableCell>

                      <TableCell className="py-4 px-4 text-right text-sm text-slate-900">
                        {formatCountWithUnit(t, r.casual, 'day')}
                      </TableCell>

                      <TableCell className="py-4 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setHolidayToDelete(r);
                            setDeleteType('holiday');
                            setDeleteModalOpen(true);
                          }}
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="size-4 text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-sm text-slate-500">
                      {t('employees.profile.details.holidays.balance.noRecords')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <CardContent className="p-0">
          <div className="p-4">
            <p className="text-sm font-semibold text-slate-900">
              {t('employees.profile.details.holidays.encashment.title')}
            </p>
          </div>

          <div className="border-t border-slate-100">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 border-slate-200">
                  <TableHead className="h-10 px-4 text-xs font-medium text-slate-700">
                    {t('employees.profile.details.holidays.encashment.table.reason')}
                  </TableHead>
                  <TableHead className="h-10 px-4 text-xs font-medium text-slate-700">
                    {t('employees.profile.details.holidays.encashment.table.requestDate')}
                  </TableHead>
                  <TableHead className="h-10 px-4 text-xs font-medium text-slate-700">
                    {t('employees.profile.details.holidays.encashment.table.date')}
                  </TableHead>
                  <TableHead className="h-10 px-4 text-right text-xs font-medium text-slate-700">
                    {t('employees.profile.details.holidays.encashment.table.amount')}
                  </TableHead>
                  <TableHead className="h-10 px-4 text-right text-xs font-medium text-slate-700">
                    {t('employees.profile.details.holidays.encashment.table.action')}
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredAmountRows.length > 0 ? (
                  filteredAmountRows.map((r) => (
                    <TableRow key={r.id} className="border-slate-100">
                      <TableCell className="py-4 px-4">
                        <ReasonBadge label={r.reason} />
                      </TableCell>

                      <TableCell className="py-4 px-4 text-sm text-slate-900">
                        {format(new Date(r.requestDate), 'MMM dd,yyyy')}
                      </TableCell>

                      <TableCell className="py-4 px-4 text-sm text-slate-900">
                        {format(new Date(r.date), 'MMM dd,yyyy')}
                      </TableCell>

                      <TableCell className="py-4 px-4 text-right text-sm text-slate-900">{r.amount}</TableCell>

                      <TableCell className="py-4 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setHolidayToDelete(r);
                            setDeleteType('encashment');
                            setDeleteModalOpen(true);
                          }}
                          className="h-8 w-8 text-slate-200 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="size-4 text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-sm text-slate-500">
                      {t('employees.profile.details.holidays.encashment.noRecords')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {!isEmployeeRole && (
        <AddHolidayDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} addMutation={addHolidayMutation} />
      )}

      <HolidayDetailsModal
        open={!!viewingDetails}
        onClose={() => setViewingDetails(null)}
        title={viewingTitle}
        usedDays={viewingUsedDays}
        holidayDetails={recentActivity}
      />

      {deleteModalOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/30" onClick={() => setDeleteModalOpen(false)} />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setDeleteModalOpen(false)}>
            <div
              className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 p-6">
                <div className="flex size-12 items-center justify-center rounded-full bg-red-100">
                  <Trash2 className="size-6 text-red-600" />
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {deleteType === 'holiday'
                      ? t('employees.profile.details.holidays.delete.title.holiday')
                      : t('employees.profile.details.holidays.delete.title.encashment')}
                  </h3>
                  <p className="text-sm text-slate-600">{t('employees.profile.details.holidays.delete.warning')}</p>
                </div>

                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setDeleteModalOpen(false)}>
                  <X className="h-4 w-4 text-slate-600" />
                </Button>
              </div>

              <div className="h-px bg-slate-100" />

              <div className="px-6 pb-6">
                <p className="text-sm text-slate-600 mb-4">
                  {t('employees.profile.details.holidays.delete.message', {
                    type:
                      deleteType === 'holiday'
                        ? t('employees.profile.details.holidays.delete.type.holiday')
                        : t('employees.profile.details.holidays.delete.type.encashment'),
                  })}
                </p>

                {holidayToDelete && (
                  <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-slate-700">
                        {t('employees.profile.details.holidays.delete.labels.reason')}:
                      </span>
                      <span className="text-slate-900">{holidayToDelete.reason || '—'}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-slate-700">
                        {t('employees.profile.details.holidays.delete.labels.requestDate')}:
                      </span>
                      <span className="text-slate-900">
                        {format(new Date(holidayToDelete.requestDate), 'MMM dd, yyyy')}
                      </span>
                    </div>

                    {deleteType === 'holiday' ? (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-slate-700">Annual:</span>
                          <span className="text-slate-900">
                            {formatCountWithUnit(t, holidayToDelete.annual, 'day')}
                          </span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-slate-700">Casual:</span>
                          <span className="text-slate-900">
                            {formatCountWithUnit(t, holidayToDelete.casual, 'day')}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-slate-700">
                            {t('employees.profile.details.holidays.delete.labels.date')}:
                          </span>
                          <span className="text-slate-900">
                            {format(new Date(holidayToDelete.date), 'MMM dd, yyyy')}
                          </span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-slate-700">
                            {t('employees.profile.details.holidays.delete.labels.amount')}:
                          </span>
                          <span className="text-slate-900">{holidayToDelete.amount}</span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 px-6 pb-6">
                <Button
                  variant="outline"
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={deleteHolidayMutation.isPending || deleteEncashmentMutation.isPending}
                >
                  {t('employees.profile.details.holidays.delete.cancel')}
                </Button>

                <Button
                  variant="destructive"
                  onClick={() => {
                    if (deleteType === 'holiday') {
                      deleteHolidayMutation.mutate(holidayToDelete.id);
                    } else {
                      deleteEncashmentMutation.mutate(holidayToDelete.id);
                    }
                  }}
                  disabled={deleteHolidayMutation.isPending || deleteEncashmentMutation.isPending}
                >
                  {deleteHolidayMutation.isPending || deleteEncashmentMutation.isPending
                    ? t('employees.profile.details.holidays.delete.deleting')
                    : deleteType === 'holiday'
                      ? t('employees.profile.details.holidays.delete.confirm.holiday')
                      : t('employees.profile.details.holidays.delete.confirm.encashment')}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}