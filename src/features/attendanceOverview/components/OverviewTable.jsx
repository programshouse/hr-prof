// src/features/attendanceOverview/components/OverviewTable.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import SheetDialogTrigger from './AttendanceSheetDialogTrigger';
import AbsenceDialogTrigger from './AbsenceDialogTrigger';
import IncompleteDialogTrigger from './IncompleteDialogTrigger';
import OvertimeDialogTrigger from './OvertimeDialogTrigger';
import { EmptyState } from '@/components/error/EmptyState';
import { buildAvatarUrl } from '@/lib/utils/avatarUtils';

const OverviewTable = ({ rows = [], isLoading, month, fromDate, toDate }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleGoToPage = (employeeId) => {
    // keep employee internal sheet on same month as the overview filters
    const qs = month ? `?month=${encodeURIComponent(month)}` : '';
    navigate(`/attendance/employee/${employeeId}${qs}`);
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="w-20 text-xs font-semibold text-slate-500">{t('attendance.overviewTable.id')}</TableHead>
            <TableHead className="text-xs font-semibold text-slate-500">{t('attendance.overviewTable.employee')}</TableHead>
            <TableHead className="text-xs font-semibold text-slate-500">{t('attendance.overviewTable.attendanceDays')}</TableHead>
            <TableHead className="text-xs font-semibold text-slate-500">{t('attendance.overviewTable.absenceDays')}</TableHead>
            <TableHead className="text-xs font-semibold text-slate-500">
              {t('attendance.overviewTable.incompleteShifts')}
            </TableHead>
            <TableHead className="text-xs font-semibold text-slate-500">{t('attendance.overviewTable.overtimeWorked')}</TableHead>

            <TableHead className="w-24 text-center text-xs font-semibold text-slate-500">
              {t('attendance.overviewTable.summary')}
            </TableHead>

          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={`skeleton-${index}`} className="border-b border-slate-100">
                {Array.from({ length: 8 }).map((__, cellIndex) => (
                  <TableCell key={`skeleton-cell-${cellIndex}`}>
                    <div className="h-4 animate-pulse rounded bg-slate-200" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : rows.length > 0 ? (
            rows.map((row) => (
              <TableRow
                key={row.employeeId}
                className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60"
              >
                <TableCell className="text-xs text-black">{row.id}</TableCell>

                <TableCell>
                  <div className="flex items-center gap-3">
                    <img
                      src={buildAvatarUrl(row.name, row.image)}
                      alt={row.name || 'Employee'}
                      className="h-9 w-9 shrink-0 rounded-full object-cover"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-900">{row.name || '__'}</span>
                      <span className="text-[11px] font-medium text-primary">{row.role}</span>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <SheetDialogTrigger
                    value={row.attendanceDays}
                    employeeId={row.employeeId}
                    month={month}
                  />
                </TableCell>

                <TableCell>
                  <AbsenceDialogTrigger
                    value={row.absenceDays}
                    employeeId={row.employeeId}
                    from={fromDate}
                    to={toDate}
                  />
                </TableCell>

                <TableCell>
                  <IncompleteDialogTrigger
                    value={row.incompleteShifts?.value}
                    duration={row.incompleteShifts?.duration}
                    employeeId={row.employeeId}
                    month={month}
                  />
                </TableCell>

                <TableCell>
                  <OvertimeDialogTrigger
                    value={row.overtimeWorked?.value}
                    duration={row.overtimeWorked?.duration}
                    employeeId={row.employeeId}
                    month={month}
                  />
                </TableCell>

                {/* ✅ icon-only square button */}
                <TableCell className="text-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleGoToPage(row.employeeId)}
                    className="h-8 w-8"
                    title={t('attendance.overviewTable.viewSummary')}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-48 text-center">
                <EmptyState title={t('emptyStates.noAttendanceOverviewData')} />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default OverviewTable;