import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { NameWithInitials } from './ExceptionsTable';
import { formatRequestTime, getRequestStatusColorClass, translateRequestStatus } from '@/utils/requestLabels';
import i18n from '@/i18n';
import { resolveEmployeeDisplayName } from '@/lib/utils/employeeDisplayName';

const formatTime = (timeStr) => {
  if (!timeStr) return '--:--';
  return formatRequestTime(timeStr, i18n.language);
};

// ✅ helper: resolve position name using positions list
const resolvePositionName = (rowOriginal, positions = [], isArabic = false) => {
  const employee = rowOriginal?.employee || rowOriginal?.applicant || rowOriginal;
  const positionSource = employee?.position || rowOriginal?.position || {};

  const direct =
    (typeof positionSource === 'string' ? positionSource : null) ||
    (isArabic
      ? positionSource.title_ar || positionSource.name_ar || positionSource.position_name_ar
      : positionSource.title_en || positionSource.name_en || positionSource.position_name) ||
    positionSource.name ||
    positionSource.title ||
    rowOriginal?.position_name ||
    rowOriginal?.position_name_ar ||
    rowOriginal?.position_name_en;

  if (direct && direct !== 'Unknown Position') return direct;

  const positionId =
    employee?.position_id ||
    employee?.position?.id ||
    rowOriginal?.position_id ||
    rowOriginal?.position?.id ||
    rowOriginal?.employee?.position_id ||
    rowOriginal?.employee?.position?.id ||
    rowOriginal?.applicant?.position_id;

  if (!positionId || !Array.isArray(positions) || positions.length === 0) return '--';

  const found = positions.find((p) => String(p.id) === String(positionId));
  if (!found) return '--';

  if (isArabic) {
    return found.title_ar || found.name_ar || found.position_name_ar || found.title_en || found.name_en || found.name || '--';
  }

  return found.title_en || found.name_en || found.position_name || found.title_ar || found.name_ar || found.name || '--';
};

export const getExceptionsColumns = (onEdit, onDelete, positions = [], t, isArabic = false) => [
  {
    accessorKey: 'id',
    header: t('exceptions.headers.id'),
    cell: ({ row }) => (
      <span className="text-xs font-medium text-slate-900 md:text-sm">
        {row.original.employee?.code || row.original.id || t('common.na')}
      </span>
    ),
  },
  {
    accessorKey: 'employee.name',
    header: t('exceptions.headers.name'),
    cell: ({ row }) => {
      const candidate = row.original.employee || row.original.applicant || row.original;
      const name =
        resolveEmployeeDisplayName(candidate, { preferArabic: isArabic }) ||
        resolveEmployeeDisplayName(candidate?.applicant, { preferArabic: isArabic }) ||
        candidate?.name ||
        candidate?.full_name ||
        candidate?.employee_name ||
        'Unknown Employee';
      const positionName = resolvePositionName(row.original, positions, isArabic);

      return <NameWithInitials name={name} position={positionName} />;
    },
  },
  {
    accessorKey: 'from_date',
    header: t('exceptions.headers.fromDate'),
    cell: ({ row }) => {
      const date = row.original.from_date;
      if (!date) return <span className="text-sm">{t('common.na')}</span>;

      try {
        const dateObj = new Date(date);
        return <span className="text-sm">{format(dateObj, 'MM/dd/yyyy')}</span>;
      } catch {
        return <span className="text-sm">{date}</span>;
      }
    },
  },
  {
    accessorKey: 'to_date',
    header: t('exceptions.headers.toDate'),
    cell: ({ row }) => {
      const date = row.original.to_date;
      if (!date) return <span className="text-sm">{t('common.na')}</span>;

      try {
        const dateObj = new Date(date);
        return <span className="text-sm">{format(dateObj, 'MM/dd/yyyy')}</span>;
      } catch {
        return <span className="text-sm">{date}</span>;
      }
    },
  },
  {
    accessorKey: 'start_time',
    header: t('exceptions.headers.from'),
    cell: ({ row }) => (
      <span className="text-sm font-medium text-slate-900">{formatTime(row.original.start_time)}</span>
    ),
  },
  {
    accessorKey: 'end_time',
    header: t('exceptions.headers.to'),
    cell: ({ row }) => (
      <span className="text-sm font-medium text-slate-900">{formatTime(row.original.end_time)}</span>
    ),
  },
  {
    accessorKey: 'reason',
    header: t('exceptions.headers.reason'),
    cell: ({ row }) => <span className="text-sm text-slate-600">{row.original.reason || t('common.na')}</span>,
  },
  {
    accessorKey: 'status',
    header: t('exceptions.headers.status'),
    cell: ({ row }) => {
      const status = row.original.status || 'pending';
      const colorClass = getRequestStatusColorClass(status);

      return (
        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${colorClass}`}>
          {translateRequestStatus(t, status)}
        </span>
      );
    },
  },
  {
    id: 'actions',
    header: t('exceptions.headers.action'),
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