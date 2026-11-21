import React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import EmployeeInfoCard from '@/components/ui/employeeInfoCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

import RowLine from '../shared/RowLine';
import EditRow from '../shared/EditRow';

// ✅ safe formatter: always returns "0.00" / "100.00" / "--" (never NaN)
const format2 = (v) => {
  if (v === null || v === undefined || v === '') return '--';
  if (typeof v === 'number' && Number.isNaN(v)) return '--';
  const n = Number(String(v).trim().replace(/,/g, '.'));
  if (!Number.isFinite(n)) return '--';
  return n.toFixed(2);
};

const toStr = (v) => (v === null || v === undefined ? '' : String(v));

export default function SalaryDetailsCard({ salary = {}, employee = {}, isEditing, onFieldChange }) {
  const { t } = useTranslation();
  const [openSalaryType, setOpenSalaryType] = React.useState(false);
  const [openSalaryMethod, setOpenSalaryMethod] = React.useState(false);

  // Salary Type
  const salaryType = salary.type || salary.salary_type || salary.salaryType || employee.salary_type || '';

  // ✅ Total Salary: prefer employee.base_salary then salary.net
  const totalSalaryRaw = employee.base_salary ?? salary.net ?? salary.base_salary ?? salary.total_salary ?? '';
  const totalSalary = format2(totalSalaryRaw);

  // ✅ KPI: prefer employee.kpi (source of truth)
  const totalKpiRaw = employee.kpi ?? salary.kpi ?? salary.total_kpi ?? '';
  const totalKpi = format2(totalKpiRaw);

  // Commission
  const commissionRaw =
    employee.commission_percentage ??
    salary.commission ??
    salary.commission_percentage ??
    salary.commissionPercentage ??
    '';
  const commission = format2(commissionRaw);

  // Salary Method
  const salaryMethod =
    employee.salary_method ||
    salary.salary_method ||
    salary.payment_method ||
    salary.salaryMethod ||
    '';
  const salaryPaymentDay = employee.salary_payment_day ?? salary.salary_payment_day ?? '';
  const salaryPaymentDaySecond =
    employee.salary_payment_day_second ?? salary.salary_payment_day_second ?? '';

  // Card / Wallet numbers
  const cardNumber = employee.card_number ?? salary.card_number ?? '';
  const walletNumber = employee.wallet_number ?? salary.wallet_number ?? '';

  const hasCommission = commissionRaw !== null && commissionRaw !== undefined && String(commissionRaw) !== '';

  const salaryTypeOptions = [
    { id: 'single', label: t('common.single') },
    { id: 'multi', label: t('common.multi') },
  ];

  const salaryMethodOptions = [
    { id: 'cash', label: t('employees.profile.details.salary.methods.cash') },
    { id: 'visa', label: t('employees.profile.details.salary.methods.visa') },
    { id: 'wallet', label: t('employees.profile.details.salary.methods.wallet') },
    { id: 'bank', label: t('employees.profile.details.salary.methods.bank') },
    { id: 'vodavone-cash', label: t('employees.profile.details.salary.methods.vodafoneCash') },
  ];

  const currentSalaryTypeLabel =
    salaryTypeOptions.find((o) => o.id === String(salaryType).toLowerCase())?.label ||
    (salaryType ? String(salaryType) : '--');

  const currentSalaryMethodLabel =
    salaryMethodOptions.find(
      (o) => o.id === String(salaryMethod).toLowerCase().replace(/_/g, '-')
    )?.label || (salaryMethod ? String(salaryMethod) : '--');

  const renderCombobox = ({
    open,
    setOpen,
    valueId,
    options,
    placeholder,
    onSelect,
    width = 180,
    searchPlaceholder = 'Search...',
    emptyText = 'No results.',
  }) => {
    const currentLabel = options.find((o) => o.id === valueId)?.label || '';
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="input"
            role="combobox"
            aria-expanded={open}
            className={`h-9 w-[${width}px] justify-between text-sm`}
          >
            {currentLabel || placeholder}
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[220px] p-0" align="start">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {options.map((o) => {
                  const isSelected = o.id === valueId;
                  return (
                    <CommandItem
                      key={o.id}
                      value={o.label}
                      className="flex items-center"
                      onSelect={() => {
                        onSelect(o.id);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 size-4 shrink-0',
                          isSelected ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      {o.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <EmployeeInfoCard
      title={t('employees.profile.details.salary.title')}
      isEditing={isEditing}
      onChangeItem={onFieldChange}
      items={[
        {
          label: t('employees.profile.details.salary.salaryType'),
          field: 'salary_type',
          customRender: () => {
            if (!isEditing) return <RowLine label={t('employees.profile.details.salary.salaryType')} value={currentSalaryTypeLabel || '--'} />;
            return (
              <EditRow label={t('employees.profile.details.salary.salaryType')} value={currentSalaryTypeLabel}>
                {renderCombobox({
                  open: openSalaryType,
                  setOpen: setOpenSalaryType,
                  valueId: salaryType,
                  options: salaryTypeOptions,
                  placeholder: t('employees.profile.details.salary.selectSalaryType'),
                  onSelect: (id) => onFieldChange('salary_type', id),
                })}
              </EditRow>
            );
          },
        },

        {
          label: t('employees.profile.details.salary.totalSalary'),
          field: 'base_salary',
          customRender: () => {
            if (!isEditing) return <RowLine label={t('employees.profile.details.salary.totalSalary')} value={totalSalary} />;
            return (
              <div className="space-y-1.5">
                <Label htmlFor="totalSalary">{t('employees.profile.details.salary.totalSalary')}</Label>
                <Input
                  id="totalSalary"
                  type="number"
                  value={toStr(totalSalaryRaw)}
                  onChange={(e) => onFieldChange('base_salary', e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            );
          },
        },

        {
          label: t('employees.profile.details.salary.totalKpi'),
          field: 'kpi',
          customRender: () => {
            if (!isEditing) return <RowLine label={t('employees.profile.details.salary.totalKpi')} value={totalKpi} />;
            return (
              <div className="space-y-1.5">
                <Label htmlFor="totalKpi">{t('employees.profile.details.salary.totalKpi')}</Label>
                <Input
                  id="totalKpi"
                  type="number"
                  value={toStr(totalKpiRaw)}
                  onChange={(e) => onFieldChange('kpi', e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            );
          },
        },

        (isEditing || hasCommission) && {
          label: t('employees.profile.details.salary.commission'),
          field: 'commission_percentage',
          customRender: () => {
            if (!isEditing) return <RowLine label={t('employees.profile.details.salary.commission')} value={commission} />;
            return (
              <div className="space-y-1.5">
                <Label htmlFor="commission">{t('employees.profile.details.salary.commission')}</Label>
                <Input
                  id="commission"
                  type="number"
                  value={toStr(commissionRaw)}
                  onChange={(e) => onFieldChange('commission_percentage', e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            );
          },
        },

        {
          label: t('employees.profile.details.salary.salaryMethod'),
          field: 'salary_method',
          customRender: () => {
            if (!isEditing) return <RowLine label={t('employees.profile.details.salary.salaryMethod')} value={currentSalaryMethodLabel || '--'} />;
            return (
              <EditRow label={t('employees.profile.details.salary.salaryMethod')} value={currentSalaryMethodLabel}>
                {renderCombobox({
                  open: openSalaryMethod,
                  setOpen: setOpenSalaryMethod,
                  valueId: String(salaryMethod || '').toLowerCase(),
                  options: salaryMethodOptions,
                  placeholder: t('employees.profile.details.salary.selectSalaryType'),
                  onSelect: (id) => onFieldChange('salary_method', id),
                })}
              </EditRow>
            );
          },
        },

        {
          label: t('employees.profile.details.salary.salaryPaymentDay'),
          field: 'salary_payment_day',
          customRender: () => {
            if (!isEditing) {
              return (
                <RowLine
                  label={t('employees.profile.details.salary.salaryPaymentDay')}
                  value={salaryPaymentDay || '--'}
                />
              );
            }

            return (
              <div className="space-y-1.5">
                <Label htmlFor="salaryPaymentDay">
                  {t('employees.profile.details.salary.salaryPaymentDay')}
                </Label>
                <Select
                  value={toStr(salaryPaymentDay)}
                  onValueChange={(value) => onFieldChange('salary_payment_day', value)}
                >
                  <SelectTrigger id="salaryPaymentDay" className="h-9 w-full text-sm">
                    <SelectValue
                      placeholder={t(
                        'employees.profile.details.salary.salaryPaymentDayPlaceholder'
                      )}
                    />
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
            );
          },
        },

        {
          label: t('employees.profile.details.salary.salaryPaymentDaySecond'),
          field: 'salary_payment_day_second',
          customRender: () => {
            if (!isEditing) {
              return (
                <RowLine
                  label={t('employees.profile.details.salary.salaryPaymentDaySecond')}
                  value={salaryPaymentDaySecond || '--'}
                />
              );
            }

            return (
              <div className="space-y-1.5">
                <Label htmlFor="salaryPaymentDaySecond">
                  {t('employees.profile.details.salary.salaryPaymentDaySecond')}
                </Label>
                <Select
                  value={toStr(salaryPaymentDaySecond)}
                  onValueChange={(value) => onFieldChange('salary_payment_day_second', value)}
                >
                  <SelectTrigger id="salaryPaymentDaySecond" className="h-9 w-full text-sm">
                    <SelectValue
                      placeholder={t(
                        'employees.profile.details.salary.salaryPaymentDaySecondPlaceholder'
                      )}
                    />
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
            );
          },
        },

        {
          label: t('employees.profile.details.salary.cardNumber'),
          field: 'card_number',
          customRender: () => {
            if (!isEditing) return <RowLine label={t('employees.profile.details.salary.cardNumber')} value={cardNumber ? String(cardNumber) : '--'} />;
            return (
              <div className="space-y-1.5">
                <Label htmlFor="cardNumber">{t('employees.profile.details.salary.cardNumber')}</Label>
                <Input
                  id="cardNumber"
                  value={toStr(cardNumber)}
                  onChange={(e) => onFieldChange('card_number', e.target.value)}
                  className="h-9 text-sm"
                  inputMode="numeric"
                />
              </div>
            );
          },
        },

        {
          label: t('employees.profile.details.salary.walletNumber'),
          field: 'wallet_number',
          customRender: () => {
            if (!isEditing) return <RowLine label={t('employees.profile.details.salary.walletNumber')} value={walletNumber ? String(walletNumber) : '--'} />;
            return (
              <div className="space-y-1.5">
                <Label htmlFor="walletNumber">{t('employees.profile.details.salary.walletNumber')}</Label>
                <Input
                  id="walletNumber"
                  value={toStr(walletNumber)}
                  onChange={(e) => onFieldChange('wallet_number', e.target.value)}
                  className="h-9 text-sm"
                  inputMode="numeric"
                />
              </div>
            );
          },
        },
      ].filter(Boolean)}
    />
  );
}
