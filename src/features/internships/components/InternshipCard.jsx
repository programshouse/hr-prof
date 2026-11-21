// src/features/internships/components/InternshipCard.jsx
import { Edit, Trash2, Eye, UserMinus, UserCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useState } from 'react';
import { internshipsApi } from '../api/internships.api';
import { useNavigate } from 'react-router-dom';
import DeactivateEmployeeModal from '../../employees/components/DeactivateEmployeeModal';
import DeleteInternshipModal from './DeleteInternshipModal';

export function InternshipCard({
  id,
  image,
  name,
  role,
  code,
  joinDate,
  department,
  shift,
  phone,
  loading = false,
  isActive = true,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  onActivateClick,
  internship,
  employeeId,
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const { t } = useTranslation();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleToggleStatus = async () => {
    if (isProcessing) return;

    // For active internships, open deactivation modal
    if (isActive) {
      setDeactivateModalOpen(true);
      return;
    }

    // For inactive internships, activate directly (no confirmation needed)
    if (!isActive && onActivateClick) {
      onActivateClick();
      return;
    }

    setIsProcessing(true);
    try {
      await internshipsApi.makeInternshipActive(id);
      toast.success(t('internships.activatedSuccessfully'));
      onToggleStatus?.(id, !isActive);
    } catch (error) {
      const status = error?.response?.status;
      const url = error?.config?.url;
      const method = (error?.config?.method || '').toUpperCase();

      console.error('Failed to toggle internship status:', {
        status,
        method,
        url,
        error,
      });

      if (status === 404) {
        toast.error(`404 Not Found${url ? `: ${method} ${url}` : ''}`);
      } else {
        toast.error(t('internships.failedToUpdate'));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleView = () => {
    if (onView) return onView(id);
    const targetId = employeeId ?? internship?.employee_id ?? internship?.employee?.id ?? id;

    navigate(`/employees/${targetId}`);
  };

  if (loading) {
    return (
      <div className="flex w-full flex-col items-center gap-3 rounded-xl border border-gray-200 p-6 shadow-sm">
        <Skeleton className="size-20 rounded-full" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-24" />
        <div className="mt-2 w-full space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </div>
    );
  }

  const StatusIcon = isActive ? UserMinus : UserCheck;

  // 🎨 styles (UNCHANGED)
  const editBtnClass = isActive ? 'bg-light-success text-success' : 'bg-slate-200 text-slate-500';
  const toggleBtnClass = isActive ? 'bg-slate-200 text-slate-600' : 'bg-light-success text-success';
  const statusTitle = isActive
    ? t('internships.actions.deactivate')
    : t('internships.actions.activate');

  return (
    <div className="flex w-full flex-col items-center gap-4 rounded-xl border border-gray-200 p-6 shadow-sm">
      {/* avatar + name */}
      <div className="flex items-center gap-4 sm:flex-col sm:text-center">
        <div className="flex size-12 items-center justify-center overflow-hidden rounded-full bg-gray-200 sm:size-20">
          {image ? (
            <img
              src={image}
              alt={name || t('common.intern')}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-lg font-semibold text-gray-500 sm:text-2xl">
              {name?.charAt(0)?.toUpperCase() || 'I'}
            </span>
          )}
        </div>

        <div className="font-medium">
          <h2 className="text-lg sm:text-xl">{name || '—'}</h2>
          <span className="bg-tertiary text-primary rounded-full px-3 py-1 text-xs">
            {role || '—'}
          </span>
        </div>
      </div>

      {/* meta */}
      <div className="text-gray flex w-full flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <span>{t('tables.headers.id')}</span>
          <span className="font-medium">{code || '—'}</span>
        </div>

        <div className="flex justify-between">
          <span>{t('tables.headers.joinDate')}</span>
          <span className="font-medium">{joinDate || '—'}</span>
        </div>

        <div className="flex justify-between">
          <span>{t('tables.headers.department')}</span>
          <span className="font-medium">{department || '—'}</span>
        </div>

        <div className="flex justify-between">
          <span>{t('tables.headers.shift')}</span>
          <span className="font-medium">{shift || '—'}</span>
        </div>

        <div className="flex justify-between">
          <span>{t('tables.headers.phone')}</span>
          <span className="font-medium">{phone || '—'}</span>
        </div>
      </div>

      {/* actions (UNCHANGED design/colors) */}
      <div className="mt-2 flex justify-center gap-6">
        {/* View -> employees/:id */}
        <button
          className="bg-tertiary text-primary flex size-9 cursor-pointer items-center justify-center rounded-full"
          onClick={handleView}
          title={t('internships.actions.viewProfile')}
        >
          <Eye className="size-4" />
        </button>

        {/* Edit */}
        <button
          className={`${editBtnClass} flex size-9 cursor-pointer items-center justify-center rounded-full`}
          onClick={() =>
            onEdit?.(
              internship || { id, name, role, code, joinDate, department, shift, phone, isActive }
            )
          }
          title={t('internships.actions.edit')}
        >
          <Edit className="size-4" />
        </button>

        {/* Activate / Deactivate */}
        <button
          className={`${toggleBtnClass} flex size-9 cursor-pointer items-center justify-center rounded-full disabled:opacity-50`}
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
          className="bg-light-error text-pink flex size-9 cursor-pointer items-center justify-center rounded-full"
          onClick={() => setDeleteModalOpen(true)}
          title={t('internships.actions.delete')}
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      {/* Deactivate Confirmation Modal */}
      <DeactivateEmployeeModal
        open={deactivateModalOpen}
        onOpenChange={setDeactivateModalOpen}
        employee={
          internship || { id, name, role, code, joinDate, department, shift, phone, isActive }
        }
        onSuccess={() => {
          setDeactivateModalOpen(false);
          onToggleStatus?.(id, false);
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteInternshipModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        internship={
          internship || { id, name, role, code, joinDate, department, shift, phone, isActive }
        }
        onRefresh={onDelete}
      />
    </div>
  );
}
