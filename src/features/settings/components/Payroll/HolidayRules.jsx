import React from 'react';
import { Check, ChevronsUpDown, Trash } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import StepperField from '@/components/ui/StepperField';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { EMPLOYEE_TYPE_OPTIONS } from '@/constants/payroll';
import { useTranslation } from 'react-i18next';
import { getUnitLabel } from '@/utils/durationLabels';

function ApplicableEmployeeTypesSelect({
  employeeTypeKeys,
  setEmployeeTypeKeys,
  setApplyFullTime,
  setApplyPartTime,
  setApplyOnsite,
  setApplyRemote,
  disabled,
  onOptionsChange,
}) {
  const { t } = useTranslation();
  const options = React.useMemo(() => EMPLOYEE_TYPE_OPTIONS, []);

  const selectedKeys = React.useMemo(() => {
    return Array.isArray(employeeTypeKeys) ? employeeTypeKeys : [];
  }, [employeeTypeKeys]);

  React.useEffect(() => {
    if (onOptionsChange && options.length > 0) onOptionsChange(options);
  }, [options, onOptionsChange]);

  React.useEffect(() => {
    const nextFullTime = selectedKeys.some((k) => k.startsWith('FT_'));
    const nextPartTime = selectedKeys.some((k) => k.startsWith('PT_'));
    const nextOnsite = selectedKeys.some((k) => k.endsWith('_ON'));
    const nextRemote = selectedKeys.some((k) => k.endsWith('_RE'));

    setApplyFullTime(nextFullTime);
    setApplyPartTime(nextPartTime);
    setApplyOnsite(nextOnsite);
    setApplyRemote(nextRemote);
  }, [selectedKeys, setApplyFullTime, setApplyPartTime, setApplyOnsite, setApplyRemote]);

  const toggleKey = (key) => {
    if (disabled) return;
    setEmployeeTypeKeys((prev) => {
      const current = Array.isArray(prev) ? prev : [];
      return current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
    });
  };

  return (
    <div className="rounded-lg bg-white p-4">
      <p className="mb-3 text-xs font-semibold text-slate-900">{t('settings.payroll.holidayRules.applicableEmployeeTypes')}</p>

      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              'flex h-14 items-center justify-between rounded-lg border border-slate-200 bg-white px-4 text-sm w-[600px]',
              'text-slate-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20',
              disabled && 'cursor-not-allowed opacity-70',
              'relative pr-10',
            )}
          >
            <div className="flex flex-wrap gap-2 overflow-hidden pr-8">
              {selectedKeys.length === 0 ? (
                <span className="text-slate-400">{t('settings.payroll.holidayRules.selectEmployeeTypes')}</span>
              ) : (
                options
                  .filter((o) => selectedKeys.includes(o.key))
                  .map((o) => (
                    <span
                      key={o.key}
                      className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700"
                    >
                      {o.label}
                    </span>
                  ))
              )}
            </div>

            <ChevronsUpDown className="absolute right-3 h-4 w-4 text-slate-500" />
          </button>
        </PopoverTrigger>

        <PopoverContent className="w-[520px] p-0" align="start">
          <Command>
            <CommandList className="max-h-[260px] overflow-auto">
              <CommandEmpty>{t('common.noResults')}</CommandEmpty>

              <CommandGroup>
                {options.map((o) => {
                  const checked = selectedKeys.includes(o.key);

                  return (
                    <CommandItem
                      key={o.key}
                      onSelect={() => toggleKey(o.key)}
                      className={cn(
                        'flex items-center gap-3 rounded-md px-3 py-2',
                        'hover:bg-slate-50',
                        checked && 'bg-slate-50',
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-5 w-5 items-center justify-center rounded-md border',
                          checked
                            ? 'border-primary bg-primary text-white'
                            : 'border-slate-300 bg-white',
                        )}
                      >
                        {checked ? <Check className="h-4 w-4 text-white" /> : null}
                      </span>

                      <span className="text-sm text-slate-800">{o.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

/* ----------------------------------- Page ----------------------------------- */

export default function HolidayRules({
  holidayRows,
  setHolidayRows,

  // legacy flags (still passed to save backend)
  applyFullTime,
  setApplyFullTime,
  applyPartTime,
  setApplyPartTime,
  applyOnsite,
  setApplyOnsite,
  applyRemote,
  setApplyRemote,

  employeeTypeKeys,
  setEmployeeTypeKeys,
  onOptionsChange,

  insuranceDeductionEnabled,
  setInsuranceDeductionEnabled,
  insurancePercent,
  setInsurancePercent,
  companyInsurancePercent,
  setCompanyInsurancePercent,
  salaryCap,
  setSalaryCap,
  incInt,
  decInt,
  TinyPlusButton,
  EditButton,
  Checkbox, // not used now, kept for compatibility
  isEditing,
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const handleOptionsChange = (options) => {
    if (onOptionsChange) onOptionsChange(options);
  };

  // allow typing temporary strings like "" or "."
  const toNumberOrKeepRaw = (raw) => {
    if (raw === '' || raw === '.') return raw;
    const n = parseFloat(String(raw).replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
  };

  const toNumberSafe = (raw, fallback = 0) => {
    const n = parseFloat(String(raw).replace(',', '.'));
    return Number.isFinite(n) ? n : fallback;
  };

  const updateRow = (rowId, field, value) => {
    setHolidayRows((prev) =>
      prev.map((row) => (row.id !== rowId ? row : { ...row, [field]: value })),
    );
  };

  const deleteRow = (rowId) => {
    setHolidayRows((prev) => prev.filter((row) => row.id !== rowId));
  };

  const addHolidayRule = () => {
    const newId = Math.max(...holidayRows.map((r) => r.id), 0) + 1;
    setHolidayRows((prev) => [
      ...prev,
      {
        id: newId,
        fromNumber: 6,
        toNumber: 12,
        annualLeaveDays: 15, // ✅ number only
        casualLeaveDays: 5, // ✅ number only
      },
    ]);
  };

  const increaseAnnualDays = (rowId, step = 1, max = 365) => {
    setHolidayRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        const current = toNumberSafe(row.annualLeaveDays, 0);
        const next = Math.min(max, current + step);
        return { ...row, annualLeaveDays: next };
      }),
    );
  };

  const increaseCasualDays = (rowId, step = 1, max = 365) => {
    setHolidayRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        const current = toNumberSafe(row.casualLeaveDays, 0);
        const next = Math.min(max, current + step);
        return { ...row, casualLeaveDays: next };
      }),
    );
  };

  return (
    <div className="space-y-6">
      <Card className="border-slate-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900">{t('settings.payroll.holidayRules.title')}</p>
              <p className="text-xs text-slate-500">
                {t('settings.payroll.holidayRules.description')}
              </p>
            </div>

            {isEditing && (
              <button
                type="button"
                onClick={addHolidayRule}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium',
                  'bg-primary text-white transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
                )}
              >
                {t('settings.payroll.holidayRules.addRule')}
              </button>
            )}
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
            <div
              className="
                grid items-center bg-slate-50 px-4 py-3 text-xs font-medium text-slate-600
                grid-cols-[minmax(180px,1fr)_minmax(180px,1fr)_minmax(150px,1fr)_minmax(150px,1fr)]
              "
            >
              <div>{t('settings.payroll.holidayRules.from')}</div>
              <div>{t('settings.payroll.holidayRules.to')}</div>
              <div>{t('settings.payroll.holidayRules.annualDays')}</div>
              <div>{t('settings.payroll.holidayRules.casualDays')}</div>
            </div>

            <div className="divide-y divide-slate-200 bg-white">
              {holidayRows.map((r) => (
                <div
                  key={r.id}
                  className="
                    grid items-center px-4 py-3 gap-6
                    grid-cols-[minmax(180px,1fr)_minmax(180px,1fr)_minmax(150px,1fr)_minmax(150px,1fr)]
                  "
                >
                  {/* From (number + fixed suffix) */}
                  <div className="max-w-[150px]">
                    <div className="flex h-10 items-center rounded-lg border border-slate-200 bg-white px-3">
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={r.fromNumber ?? 0}
                        onChange={(e) => {
                          const raw = String(e.target.value).replace(',', '.');
                          if (raw === '' || raw === '.') return updateRow(r.id, 'fromNumber', raw);
                          if (!/^\d+(\.\d*)?$/.test(raw)) return;
                          updateRow(r.id, 'fromNumber', toNumberOrKeepRaw(raw));
                        }}
                        onBlur={() => {
                          const n = toNumberSafe(r.fromNumber, 0);
                          updateRow(r.id, 'fromNumber', n);
                        }}
                        readOnly={!isEditing}
                        className="h-9 w-16 border-0 p-0 text-sm shadow-none focus-visible:ring-0"
                      />
                      <span className="whitespace-nowrap text-sm text-slate-600">
                        {getUnitLabel(t, 'month', r.fromNumber)}
                      </span>
                    </div>
                  </div>

                  {/* To (number + fixed suffix) */}
                  <div className="max-w-[150px]">
                    <div className="flex h-10 items-center rounded-lg border border-slate-200 bg-white px-3">
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={r.toNumber ?? 0}
                        onChange={(e) => {
                          const raw = String(e.target.value).replace(',', '.');
                          if (raw === '' || raw === '.') return updateRow(r.id, 'toNumber', raw);
                          if (!/^\d+(\.\d*)?$/.test(raw)) return;
                          updateRow(r.id, 'toNumber', toNumberOrKeepRaw(raw));
                        }}
                        onBlur={() => {
                          const n = toNumberSafe(r.toNumber, 0);
                          updateRow(r.id, 'toNumber', n);
                        }}
                        readOnly={!isEditing}
                        className="h-9 w-16 border-0 p-0 text-sm shadow-none focus-visible:ring-0"
                      />
                      <span className="whitespace-nowrap text-sm text-slate-600">
                        {getUnitLabel(t, 'month', r.toNumber)}
                      </span>
                    </div>
                  </div>

                  {/* Annual Leave (number + fixed suffix) */}
                  <div className="max-w-[150px]">
                    <div className="flex h-10 items-center rounded-lg border border-slate-200 bg-white px-3">
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={r.annualLeaveDays ?? 0}
                        onChange={(e) => {
                          const raw = String(e.target.value).replace(',', '.');
                          if (raw === '' || raw === '.')
                            return updateRow(r.id, 'annualLeaveDays', raw);
                          if (!/^\d+(\.\d*)?$/.test(raw)) return;
                          updateRow(r.id, 'annualLeaveDays', toNumberOrKeepRaw(raw));
                        }}
                        onBlur={() => {
                          const n = toNumberSafe(r.annualLeaveDays, 0);
                          updateRow(r.id, 'annualLeaveDays', Math.max(0, n));
                        }}
                        readOnly={!isEditing}
                        className="h-9 w-16 border-0 p-0 text-sm shadow-none focus-visible:ring-0"
                        placeholder="0"
                      />
                      <span
                        className={`${isRTL ? 'me-2' : 'ms-2'} whitespace-nowrap text-sm text-slate-600`}
                      >
                        {getUnitLabel(t, 'day', r.annualLeaveDays)}
                      </span>
                    </div>
                  </div>

                  {/* Casual Leave (number + fixed suffix) */}
                  <div className="max-w-[150px]">
                    <div className="flex h-10 items-center rounded-lg border border-slate-200 bg-white px-3">
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={r.casualLeaveDays ?? 0}
                        onChange={(e) => {
                          const raw = String(e.target.value).replace(',', '.');
                          if (raw === '' || raw === '.')
                            return updateRow(r.id, 'casualLeaveDays', raw);
                          if (!/^\d+(\.\d*)?$/.test(raw)) return;
                          updateRow(r.id, 'casualLeaveDays', toNumberOrKeepRaw(raw));
                        }}
                        onBlur={() => {
                          const n = toNumberSafe(r.casualLeaveDays, 0);
                          updateRow(r.id, 'casualLeaveDays', Math.max(0, n));
                        }}
                        readOnly={!isEditing}
                        className="h-9 w-16 border-0 p-0 text-sm shadow-none focus-visible:ring-0"
                        placeholder="0"
                      />
                      <span
                        className={`${isRTL ? 'me-2' : 'ms-2'} whitespace-nowrap text-sm text-slate-600`}
                      >
                        {getUnitLabel(t, 'day', r.casualLeaveDays)}
                      </span>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* Employee types */}
          <div className="mt-6">
            <ApplicableEmployeeTypesSelect
              employeeTypeKeys={employeeTypeKeys}
              setEmployeeTypeKeys={setEmployeeTypeKeys}
              setApplyFullTime={setApplyFullTime}
              setApplyPartTime={setApplyPartTime}
              setApplyOnsite={setApplyOnsite}
              setApplyRemote={setApplyRemote}
              disabled={!isEditing}
              onOptionsChange={handleOptionsChange}
            />
          </div>

          {/* Insurance deduction */}
          <div className="mt-8 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900">{t('settings.payroll.holidayRules.insuranceDeduction')}</p>
              <p className="text-xs text-slate-500">
                {t('settings.payroll.holidayRules.insuranceDeductionDescription')}
              </p>
            </div>

            <Switch
              checked={insuranceDeductionEnabled}
              onCheckedChange={setInsuranceDeductionEnabled}
              disabled={!isEditing}
            />
          </div>

          <div className="mt-4 rounded-lg border border-slate-200 bg-white">
            <div className="grid gap-6 p-6 md:grid-cols-3">
              <StepperField
                label={t('settings.payroll.holidayRules.insurancePercent')}
                valueLabel="%"
                value={insurancePercent}
                onPlus={() => incInt(setInsurancePercent, insurancePercent, 1, 100)}
                onMinus={() => decInt(setInsurancePercent, insurancePercent, 1, 0)}
                disabled={!isEditing}
                onChange={(e) => {
                  const raw = String(e.target.value ?? '').replace(',', '.');
                  if (raw === '' || raw === '.') {
                    setInsurancePercent(raw);
                    return;
                  }
                  if (!/^\d+(\.\d*)?$/.test(raw)) return;

                  const n = parseFloat(raw);
                  if (Number.isFinite(n) && n >= 0 && n <= 100) {
                    setInsurancePercent(n);
                  }
                }}
                min={0}
                max={100}
              />

              <StepperField
                label={t('settings.payroll.holidayRules.companyInsurancePercent')}
                valueLabel="%"
                value={companyInsurancePercent}
                onPlus={() =>
                  incInt(setCompanyInsurancePercent, companyInsurancePercent, 1, 100)
                }
                onMinus={() =>
                  decInt(setCompanyInsurancePercent, companyInsurancePercent, 1, 0)
                }
                disabled={!isEditing}
                onChange={(e) => {
                  const raw = String(e.target.value ?? '').replace(',', '.');
                  if (raw === '' || raw === '.') {
                    setCompanyInsurancePercent(raw);
                    return;
                  }
                  if (!/^\d+(\.\d*)?$/.test(raw)) return;

                  const n = parseFloat(raw);
                  if (Number.isFinite(n) && n >= 0 && n <= 100) {
                    setCompanyInsurancePercent(n);
                  }
                }}
                min={0}
                max={100}
              />

              <StepperField
                label={t('settings.payroll.holidayRules.salaryCap')}
                value={salaryCap}
                onPlus={() => incInt(setSalaryCap, salaryCap, 100, 1000000)}
                onMinus={() => decInt(setSalaryCap, salaryCap, 100, 0)}
                disabled={!isEditing}
                onChange={(e) => {
                  const val = parseFloat(String(e.target.value).replace(',', '.')) || 0;
                  if (val >= 0 && val <= 1000000) setSalaryCap(val);
                }}
                min={0}
                max={1000000}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
