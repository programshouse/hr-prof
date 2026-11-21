// src/features/employees/components/DeactivateEmployeeModal.jsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UserMinus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { employeesApi } from '../api/employees.api';
import EmployeeStatusDetails from './EmployeeStatusDetails';

export default function DeactivateEmployeeModal({ open, onOpenChange, employee, onSuccess }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language?.startsWith('ar');
  const [isPending, setIsPending] = useState(false);

  const handleDeactivate = async () => {
    if (!employee?.id) return;

    setIsPending(true);
    try {
      await employeesApi.makeEmployeeInactive(employee.id);
      toast.success(t('employees.employeeCard.deactivatedSuccessfully'));
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to deactivate employee:', error);
      toast.error(t('common.error.deactivateFailed'));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader className={isRTL ? 'text-right sm:text-right' : 'text-left'}>
          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="bg-tertiary/20 flex size-12 shrink-0 items-center justify-center rounded-full">
              <UserMinus className="text-primary size-6" />
            </div>
            <div className="min-w-0">
              <DialogTitle>{t('employees.deactivateModal.title')}</DialogTitle>
              <DialogDescription>{t('employees.deactivateModal.description')}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <p className="text-sm text-gray-600">{t('employees.deactivateModal.confirmation')}</p>

          <EmployeeStatusDetails
            employee={employee}
            labels={{
              position: t('employees.deactivateModal.position'),
              department: t('employees.deactivateModal.department'),
              phone: t('employees.deactivateModal.phone'),
            }}
          />
        </div>

        <DialogFooter className={isRTL ? 'flex-row-reverse sm:flex-row-reverse' : ''}>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            className="bg-primary"
            onClick={handleDeactivate}
            disabled={isPending}
          >
            {isPending
              ? t('employees.deactivateModal.deactivating')
              : t('employees.employeeCard.deactivateEmployee')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
