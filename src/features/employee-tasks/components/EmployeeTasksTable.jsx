import { Edit, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const TB = 'employees.tasksBoard';

const priorityStyles = {
  critical: 'border-red-300 bg-red-50 text-red-600',
  urgent: 'border-pink-300 bg-pink-50 text-pink-600',
  medium: 'border-indigo-300 bg-indigo-50 text-indigo-600',
  low: 'border-slate-200 bg-slate-50 text-slate-600',
  high: 'border-orange-300 bg-orange-50 text-orange-600',
};

const statusStyles = {
  pending: 'bg-yellow-100 text-yellow-700',
  'in progress': 'bg-blue-100 text-slate-700',
  done: 'bg-green-100 text-green-600',
  review: 'bg-gray-300 text-slate-700',
};

const getTaskEmployeeNames = (item) => {
  if (item?.employee_name) return item.employee_name;
  if (item?.employee?.name) return item.employee.name;
  if (item?.employee?.employee_name) return item.employee.employee_name;

  const employees =
    item?.employees || item?.assigned_employees || item?.assignedEmployees || [];

  if (Array.isArray(employees) && employees.length > 0) {
    const names = employees
      .map(
        (employee) =>
          employee?.employee_name ||
          employee?.full_name ||
          employee?.name ||
          employee?.name_en ||
          employee?.name_ar
      )
      .filter(Boolean);

    if (names.length > 0) return names.join(', ');
  }

  return '—';
};

const normalizeDateValue = (value) => {
  if (!value) return null;

  const raw = String(value).trim();

  // Handles: 2026-06-01
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return new Date(`${raw}T00:00:00`);
  }

  // Handles: 2026-06-01 14:30:00
  return new Date(raw.includes('T') ? raw : raw.replace(' ', 'T'));
};

const toArabicAmPm = (value) => {
  return value
    .replace('AM', 'ص')
    .replace('PM', 'م')
    .replace('am', 'ص')
    .replace('pm', 'م')
    .replace('صباحًا', 'ص')
    .replace('مساءً', 'م')
    .replace('صباحا', 'ص')
    .replace('مساء', 'م');
};

const formatDate = (value, isAr) => {
  if (!value) return '—';

  const date = normalizeDateValue(value);

  if (!date || Number.isNaN(date.getTime())) {
    return value || '—';
  }

  return new Intl.DateTimeFormat(isAr ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

const formatDateTime12 = (value, isAr) => {
  if (!value) return '—';

  const date = normalizeDateValue(value);

  if (!date || Number.isNaN(date.getTime())) {
    return value || '—';
  }

  let formatted = new Intl.DateTimeFormat(isAr ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);

  if (isAr) {
    formatted = toArabicAmPm(formatted);
  }

  return formatted;
};

function PriorityBadge({ value, t }) {
  const priority = value || 'medium';
  const key = priority.toLowerCase();

  const getPriorityLabel = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return t(`${TB}.urgent`);
      case 'critical':
        return t(`${TB}.critical`);
      case 'medium':
        return t(`${TB}.medium`);
      case 'low':
        return t(`${TB}.low`);
      case 'high':
        return t(`${TB}.high`);
      default:
        return priority;
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${
        priorityStyles[key] || 'border-slate-200 bg-slate-50 text-slate-600'
      }`}
    >
      <span className="mx-1 h-1.5 w-1.5 rounded-full bg-current" />
      {getPriorityLabel(priority)}
    </span>
  );
}

function StatusBadge({ value, t }) {
  const status = value || 'pending';
  const key = status.toLowerCase();

  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return t(`${TB}.todo`);
      case 'in progress':
        return t(`${TB}.inProgress`);
      case 'done':
        return t(`${TB}.done`);
      case 'review':
        return t(`${TB}.review`);
      default:
        return status;
    }
  };

  return (
    <span
      className={`inline-flex min-w-[86px] items-center justify-center rounded-md px-4 py-2 text-[11px] font-medium ${
        statusStyles[key] || 'bg-slate-100 text-slate-600'
      }`}
    >
      {getStatusLabel(status)}
    </span>
  );
}

export function EmployeeTasksTable({
  tasks = [],
  onEdit,
  onView,
  onDelete,
  isLoading = false,
  canEdit = true,
  canDelete = true,
}) {
  const { t, i18n } = useTranslation();

  const rows = Array.isArray(tasks) ? tasks : [];
  const isAr = i18n.language?.startsWith('ar');

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} className="w-full">
      <div className="overflow-hidden rounded-none border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow className="h-[66px] bg-slate-50 hover:bg-slate-50">
              <TableHead className="px-12 text-[13px] font-bold text-slate-900">
                {t('employeeTasks.taskNumber')}
              </TableHead>

              <TableHead className="px-8 text-[13px] font-bold text-slate-900">
                {t('employeeTasks.title')}
              </TableHead>

              <TableHead className="px-8 text-[13px] font-bold text-slate-900">
                {t('employeeTasks.employee')}
              </TableHead>

              <TableHead className="px-8 text-[13px] font-bold text-slate-900">
                {t('employeeTasks.addedAt')}
              </TableHead>

              <TableHead className="px-8 text-[13px] font-bold text-slate-900">
                {t('employeeTasks.startDate')}
              </TableHead>

              <TableHead className="px-8 text-[13px] font-bold text-slate-900">
                {t('employeeTasks.dueDate')}
              </TableHead>

              <TableHead className="px-8 text-[13px] font-bold text-slate-900">
                {t('employeeTasks.priority')}
              </TableHead>

              <TableHead className="px-8 text-[13px] font-bold text-slate-900">
                {t('employeeTasks.status')}
              </TableHead>

              <TableHead className="px-8 text-center text-[13px] font-bold text-slate-900">
                {t('employeeTasks.action')}
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="h-32 text-center text-sm font-medium text-slate-500"
                >
                  {t('common.loading') || 'Loading...'}
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="h-32 text-center text-sm font-medium text-slate-500"
                >
                  {t('employeeTasks.noTasksFound') || 'No tasks found'}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((item, index) => (
                <TableRow
                  key={item.id || index}
                  className="h-[72px] border-b border-slate-100 hover:bg-slate-50/40"
                >
                  <TableCell className="px-12 text-[12px] font-semibold text-slate-900">
                    {item.task_number || item.id || '—'}
                  </TableCell>

                  <TableCell className="px-8 text-[12px] font-semibold text-slate-900">
                    {item.name || item.title || '—'}
                  </TableCell>

                  <TableCell className="px-8 text-[12px] font-semibold text-slate-900">
                    {getTaskEmployeeNames(item)}
                  </TableCell>

                  <TableCell className="px-8 text-[12px] font-semibold text-slate-900">
                    {formatDateTime12(item.added_at || item.created_at, isAr)}
                  </TableCell>

                  <TableCell className="px-8 text-[12px] font-semibold text-slate-900">
                    {formatDate(item.start_date, isAr)}
                  </TableCell>

                  <TableCell className="px-8 text-[12px] font-semibold text-slate-900">
                    {formatDate(item.due_date, isAr)}
                  </TableCell>

                  <TableCell className="px-8">
                    <PriorityBadge value={item.priority} t={t} />
                  </TableCell>

                  <TableCell className="px-8">
                    <StatusBadge value={item.status} t={t} />
                  </TableCell>

                  <TableCell className="px-8">
                    <div className="flex items-center justify-center">
                      <div className="flex overflow-hidden rounded-md border border-slate-200 bg-white">
                        {canEdit && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit?.(item)}
                            className="h-8 w-9 rounded-none border-r border-slate-200 text-slate-500 hover:bg-slate-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => onView?.(item)}
                          className={`h-8 w-9 rounded-none text-slate-500 hover:bg-slate-50 ${canDelete ? 'border-r border-slate-200' : ''}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {canDelete && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete?.(item)}
                            className="h-8 w-9 rounded-none text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}