import { Button } from '@/components/ui/button';
import { Edit, Trash2, MoveLeft, MoveRight } from 'lucide-react';
import { buildAvatarUrl } from '@/lib/utils/avatarUtils';
import { formatHoursMinutesShort } from '@/utils/durationLabels';

import i18n from '@/i18n';

const formatTime = (dateTimeStr) => {
  if (!dateTimeStr) return '--:--';

  const raw = String(dateTimeStr).trim();

  // IMPORTANT:
  // Do NOT use new Date(dateTimeStr)
  // because "2026-04-18T06:30:00.000000Z" becomes "08:30" in Egypt timezone.
  const match = raw.match(/(?:T|\s|^)(\d{1,2}):(\d{2})(?::\d{2})?/);

  if (!match) return '--:--';

  let hour = Number(match[1]);
  const minute = match[2];

  if (Number.isNaN(hour) || hour < 0 || hour > 23) return '--:--';

  const isAr = i18n.language.startsWith('ar');
  const period = hour >= 12 ? 'PM' : 'AM';

  hour = hour % 12 || 12;

  const formattedHour = String(hour).padStart(2, '0');

  if (isAr) {
    return `${formattedHour}:${minute} ${period === 'AM' ? 'ص' : 'م'}`;
  }

  return `${formattedHour}:${minute} ${period.toLowerCase()}`;
};

export const getAttendanceColumns = (onEdit, onDelete, t) => {
  return [
    {
      accessorKey: 'id',
      header: t('tables.headers.id'),
      cell: ({ row }) => (
        <span className="text-xs font-medium text-slate-900 md:text-sm">
          {row.original.employee?.code || t('common.na')}
        </span>
      ),
    },
    {
      accessorKey: 'employee.name',
      header: t('tables.headers.name'),
      cell: ({ row }) => {
        const employee = row.original.employee;
        const avatarUrl = buildAvatarUrl(employee?.name, employee?.image);

        return (
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={employee?.name || 'Employee'}
                className="size-8 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold">
                {employee?.name?.charAt(0).toUpperCase() || t('common.na')}
              </div>
            )}

            <div className="text-sm font-medium text-slate-900">
              {employee?.name || t('common.na')}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'check_in',
      header: t('attendance.headers.clockInOut'),
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-black">
            {formatTime(row.original.check_in)}
          </span>

          <div className="text-default flex items-center gap-1">
            <MoveLeft strokeWidth={1} className="size-6" />

            <span className="font-medium">
              {formatHoursMinutesShort(t, row.original.worked_minutes)}
            </span>

            <MoveRight strokeWidth={1} className="size-6" />
          </div>

          <span className="text-black">
            {formatTime(row.original.check_out)}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'total_overtime',
      header: t('attendance.headers.overTime'),
      cell: ({ row }) => {
        const overtimeMinutes = row.original.total_overtime || 0;
        const overtimeClass = overtimeMinutes > 0 ? 'text-success' : 'text-black';

        return (
          <span className={`text-xs font-medium md:text-sm ${overtimeClass}`}>
            {formatHoursMinutesShort(t, overtimeMinutes)}
          </span>
        );
      },
    },
    {
      accessorKey: 'employee.position',
      header: t('attendance.headers.position'),
      cell: ({ row }) => {
        const position = row.original.employee?.position;

        return (
          <span
            className={`inline-flex min-w-28 justify-center rounded-md px-2 py-1 text-xs font-medium md:rounded-lg md:px-3 md:py-1.5 md:text-sm ${
              position || ''
            }`}
          >
            {position
              ? position.charAt(0).toUpperCase() + position.slice(1)
              : t('common.na')}
          </span>
        );
      },
    },
    {
      accessorKey: 'employee.shift',
      header: t('attendance.headers.shift'),
      cell: ({ row }) => (
        <span className="text-xs font-medium text-slate-900 capitalize md:text-sm">
          {row.original.employee?.shift?.replace('_', ' ') || t('common.na')}
        </span>
      ),
    },
    {
      id: 'actions',
      header: t('tables.headers.action'),
      cell: ({ row }) => (
        <div className="border-default text-gray flex w-fit items-center rounded-[10px] border-[0.5px]">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-e-none hover:bg-slate-200"
            onClick={() => onEdit(row.original)}
          >
            <Edit className="size-4 transition-colors" />
          </Button>

          <div className="border-light-default h-5 w-[0.5px] border-[0.5px]" />

          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-s-none hover:bg-red-100"
            onClick={() => onDelete(row.original)}
          >
            <Trash2 className="size-4 transition-colors" />
          </Button>
        </div>
      ),
    },
  ];
};