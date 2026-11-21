// src/features/employees/components/steps/StepSalaryDetails.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import StepSection from './StepSection';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { useFieldArray } from 'react-hook-form';
import { useAllSalaryMethods } from '@/shared/hooks/useAllSalaryMethods';
import { useAllDepartments } from '@/shared/hooks/useAllDepartments';
import { Button } from '@/components/ui/button';
import { useKpiItems } from '@/shared/hooks/useKpiItems';
import { Trash2, Plus, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

/* ============================= */
/*         KPI SECTION           */
/* ============================= */
function KpiItemsSection({
  rules,
  customKpis,
  appendKpi,
  removeKpi,
  register,
  watch,
  setValue,
  positionId,
}) {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [customForm, setCustomForm] = React.useState({ item: '', max_score: '' });
  const [selectValue, setSelectValue] = React.useState('');

  const selectedRuleIds = watch('employee.position_kpi_item_ids') || [];
  const customKpiValues = watch('employee.custom_kpis') || [];

  // AUTO-SELECT all KPI rules when position rules load and nothing is selected yet
  React.useEffect(() => {
    if (!positionId) return;
    if (!Array.isArray(rules) || rules.length === 0) return;

    const existingSelected = Array.isArray(selectedRuleIds) ? selectedRuleIds.filter(Boolean) : [];
    const existingCustom = Array.isArray(customKpiValues) ? customKpiValues.filter(Boolean) : [];

    // only auto-fill when empty to avoid overwriting user changes
    if (existingSelected.length > 0 || existingCustom.length > 0) return;

    const allIds = rules.map((r) => Number(r.id)).filter(Boolean);

    if (allIds.length > 0) {
      setValue('employee.position_kpi_item_ids', allIds, {
        shouldDirty: false,
        shouldValidate: true,
      });
    }
  }, [positionId, rules, selectedRuleIds, customKpiValues, setValue]);

  const handleAddCustom = (e) => {
    e?.preventDefault();
    if (!customForm.item || !customForm.max_score) return;

    appendKpi({
      item: customForm.item,
      max_score: customForm.max_score,
    });

    setCustomForm({ item: '', max_score: '' });
    setIsModalOpen(false);
  };

  const handleSelectRule = (ruleId) => {
    const id = Number(ruleId);
    if (!selectedRuleIds.includes(id)) {
      setValue('employee.position_kpi_item_ids', [...selectedRuleIds, id], {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  const handleRemoveRule = (ruleId) => {
    const rid = Number(ruleId);
    const updated = selectedRuleIds.filter((id) => id !== rid);
    setValue('employee.position_kpi_item_ids', updated, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const totalSelected = selectedRuleIds.length + customKpis.length;

  return (
    <div className="space-y-3">
      {/* Hidden inputs to keep RHF data for Custom KPIs */}
      {customKpis.map((field, index) => (
        <React.Fragment key={field.id}>
          <input type="hidden" {...register(`employee.custom_kpis.${index}.item`)} />
          <input type="hidden" {...register(`employee.custom_kpis.${index}.max_score`)} />
        </React.Fragment>
      ))}

      {/* Hidden input for selected position rules */}
      <input type="hidden" {...register('employee.position_kpi_item_ids')} />

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label>{t('employees.form.kpiRulesAndCustomItems')}</Label>

          {rules.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              type="button"
              className="text-primary hover:bg-primary/5 hover:text-primary/90 h-6 px-1.5 text-[10px] font-bold tracking-wider uppercase"
              onClick={() => {
                const allIds = rules.map((r) => Number(r.id));
                const allSelected = selectedRuleIds.length === rules.length;
                setValue('employee.position_kpi_item_ids', allSelected ? [] : allIds, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
            >
              {selectedRuleIds.length === rules.length
                ? t('employees.form.deselectAll')
                : t('employees.form.selectAll')}
            </Button>
          )}
        </div>

        <Select
          value={selectValue}
          onValueChange={(val) => {
            if (val === '_add_custom_') {
              setIsModalOpen(true);
              setSelectValue('');
              return;
            }

            if (val === '_select_all_') {
              const allIds = rules.map((r) => Number(r.id));
              setValue('employee.position_kpi_item_ids', allIds, {
                shouldDirty: true,
                shouldValidate: true,
              });
              setSelectValue('');
              return;
            }

            if (val === '_deselect_all_') {
              setValue('employee.position_kpi_item_ids', [], {
                shouldDirty: true,
                shouldValidate: true,
              });
              setSelectValue('');
              return;
            }

            if (val.startsWith('rule-')) {
              handleSelectRule(val.replace('rule-', ''));
              setSelectValue('');
              return;
            }

            if (val.startsWith('remove-custom-')) {
              const idx = parseInt(val.replace('remove-custom-', ''), 10);
              removeKpi(idx);
              setSelectValue('');
              return;
            }

            if (val.startsWith('remove-rule-')) {
              handleRemoveRule(val.replace('remove-rule-', ''));
              setSelectValue('');
            }
          }}
        >
          <SelectTrigger className="h-9 w-full bg-white dark:bg-slate-900/50">
            <SelectValue
              placeholder={
                totalSelected > 0
                  ? t('employees.form.kpiItemsSelected', { count: totalSelected })
                  : t('employees.form.selectPositionRulesOrAddCustomKpis')
              }
            />
          </SelectTrigger>

          <SelectContent className="max-h-[350px]">
            {rules.length > 0 && (
              <SelectGroup>
                <SelectLabel className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                  {t('employees.form.availablePositionRules')}
                </SelectLabel>

                <SelectItem
                  value={
                    selectedRuleIds.length === rules.length ? '_deselect_all_' : '_select_all_'
                  }
                  className="text-primary focus:text-primary cursor-pointer font-semibold"
                >
                  <div className="flex items-center gap-2">
                    {selectedRuleIds.length === rules.length ? (
                      <Trash2 className="size-3.5" />
                    ) : (
                      <Check className="size-3.5" />
                    )}
                    <span>
                      {selectedRuleIds.length === rules.length
                        ? t('employees.form.deselectAllRules')
                        : t('employees.form.selectAllRules')}
                    </span>
                  </div>
                </SelectItem>

                <SelectSeparator />

                {rules.map((rule) => {
                  const isSelected = selectedRuleIds.includes(Number(rule.id));

                  return (
                    <SelectItem
                      key={rule.id}
                      value={isSelected ? `remove-rule-${rule.id}` : `rule-${rule.id}`}
                      className={cn('group flex items-center gap-2', isSelected && 'bg-slate-50')}
                    >
                      <div className="flex items-center gap-2">
                        <span className="border-gray rounded-sm border p-1">
                          {isSelected ? (
                            <Check className="text-primary size-3.5" />
                          ) : (
                            <Plus className="group-hover:text-primary size-3.5 text-slate-300 transition-all duration-100" />
                          )}
                        </span>
                        <span>
                          {rule.item} (Max: {rule.max_score})
                        </span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            )}

            {customKpis.length > 0 && (
              <>
                <SelectSeparator />
                <SelectGroup>
                  <SelectLabel className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                    {t('employees.form.addedCustomKpisClickToRemove')}
                  </SelectLabel>

                  {customKpis.map((field, index) => (
                    <SelectItem
                      key={field.id}
                      value={`remove-custom-${index}`}
                      className="text-red-600 focus:text-red-700"
                    >
                      <div className="flex items-center gap-2">
                        <Trash2 className="size-3.5" />
                        <span>
                          {watch(`employee.custom_kpis.${index}.item`) ||
                            t('employees.form.customKpi')}{' '}
                          (Max: {watch(`employee.custom_kpis.${index}.max_score`)})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </>
            )}

            <SelectSeparator />

            <SelectItem
              value="_add_custom_"
              className="text-primary focus:text-primary cursor-pointer font-semibold"
            >
              <div className="flex items-center gap-2">
                <Plus className="size-3.5" />
                <span>{t('employees.form.addNewCustomKpiItem')}</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Modal for adding custom KPI */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('employees.form.addCustomKpiItemTitle')}</DialogTitle>
            <DialogDescription>{t('employees.form.addCustomKpiItemDescription')}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>{t('employees.form.metricName')}</Label>
              <Input
                placeholder={t('employees.form.metricNamePlaceholder')}
                value={customForm.item}
                onChange={(e) => setCustomForm((p) => ({ ...p, item: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.preventDefault();
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('employees.form.maxScore')}</Label>
              <Input
                type="number"
                placeholder={t('employees.form.maxScorePlaceholder')}
                value={customForm.max_score}
                onChange={(e) => setCustomForm((p) => ({ ...p, max_score: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.preventDefault();
                }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              {t('employees.form.cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleAddCustom}
              disabled={!customForm.item || !customForm.max_score}
            >
              {t('employees.form.addItem')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ============================= */
/*      INSURANCE SECTION        */
/* ============================= */
function InsuranceSection({ register, setValue, isInsured, renderRootError }) {
  const { t } = useTranslation();

  return (
    <>
      <div className="space-y-1.5">
        <Label required>{t('employees.form.insurance')}</Label>

        <input type="hidden" {...register('is_insured')} />

        <div className="rounded-md border bg-white p-3">
          <RadioGroup
            className="flex items-center gap-8"
            value={isInsured ? 'yes' : 'no'}
            onValueChange={(val) => {
              const next = val === 'yes';

              setValue('is_insured', next, {
                shouldDirty: true,
                shouldValidate: true,
              });

              if (!next) {
                setValue('insurance_percentage', '', {
                  shouldDirty: true,
                  shouldValidate: true,
                });
                setValue('insurance_salary', '', {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }
            }}
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem id="insured_yes" value="yes" />
              <Label htmlFor="insured_yes" className="font-normal">
                {t('employees.form.yes')}
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <RadioGroupItem id="insured_no" value="no" />
              <Label htmlFor="insured_no" className="font-normal">
                {t('employees.form.no')}
              </Label>
            </div>
          </RadioGroup>
        </div>

        {renderRootError('is_insured', t('employees.form.insuranceIsRequired'))}
      </div>

      {isInsured && (
        <>
          <div className="space-y-1.5">
            <Label required>{t('employees.form.insurancePercentage')}</Label>
            <Input
              type="number"
              step="0.01"
              className="h-9 text-sm"
              {...register('insurance_percentage', {
                setValueAs: (v) => (v === '' || v == null ? '' : Number(v)),
              })}
            />
            {renderRootError(
              'insurance_percentage',
              t('employees.form.insurancePercentageIsRequired')
            )}
          </div>

          <div className="space-y-1.5">
            <Label required>{t('employees.form.insuranceSalary')}</Label>
            <Input
              type="number"
              step="0.01"
              className="h-9 text-sm"
              {...register('insurance_salary', {
                setValueAs: (v) => (v === '' || v == null ? '' : Number(v)),
              })}
            />
            {renderRootError('insurance_salary', t('employees.form.insuranceSalaryIsRequired'))}
          </div>
        </>
      )}
    </>
  );
}

/* ============================= */
/*        STEP COMPONENT         */
/* ============================= */
export default function StepSalaryDetails({
  register,
  setValue,
  watch,
  errors,
  showErrors = false,
  control,
}) {
  const { t } = useTranslation();
  const positionId = watch('employee.position_id') || watch('position_applied_for_id');
  const { kpiItems: rules = [] } = useKpiItems(positionId);

  const {
    fields: customKpis,
    append: appendKpi,
    remove: removeKpi,
  } = useFieldArray({
    control,
    name: 'employee.custom_kpis',
  });

  const salaryType = watch('employee.salary_type') || 'single';
  const salaryDetails = watch('employee.salary_details') || [];

  // ROOT insurance fields (backend expects root)
  const isInsured = watch('is_insured') === true;

  const employeeErrors = errors?.employee || {};
  const rootErrors = errors || {};

  const { data: departments = [] } = useAllDepartments();
  const { data: salaryMethodItems = [] } = useAllSalaryMethods();

  const salaryMethodNames = Array.isArray(salaryMethodItems)
    ? salaryMethodItems
        .map((item) =>
          typeof item === 'string' ? item : item?.name_en || item?.name_ar || item?.name || ''
        )
        .filter(Boolean)
    : [];

  const handleSalaryTypeChange = (v) => {
    setValue('employee.salary_type', v, { shouldDirty: true, shouldValidate: true });

    if (v === 'single') {
      setValue('employee.salary_details', [], { shouldDirty: true, shouldValidate: false });
    }
  };

  const handleToggleDepartment = (_deptId, deptName) => {
    const current = Array.isArray(salaryDetails) ? salaryDetails : [];
    const exists = current.find((item) => item.department_name === deptName);

    if (exists) {
      const updated = current.filter((item) => item.department_name !== deptName);
      setValue('employee.salary_details', updated, { shouldDirty: true, shouldValidate: true });
    } else {
      const updated = [...current, { department_name: deptName, amount: 0 }];
      setValue('employee.salary_details', updated, { shouldDirty: true, shouldValidate: true });
    }
  };

  const handleAmountChange = (deptName, value) => {
    const current = Array.isArray(salaryDetails) ? salaryDetails : [];
    const updated = current.map((item) =>
      item.department_name === deptName
        ? { ...item, amount: value === '' || value == null ? 0 : Number(value) }
        : item
    );
    setValue('employee.salary_details', updated, { shouldDirty: true, shouldValidate: true });
  };

  // employee.* errors
  const renderEmployeeError = (fieldKey, fallback) => {
    if (!showErrors) return null;
    const parts = fieldKey.split('.');
    let err = employeeErrors;
    for (const part of parts) err = err?.[part];
    if (!err) return null;
    return <p className="mt-1 text-xs text-red-500">{err?.message || fallback}</p>;
  };

  // root errors (is_insured / insurance_percentage / insurance_salary)
  const renderRootError = (fieldKey, fallback) => {
    if (!showErrors) return null;
    const parts = fieldKey.split('.');
    let err = rootErrors;
    for (const part of parts) err = err?.[part];
    if (!err) return null;
    return <p className="mt-1 text-xs text-red-500">{err?.message || fallback}</p>;
  };

  return (
    <StepSection title={t('applicants.steps.salaryDetails')}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Salary Type */}
        <div className="space-y-1.5">
          <Label required>{t('employees.form.salaryType')}</Label>
          <Select value={salaryType} onValueChange={handleSalaryTypeChange}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder={t('employees.form.selectTypePlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">{t('employees.form.singleSource')}</SelectItem>
              <SelectItem value="multi">{t('employees.form.multiSource')}</SelectItem>
            </SelectContent>
          </Select>
          {renderEmployeeError('salary_type', t('employees.form.salaryTypeIsRequired'))}
        </div>

        {/* ============ SINGLE ============ */}
        {salaryType === 'single' && (
          <>
            <div className="space-y-1.5">
              <Label required>{t('employees.form.netSalary')}</Label>
              <Input type="number" className="h-9 text-sm" {...register('employee.base_salary')} />
              {renderEmployeeError('base_salary', t('employees.form.netSalaryIsRequired'))}
            </div>

            <div className="space-y-1.5">
              <Label required>{t('employees.form.kpi')}</Label>
              <Input type="number" step="1" className="h-9 text-sm" {...register('employee.kpi')} />
              {renderEmployeeError('kpi', t('employees.form.kpiIsRequired'))}
            </div>
          </>
        )}

        {/* ============ MULTI ============ */}
        {salaryType === 'multi' && (
          <>
            <div className="space-y-1.5">
              <Label>{t('employees.form.netSalary')}</Label>
              <Input type="number" className="h-9 text-sm" {...register('employee.base_salary')} />
              {renderEmployeeError('base_salary', t('employees.form.netSalaryIsRequired'))}
            </div>

            {/* Departments & Percentages */}
            <div className="col-span-1 space-y-1.5 sm:col-span-2 lg:col-span-3">
              <Label>{t('employees.form.departmentsAndPercentages')}</Label>

              <div className="space-y-2 rounded-md border p-3">
                {departments.map((dept) => {
                  const deptName = dept.name_en || dept.name;
                  const isSelected = salaryDetails.some(
                    (item) => item.department_name === deptName
                  );
                  const currentAmount =
                    salaryDetails.find((item) => item.department_name === deptName)?.amount || 0;

                  return (
                    <div
                      key={dept.id}
                      className="bg-muted/40 flex flex-col gap-2 rounded-md p-2 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleDepartment(dept.id, deptName)}
                        />
                        <span>{deptName}</span>
                      </label>

                      {isSelected && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground text-xs">
                            {t('employees.form.percentage')}
                          </span>
                          <Input
                            type="number"
                            step="0.01"
                            className="h-8 w-24 text-xs"
                            placeholder={t('employees.form.percentagePlaceholder')}
                            value={currentAmount}
                            onChange={(e) => handleAmountChange(deptName, e.target.value)}
                          />
                          <span className="text-muted-foreground text-xs">%</span>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Total Percentage Display */}
                {salaryDetails.length > 0 && (
                  <div className="mt-2 border-t pt-2">
                    <div className="flex items-center justify-between text-sm font-medium">
                      <span>{t('employees.form.total')}</span>
                      <span
                        className={
                          salaryDetails.reduce(
                            (sum, item) => sum + (Number(item.amount) || 0),
                            0
                          ) === 100
                            ? 'text-green-600 dark:text-green-500'
                            : 'text-red-600 dark:text-red-500'
                        }
                      >
                        {salaryDetails.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {showErrors && employeeErrors.salary_details && (
                <p className="mt-1 text-xs text-red-500">
                  {employeeErrors.salary_details.message ||
                    t('employees.form.selectAtLeastOneDepartment')}
                </p>
              )}

              <p className="text-muted-foreground mt-1 text-[11px]">
                {t('employees.form.totalDepartmentsShouldBe100')}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label required>{t('employees.form.kpi')}</Label>
              <Input
                type="number"
                step="0.01"
                className="h-9 text-sm"
                {...register('employee.kpi')}
              />
              {renderEmployeeError('kpi', t('employees.form.kpiIsRequired'))}
            </div>
          </>
        )}

        <InsuranceSection
          register={register}
          setValue={setValue}
          isInsured={isInsured}
          renderRootError={renderRootError}
        />

        <div className="space-y-1.5">
          <Label>{t('employees.form.commissionPercentage')}</Label>
          <Input
            type="number"
            step="0.01"
            className="h-9 text-sm"
            {...register('employee.commission_percentage', {
              setValueAs: (v) => {
                if (v === '' || v === null || v === undefined) return 0;
                const n = Number(v);
                return Number.isFinite(n) ? n : 0;
              },
            })}
          />
        </div>

        {/* Salary Method */}
        <div className="space-y-1.5">
          <Label required>{t('employees.form.salaryMethod')}</Label>
          <Select
            value={watch('employee.salary_method') || ''}
            onValueChange={(v) =>
              setValue('employee.salary_method', v, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
          >
            <SelectTrigger className="h-9 w-full text-sm">
              <SelectValue placeholder={t('employees.form.selectSalaryMethodPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {salaryMethodNames.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {renderEmployeeError('salary_method', t('employees.form.salaryMethodIsRequired'))}
        </div>

        <div className="space-y-1.5">
          <Label>{t('employees.form.cardNumber')}</Label>
          <Input className="h-9 text-sm" {...register('employee.card_number')} />
        </div>

        <div className="space-y-1.5">
          <Label>{t('employees.form.walletNumber')}</Label>
          <Input className="h-9 text-sm" {...register('employee.wallet_number')} />
        </div>

        <KpiItemsSection
          rules={rules}
          customKpis={customKpis}
          appendKpi={appendKpi}
          removeKpi={removeKpi}
          register={register}
          watch={watch}
          setValue={setValue}
          positionId={positionId}
        />

        {/* Salary Payment Day (COMMON for single + multi) */}
        <div className="space-y-1.5">
          <Label required>{t('employees.form.salaryPaymentDay')}</Label>
          <Input
            type="number"
            min="1"
            max="31"
            className="h-9 text-sm"
            placeholder={t('employees.form.salaryPaymentDayPlaceholder')}
            {...register('employee.salary_payment_day', {
              setValueAs: (v) => {
                if (v === '' || v == null) return '';
                const n = Number(v);
                return Number.isFinite(n) ? String(n) : '';
              },
            })}
          />
          {renderEmployeeError(
            'salary_payment_day',
            t('employees.form.salaryPaymentDayIsRequired')
          )}
        </div>

        <div className="space-y-1.5">
          <Label>{t('employees.form.salaryPaymentDaySecond')}</Label>
          <Select
            value={watch('employee.salary_payment_day_second') || ''}
            onValueChange={(value) =>
              setValue('employee.salary_payment_day_second', value, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger className="h-9 w-full text-sm">
              <SelectValue placeholder={t('employees.form.salaryPaymentDaySecondPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 31 }, (_, index) => String(index + 1)).map((day) => (
                <SelectItem key={day} value={day}>
                  {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </StepSection>
  );
}
