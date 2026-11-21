// src/features/employees/components/EmployeeCard.jsx
import {
  Edit,
  Trash,
  Eye,
  UserMinus,
  UserCheck,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { employeesApi } from '../api/employees.api';

export default function EmployeeCard({
  id,
  image,
  name,
  role,
  employeeId,
  joinDate,
  loading = false,
  isActive = true,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  onDeactivateClick,
  onActivateClick,
}) {
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleToggleStatus = async () => {
    if (isProcessing) return;

    // Deactivate: open confirmation dialog if handler provided
    if (isActive && onDeactivateClick) {
      onDeactivateClick();
      return;
    }
    // Activate: open confirmation dialog if handler provided
    if (!isActive && onActivateClick) {
      onActivateClick();
      return;
    }

    setIsProcessing(true);
    try {
      if (isActive) {
        await employeesApi.makeEmployeeInactive(id);
      } else {
        await employeesApi.makeEmployeeActive(id);
      }

      toast.success(isActive ? t('employees.employeeCard.deactivatedSuccessfully') : t('employees.employeeCard.activatedSuccessfully'));
      onToggleStatus?.(id, !isActive);
    } catch (error) {
      console.error('Failed to toggle employee status:', error);
      toast.error(t('employees.employeeCard.failedToUpdateStatus'));
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex w-full flex-col items-center gap-3 rounded-xl border border-gray-200 p-6 shadow-sm">
        <Skeleton className="size-20 rounded-full" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
    );
  }

  const StatusIcon = isActive ? UserMinus : UserCheck;

  // 🎨 styles
  const editBtnClass = isActive
    ? 'bg-light-success text-success'
    : 'bg-slate-200 text-slate-500';

  const toggleBtnClass = isActive
    ? 'bg-slate-200 text-slate-600'   // deactivate
    : 'bg-light-success text-success'; // activate

  const statusTitle = isActive ? t('employees.employeeCard.deactivateEmployee') : t('employees.employeeCard.activateEmployee');

  return (
    <div className="flex w-full flex-col items-center gap-4 rounded-xl border border-gray-200 p-6 shadow-sm">
      {/* avatar + name */}
      <div className="flex items-center gap-4 sm:flex-col sm:text-center">
        <img src={image} alt={name} className="size-12 rounded-full sm:size-20" />

        <div className="font-medium">
          <h2 className="text-lg sm:text-xl">{name}</h2>
          <span className="bg-tertiary rounded-full px-3 py-1 text-xs">
            {role || '—'}
          </span>
        </div>
      </div>

      {/* meta */}
      <div className="flex w-full flex-col gap-2 text-sm text-gray">
        <div className="flex justify-between">
          <span>{t('employees.employeeCard.employeeId')}</span>
          <span className="font-medium">{employeeId}</span>
        </div>
        <div className="flex justify-between">
          <span>{t('employees.employeeCard.joinDate')}</span>
          <span className="font-medium">{joinDate}</span>
        </div>
      </div>

      {/* actions */}
      <div className="mt-2 flex justify-center gap-6">
        {/* View */}
        <button
          className="bg-tertiary text-primary flex size-9 items-center justify-center rounded-full cursor-pointer"
          onClick={() => onView?.(id)}
          title={t('employees.employeeCard.viewProfile')}
        >
          <Eye className="size-4" />
        </button>

        {/* Edit (ALWAYS clickable) */}
        <button
          className={`${editBtnClass} flex size-9 items-center justify-center rounded-full cursor-pointer`}
          onClick={() => onEdit?.(id)}
          title={t('employees.employeeCard.editEmployee')}
        >
          <Edit className="size-4" />
        </button>

        {/* Activate / Deactivate */}
        <button
          className={`${toggleBtnClass} flex size-9 items-center justify-center rounded-full disabled:opacity-50 cursor-pointer`}
          onClick={handleToggleStatus}
          title={statusTitle}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <StatusIcon className="size-4" />
          )}
        </button>

        {/* Delete */}
        <button
          className="bg-light-error text-pink flex size-9 items-center justify-center rounded-full cursor-pointer"
          onClick={() => onDelete?.(id)}
          title={t('employees.employeeCard.deleteEmployee')}
        >
          <Trash className="size-4" />
        </button>
      </div>
    </div>
  );
}
