import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import EmployeeMultiSelectCombobox from '@/components/ui/EmployeeMultiSelectCombobox';
import { useAllEmployees } from '@/shared/hooks/useAllEmployees';
import { useRemoveWeekendEmployees } from '../hooks/useWeekendMutations';

const getNestedEmployee = (value) =>
  value?.employee ?? value?.employee_data ?? value?.user ?? value?.applicant ?? value ?? null;

const getEmployeeId = (value) => {
  if (!value || typeof value !== 'object') return null;

  const nested = getNestedEmployee(value);

  return (
    value?.employee_id ??
    value?.id ??
    value?.user_id ??
    value?.pivot?.employee_id ??
    nested?.employee_id ??
    nested?.id ??
    nested?.user_id ??
    null
  );
};

const toEmployeeIds = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter(Boolean);
  }

  if (typeof value === 'string') {
    const raw = value.trim();
    if (!raw) return [];

    if (raw.startsWith('[') && raw.endsWith(']')) {
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.map((item) => String(item)).filter(Boolean) : [raw];
      } catch {
        return [raw];
      }
    }

    return [raw];
  }

  if (typeof value === 'number') {
    return [String(value)];
  }

  return [];
};

const getWeekendEmployeeIds = (weekend) => {
  const direct =
    weekend?.employee_id ??
    weekend?.employee_ids ??
    weekend?.employees_ids ??
    weekend?.employees_id ??
    weekend?.employeeIds ??
    weekend?.employeesIds ??
    null;

  const ids = toEmployeeIds(direct);

  if (ids.length) {
    return ids;
  }

  if (Array.isArray(weekend?.employees) && weekend.employees.length) {
    return weekend.employees
      .map((employee) => String(getEmployeeId(employee) ?? ''))
      .filter(Boolean);
  }

  return [];
};

export default function ManageWeekendEmployeesModal({ open, onOpenChange, weekend }) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith('ar');
  const dir = isArabic ? 'rtl' : 'ltr';

  const weekendId = weekend?.id;
  const { data: employees = [], isLoading: loadingEmployees } = useAllEmployees(open);
  const removeMut = useRemoveWeekendEmployees();

  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);

  const weekendEmployeeIds = useMemo(() => getWeekendEmployeeIds(weekend), [weekend]);
  const weekendEmployees = useMemo(() => {
    const ids = new Set(weekendEmployeeIds.map(String));
    const fromList = employees.filter((employee) => ids.has(String(getEmployeeId(employee))));
    const fromWeekend = Array.isArray(weekend?.employees)
      ? weekend.employees.map((employee) => getNestedEmployee(employee)).filter(Boolean)
      : [];

    const merged = [...fromList];
    const existing = new Set(fromList.map((employee) => String(getEmployeeId(employee))));

    fromWeekend
      .filter((employee) => ids.has(String(getEmployeeId(employee))))
      .forEach((employee) => {
        const id = String(getEmployeeId(employee));
        if (!existing.has(id)) {
          existing.add(id);
          merged.push(employee);
        }
      });

    return merged;
  }, [employees, weekend, weekendEmployeeIds]);

  const headerInfo = useMemo(() => {
    const from = weekend?.date_from || '—';
    const to = weekend?.date_to || '—';
    const count =
      weekend?.employees_count ?? weekend?.employeesCount ?? weekend?.employees?.length ?? null;
    return { from, to, count };
  }, [weekend]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSelectedEmployeeIds([]);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [open, weekendId]);

  const canSubmit = Boolean(weekendId && selectedEmployeeIds.length > 0 && !removeMut.isPending);

  const handleRemove = () => {
    if (!weekendId) return;

    removeMut.mutate(
      { weekend_id: weekendId, employee_ids: selectedEmployeeIds },
      {
        onSuccess: () => {
          setSelectedEmployeeIds([]);
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir={dir}
        className={isArabic ? 'text-right [&>button]:left-4 [&>button]:right-auto' : 'text-left'}
      >
        <DialogHeader className={isArabic ? 'items-end text-right' : 'items-start text-left'}>
          <DialogTitle className={isArabic ? 'text-right' : 'text-left'}>
            {t('weekends.manageModal.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border bg-gray-50 p-4 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium">{t('weekends.manageModal.from')}:</span>
              <span>{headerInfo.from}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium">{t('weekends.manageModal.to')}:</span>
              <span>{headerInfo.to}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium">{t('weekends.manageModal.employees')}:</span>
              <span>{headerInfo.count != null ? String(headerInfo.count) : '—'}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">{t('weekends.manageModal.selectEmployees')}</div>
            <EmployeeMultiSelectCombobox
              value={selectedEmployeeIds}
              onChange={setSelectedEmployeeIds}
              employees={weekendEmployees}
              loading={loadingEmployees}
              placeholder={t('weekends.manageModal.selectEmployeesPlaceholder')}
              searchPlaceholder={t('weekends.manageModal.searchEmployeesPlaceholder')}
              formatSelectedLabel={(count) => t('weekends.manageModal.selectedCount', { count })}
            />
          </div>

          <div className={isArabic ? 'flex justify-start gap-2' : 'flex justify-end gap-2'}>
            <Button
              type="button"
              variant="outline"
              disabled={removeMut.isPending}
              onClick={() => onOpenChange(false)}
            >
              {t('weekends.manageModal.cancel')}
            </Button>
            <Button type="button" disabled={!canSubmit} onClick={handleRemove}>
              {removeMut.isPending
                ? t('weekends.manageModal.removing')
                : t('weekends.manageModal.remove')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
