import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Pagination } from '@/components/ui/Pagination';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getMissionStatusLabel } from '../utils/missionStatus';

/* ---------------------------------------------
  Helpers
--------------------------------------------- */
function getInitials(name) {
  if (!name) return '';
  const words = name.split(' ');
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (
    words[0].charAt(0).toUpperCase() +
    words[words.length - 1].charAt(0).toUpperCase()
  );
}

/* ---------------------------------------------
  Status
--------------------------------------------- */
function StatusPill({ status, t }) {
  const s = String(status || '').toLowerCase();

  const styles =
    s === 'finished' || s === 'completed'
      ? 'bg-green-100 text-green-700'
      : s === 'ongoing' || s === 'active'
      ? 'bg-indigo-100 text-primary'
      : s === 'upcoming' || s === 'planning'
      ? 'bg-slate-100 text-slate-600'
      : s === 'canceled' || s === 'cancelled'
      ? 'bg-amber-100 text-amber-700'
      : 'bg-slate-100 text-slate-600';

  return (
    <span className={`inline-flex items-center rounded-md px-3 py-1 text-xs font-medium ${styles}`}>
      {getMissionStatusLabel(status, t)}
    </span>
  );
}

/* ---------------------------------------------
  Employee name FIX
--------------------------------------------- */
function getEmployeeName(emp, i18n) {
  if (!emp) return '—';

  const applicant = emp.applicant;

  const ar = applicant?.full_name_ar;
  const en = applicant?.full_name;

  return i18n.language === 'ar' ? ar || en || '—' : en || ar || '—';
}

/* ---------------------------------------------
  Actions (RESTORED BORDER STYLE)
--------------------------------------------- */
function ActionGroup({ onView, onEdit, onDelete, t }) {
  const baseBtn =
    'inline-flex h-9 w-11 items-center justify-center text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700';

  return (
    <div className="inline-flex overflow-hidden rounded-lg border border-slate-200 bg-white">
      <button onClick={onView} className={baseBtn} title={t('view')}>
        <Eye className="h-4 w-4" />
      </button>

      <div className="h-9 w-px bg-slate-200" />

      <button onClick={onEdit} className={baseBtn} title={t('edit')}>
        <Pencil className="h-4 w-4" />
      </button>

      <div className="h-9 w-px bg-slate-200" />

      <button onClick={onDelete} className={`${baseBtn} hover:text-red-600`} title={t('delete')}>
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

/* ---------------------------------------------
  Table
--------------------------------------------- */
export default function ExternalMissionsTable({
  missions = [],
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  isLoading = false,
  error = null,
  onView,
  onEdit,
  onDelete,
}) {
  const { t, i18n } = useTranslation();

  const getMissionEmployees = (mission) => mission.employees || [];

  const formatCost = (mission) => {
    const value = mission.estimated_cost ?? 0;
    const num = Number(value);
    return Number.isFinite(num) ? num.toLocaleString() : '0';
  };

  const formatDate = (value) => value || '--';

  const formatEmployeesLabel = (count) => {
    if (i18n.language === 'ar') return `${count} موظفون`;
    return `${count} employees`;
  };

  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('externalMissions.table.headers.missionId')}</TableHead>
            <TableHead>{t('externalMissions.table.headers.employees')}</TableHead>
            <TableHead>{t('externalMissions.table.headers.destination')}</TableHead>
            <TableHead>{t('externalMissions.table.headers.startDate')}</TableHead>
            <TableHead>{t('externalMissions.table.headers.endDate')}</TableHead>
            <TableHead>{t('externalMissions.table.headers.estimatedCost')}</TableHead>
            <TableHead>{t('externalMissions.table.headers.status')}</TableHead>
            <TableHead>{t('externalMissions.table.headers.action')}</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {missions.map((mission) => {
            const employees = getMissionEmployees(mission);

            return (
              <TableRow key={mission.id}>
                <TableCell>
                  <p className="font-semibold">{mission.id}</p>
                </TableCell>

                {/* Employees */}
                <TableCell>
                  {employees.length === 1 ? (
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {getInitials(getEmployeeName(employees[0], i18n))}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <p className="font-medium">
                          {getEmployeeName(employees[0], i18n)}
                        </p>
                        <p className="text-xs text-gray-500">
                          ID: {employees[0]?.id || '--'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-semibold">
                        {employees.length}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {formatEmployeesLabel(employees.length)}
                        </p>
                      </div>
                    </div>
                  )}
                </TableCell>

                <TableCell>{mission.destination || '--'}</TableCell>
                <TableCell>{formatDate(mission.start_date)}</TableCell>
                <TableCell>{formatDate(mission.end_date)}</TableCell>
                <TableCell>{formatCost(mission)}</TableCell>

                <TableCell>
                  <StatusPill status={mission.status} t={t} />
                </TableCell>

                <TableCell>
                  <ActionGroup
                    onView={() => onView?.(mission)}
                    onEdit={() => onEdit?.(mission)}
                    onDelete={() => onDelete?.(mission)}
                    t={t}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <div className="flex justify-between border-t p-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}