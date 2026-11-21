import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Calendar, Clock, AlertCircle, Edit, Trash2, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { AddExceptionDialog } from '@/features/exceptions/components/AddExceptionDialog';
import { EditExceptionDialog } from '@/features/exceptions/components/EditExceptionDialog';
import { DeleteExceptionDialog } from '@/features/exceptions/components/DeleteExceptionDialog';
import { exceptionsApi } from '@/features/exceptions/api/exceptions.api';
import { useAuthStore } from '@/services/auth/auth.store';
import { useEmployeeProfileStore } from '@/stores/useEmployeeProfileStore';
import { getHeaderEmployeeData } from '@/features/employees/pages/employeesUtils';

function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <Icon className="h-5 w-5 text-slate-600" />
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
    </div>
  );
}

import i18n from '@/i18n';

const formatTime = (timeStr) => {
  if (!timeStr) return '--:--';
  try {
    const date = new Date(`2000-01-01 ${timeStr}`);
    let formatted = format(date, 'hh:mm a');
    const isAr = i18n.language.startsWith('ar');
    if (isAr) {
      return formatted.replace('AM', 'ص').replace('PM', 'م');
    }
    return formatted.toLowerCase();
  } catch {
    return timeStr;
  }
};

export default function EmployeeExceptions({ employeeId, isLoading: parentLoading }) {
  const { t } = useTranslation();
  const { role, user } = useAuthStore();
  const profile = useEmployeeProfileStore((s) => s.profile);
  // Resolve name the same way as the profile header
  const headerEmployee = getHeaderEmployeeData(profile);
  const employeeName =
    headerEmployee?.name ||
    user?.name ||
    user?.full_name ||
    null;
  const [exceptions, setExceptions] = useState([]);
  const [exceptionsLoading, setExceptionsLoading] = useState(false);

  // Add
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingException, setEditingException] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingException, setDeletingException] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchExceptions = async () => {
    if (!employeeId) return;
    try {
      setExceptionsLoading(true);
      const { data } = await exceptionsApi.getExceptions({ pageSize: 10000, employee_id: employeeId });
      const own = (data || []).filter(
        (item) => String(item.employee_id) === String(employeeId)
      );
      setExceptions(own);
    } catch (error) {
      console.error('Failed to fetch exceptions:', error);
      setExceptions([]);
    } finally {
      setExceptionsLoading(false);
    }
  };

  useEffect(() => {
    fetchExceptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  const refetch = fetchExceptions;

  // ── ADD ──────────────────────────────────────────────────────────────────
  const handleAddSubmit = async (payload) => {
    setIsAdding(true);
    try {
      await exceptionsApi.createException({
        ...payload,
        // Always override employee_ids to this employee's id
        employee_ids: [String(employeeId)],
        // Employees always submit as pending; HR can set any status
        status: role === 'employee' ? 'pending' : (payload.status || 'pending'),
      });
      toast.success(t('employees.profile.manager.exceptions.toastMessages.createSuccess', 'Exception created successfully'));
      setIsAddModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Failed to create exception:', error);
      toast.error(t('employees.profile.manager.exceptions.toastMessages.createError', 'Failed to create exception'));
    } finally {
      setIsAdding(false);
    }
  };

  // ── EDIT ─────────────────────────────────────────────────────────────────
  const handleEdit = (exception) => {
    setEditingException(exception);
    setIsEditModalOpen(true);
  };

  const handleUpdateSubmit = async (payload) => {
    setIsSubmitting(true);
    try {
      const fromDate = payload.from_date || editingException?.from_date || editingException?.date;
      const toDate   = payload.to_date   || editingException?.to_date   || editingException?.date || fromDate;

      await exceptionsApi.updateException({
        employee_id: employeeId,
        employee_ids: [String(employeeId)],
        from_date: fromDate,
        to_date: toDate,
        data: {
          ...payload.data,
          // Employees always stay pending; HR can change it
          status: role === 'employee' ? 'pending' : (payload.data?.status || 'pending'),
        },
      });
      toast.success(t('employees.profile.manager.exceptions.toastMessages.updateSuccess'));
      setIsEditModalOpen(false);
      setEditingException(null);
      refetch();
    } catch (error) {
      console.error('Failed to update exception:', error);
      toast.error(t('employees.profile.manager.exceptions.toastMessages.deleteError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── DELETE ────────────────────────────────────────────────────────────────
  const handleDeleteClick = (exception) => {
    setDeletingException(exception);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingException) return;

    const fromDate = deletingException.from_date || deletingException.date;
    const toDate   = deletingException.to_date   || deletingException.date || fromDate;

    if (!fromDate || !toDate) {
      toast.error(t('employees.profile.manager.exceptions.toastMessages.missingId'));
      return;
    }

    setIsDeleting(true);
    try {
      await exceptionsApi.deleteException({
        employee_id: deletingException.employee_id ?? employeeId,
        from_date: fromDate,
        to_date: toDate,
      });
      await refetch();
      toast.success(t('employees.profile.manager.exceptions.toastMessages.deleteSuccess'));
    } catch (error) {
      console.error('Failed to delete exception:', error);
      toast.error(t('employees.profile.manager.exceptions.toastMessages.deleteError'));
    } finally {
      setIsDeleteDialogOpen(false);
      setDeletingException(null);
      setIsDeleting(false);
    }
  };

  const isLoading = parentLoading || exceptionsLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <SectionHeader icon={AlertCircle} title={t('employees.profile.manager.exceptions.title')} />
          <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            {t('exceptions.addException', 'Add Exception')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {exceptions.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('employees.profile.manager.exceptions.tableHeaders.date')}</TableHead>
                  <TableHead>{t('employees.profile.manager.exceptions.tableHeaders.startTime')}</TableHead>
                  <TableHead>{t('employees.profile.manager.exceptions.tableHeaders.endTime')}</TableHead>
                  <TableHead>{t('employees.profile.manager.exceptions.tableHeaders.reason')}</TableHead>
                  <TableHead className="text-right">{t('employees.profile.manager.exceptions.tableHeaders.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exceptions.map((exception) => (
                  <TableRow key={exception.id ?? `${exception.employee_id}-${exception.from_date}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-500" />
                        {exception.date || exception.from_date}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-500" />
                        {formatTime(exception.start_time)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-500" />
                        {formatTime(exception.end_time)}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {exception.reason || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(exception)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(exception)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <EmptyState
            icon={<AlertCircle className="h-6 w-6 text-slate-400" />}
            title={t('employees.profile.manager.exceptions.emptyState.title')}
            description={t('employees.profile.manager.exceptions.emptyState.description')}
          />
        )}
      </CardContent>

      {/* Add Dialog — employee pre-selected and locked */}
      <AddExceptionDialog
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        submitting={isAdding}
        lockEmployeeSelection
        initialValues={{ employee_ids: [String(employeeId)], status: 'pending' }}
        onSubmit={handleAddSubmit}
        employeeName={employeeName}
      />

      {/* Edit Dialog */}
      <EditExceptionDialog
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        exception={editingException}
        submitting={isSubmitting}
        onSubmit={handleUpdateSubmit}
      />

      {/* Delete Dialog */}
      <DeleteExceptionDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </Card>
  );
}
