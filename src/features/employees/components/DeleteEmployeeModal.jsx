// src/features/employees/components/DeleteEmployeeModal.jsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useDeleteEmployee } from '../hooks/useUpsertEmployee';
import { useTranslation } from 'react-i18next';

export default function DeleteEmployeeModal({ open, onOpenChange, employee }) {
  const { mutate: deleteEmployee, isPending } = useDeleteEmployee();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const dir = isArabic ? 'rtl' : 'ltr';

  const handleDelete = () => {
    if (!employee?.id) return;

    deleteEmployee(employee.id, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir={dir}
        className={`
          max-w-md
          ${isArabic
            ? 'text-right [&>button]:left-4 [&>button]:right-auto'
            : 'text-left'}
        `}
      >
        <DialogHeader
          className={isArabic ? 'items-end text-right' : 'items-start text-left'}
        >
          <div className={`flex items-center gap-3 ${isArabic ? 'flex-row-reverse' : ''}`}>
            <div className="flex size-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="size-6 text-red-600" />
            </div>
            <div>
              <DialogTitle className={isArabic ? 'text-right' : 'text-left'}>
                {t('deleteModals.employee.title')}
              </DialogTitle>
              <DialogDescription>
                {t('deleteModals.description')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className={`space-y-3 py-4 ${isArabic ? 'text-right' : 'text-left'}`}>
          <p className="text-sm text-gray-600">
            {t('deleteModals.employee.confirmation')}
          </p>

          {employee && (
            <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className={`flex items-center gap-3 border-b border-gray-200 pb-2 ${isArabic ? 'flex-row-reverse' : ''}`}>
                <img
                  src={
                    employee.avatarUrl ||
                    employee.image ||
                    'https://ui-avatars.com/api/?name=Employee'
                  }
                  alt={employee.full_name || employee.name || 'Employee'}
                  className="size-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900">
                    {employee.full_name || employee.name || '—'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {employee.code || employee.employeeId || '—'}
                  </p>
                </div>
              </div>

              <div className={`flex justify-between pt-2 text-sm ${isArabic ? 'flex-row-reverse' : ''}`}>
                <span className="font-medium text-gray-700">
                  {t('deleteModals.employee.position')}:
                </span>
                <span className="text-gray-900">{employee.position || employee.role || '—'}</span>
              </div>
              <div className={`flex justify-between text-sm ${isArabic ? 'flex-row-reverse' : ''}`}>
                <span className="font-medium text-gray-700">
                  {t('deleteModals.employee.department')}:
                </span>
                <span className="text-gray-900">{employee.department || '—'}</span>
              </div>
              <div className={`flex justify-between text-sm ${isArabic ? 'flex-row-reverse' : ''}`}>
                <span className="font-medium text-gray-700">
                  {t('deleteModals.employee.phone')}:
                </span>
                <span className="text-gray-900">{employee.phone || '—'}</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter
          className={isArabic ? 'flex-row-reverse justify-start' : 'justify-end'}
        >
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {t('deleteModals.cancel')}
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? t('deleteModals.deleting') : t('deleteModals.employee.title')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
