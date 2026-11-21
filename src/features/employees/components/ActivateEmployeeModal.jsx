// src/features/employees/components/ActivateEmployeeModal.jsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UserCheck } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { employeesApi } from '../api/employees.api';
import EmployeeStatusDetails from './EmployeeStatusDetails';

export default function ActivateEmployeeModal({ open, onOpenChange, employee, onSuccess }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language?.startsWith('ar');
  const [isPending, setIsPending] = useState(false);

  const handleActivate = async () => {
    if (!employee?.id) return;

    setIsPending(true);
    try {
      await employeesApi.makeEmployeeActive(employee.id);
      toast.success(t('employees.employeeCard.activatedSuccessfully'));
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to activate employee:', error);
      toast.error(t('common.error.activateFailed'));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader className={isRTL ? 'text-right sm:text-right' : 'text-left'}>
          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-green-100">
              <UserCheck className="size-6 text-green-600" />
            </div>
            <div className="min-w-0">
              <DialogTitle>{t('employees.activateModal.title')}</DialogTitle>
              <DialogDescription>{t('employees.activateModal.description')}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <p className="text-sm text-gray-600">{t('employees.activateModal.confirmation')}</p>

          <EmployeeStatusDetails
            employee={employee}
            labels={{
              position: t('employees.activateModal.position'),
              department: t('employees.activateModal.department'),
              phone: t('employees.activateModal.phone'),
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
            className="bg-green-600 hover:bg-green-700"
            onClick={handleActivate}
            disabled={isPending}
          >
            {isPending
              ? t('employees.activateModal.activating')
              : t('employees.employeeCard.activateEmployee')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
