import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useFilter } from '@/shared/hooks/useFilter';
import { useAllShifts } from '@/shared/hooks/useAllShifts';
import { useAllPositions } from '@/shared/hooks/useAllPositions';
import { useAllDepartments } from '@/shared/hooks/useAllDepartments';
import { usePayrollPoliciesQuery } from '../hooks/useInsuranceEmployeesQuery';

function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder,
  allOption,
  className,
  getOptionValue = (option) => String(option.id ?? option.value),
  getOptionLabel,
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language?.startsWith('ar');

  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const resolveLabel = (option) => {
    if (getOptionLabel) return getOptionLabel(option);

    if (isRTL) {
      return (
        option.title_ar ||
        option.name_ar ||
        option.title_en ||
        option.name_en ||
        option.name ||
        option.title ||
        option.label ||
        '—'
      );
    }

    return (
      option.title_en ||
      option.name_en ||
      option.title_ar ||
      option.name_ar ||
      option.name ||
      option.title ||
      option.label ||
      '—'
    );
  };

  const filteredOptions = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return options;

    return options.filter((option) => resolveLabel(option).toLowerCase().includes(query));
  }, [options, searchTerm]);

  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (!open) setSearchTerm('');
  };

  return (
    <Select
      dir={isRTL ? 'rtl' : 'ltr'}
      open={isOpen}
      onOpenChange={handleOpenChange}
      value={value ?? 'all'}
      onValueChange={onValueChange}
    >
      <SelectTrigger
        className={cn(
          'min-w-0 w-full border-gray-200 bg-white text-sm text-gray-500 shadow-sm',
          'h-10 min-h-[40px] py-1.5',
          'overflow-visible whitespace-normal text-clip',
          '[&>span]:whitespace-normal',
          '[&>span]:break-words',
          '[&>span]:line-clamp-none',
          '[&>span]:truncate-none',
          isRTL ? 'text-right [&>span]:text-right' : 'text-left [&>span]:text-left',
          className
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent dir={isRTL ? 'rtl' : 'ltr'} className="max-h-60">
        <div className="sticky top-0 z-10 border-b bg-white p-2">
          <div className="relative">
            <Search className="absolute start-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder={t('filters.searchPlaceholder')}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className={cn(
                'h-8 ps-8 text-sm',
                isRTL ? 'text-right placeholder:text-right' : 'text-left placeholder:text-left'
              )}
              onClick={(event) => event.stopPropagation()}
            />
          </div>
        </div>

        <div className="max-h-40 overflow-y-auto">
          <SelectItem
            value="all"
            className={isRTL ? 'text-right [&>span]:text-right' : 'text-left'}
          >
            {allOption || t('filters.all')}
          </SelectItem>

          {filteredOptions.map((option) => (
            <SelectItem
              key={getOptionValue(option)}
              value={getOptionValue(option)}
              className={isRTL ? 'text-right [&>span]:text-right' : 'text-left'}
            >
              {resolveLabel(option)}
            </SelectItem>
          ))}
        </div>
      </SelectContent>
    </Select>
  );
}

export default function InsuranceEmployeesFilters({ filters, onFiltersChange }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language?.startsWith('ar');

const { searchTerm, handleSearchChange, handleChange } = useFilter(
  filters,
  onFiltersChange,
  'keyword'
);

  const { data: shifts = [] } = useAllShifts();
  const { data: positions = [] } = useAllPositions();
  const { data: departments = [] } = useAllDepartments();
  const { data: payrollPolicies = [] } = usePayrollPoliciesQuery();

  const setFilter = (key, value) => {
    handleChange(key, value === 'all' ? '' : value);
  };

  const isActive = (value) =>
    value !== undefined && value !== null && value !== '' && value !== 'all';

  const hasAnyFilter = Boolean(
    isActive(filters.keyword) ||
      isActive(filters.shift_id) ||
      isActive(filters.position_id) ||
      isActive(filters.department_id) ||
      isActive(filters.payroll_policy_id)
  );

  const resetAll = () => {
    handleSearchChange('');
    onFiltersChange({
      keyword: '',
      shift_id: '',
      position_id: '',
      department_id: '',
      payroll_policy_id: '',
    });
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="w-full">
      <div className="flex w-full flex-wrap items-center gap-2 xl:flex-nowrap">
        <div className="relative min-w-[140px] flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder={t('filters.search')}
            value={searchTerm}
            onChange={(event) => handleSearchChange(event.target.value)}
            className={cn(
              'h-10 w-full rounded-md border-gray-200 bg-white ps-9 pe-3 text-sm text-gray-700 shadow-sm',
              isRTL ? 'text-right placeholder:text-right' : 'text-left placeholder:text-left'
            )}
          />
        </div>

        {/* <div className="min-w-[140px] flex-1">
          <SearchableSelect
            value={filters.payroll_policy_id ? String(filters.payroll_policy_id) : 'all'}
            onValueChange={(value) => setFilter('payroll_policy_id', value)}
            options={payrollPolicies}
            placeholder={t('filters.company')}
            allOption={t('filters.allCompanies')}
            getOptionLabel={(option) =>
              option.policy_name ||
              option.name ||
              option.title ||
              (option.id != null ? `#${option.id}` : '—')
            }
          />
        </div> */}

        <div className="min-w-[140px] flex-1">
          <SearchableSelect
            value={filters.position_id ? String(filters.position_id) : 'all'}
            onValueChange={(value) => setFilter('position_id', value)}
            options={positions}
            placeholder={t('filters.position')}
            allOption={t('filters.allPositions')}
          />
        </div>


        <div className="min-w-[140px] flex-1">
          <SearchableSelect
            value={filters.shift_id ? String(filters.shift_id) : 'all'}
            onValueChange={(value) => setFilter('shift_id', value)}
            options={shifts}
            placeholder={t('filters.shift')}
            allOption={t('filters.allShifts')}
          />
        </div>

        <div className="min-w-[140px] flex-1">
          <SearchableSelect
            value={filters.department_id ? String(filters.department_id) : 'all'}
            onValueChange={(value) => setFilter('department_id', value)}
            options={departments}
            placeholder={t('filters.department')}
            allOption={t('filters.allDepartments')}
          />
        </div>
{/* 
        <div className="min-w-[140px] flex-1">
          <SearchableSelect
            value={filters.branch_id ? String(filters.branch_id) : 'all'}
            onValueChange={(value) => setFilter('branch_id', value)}
            options={branches}
            placeholder={t('filters.branch')}
            allOption={t('filters.allBranches')}
          />
        </div> */}

        {hasAnyFilter ? (
          <Button
            variant="ghost"
            onClick={resetAll}
            className="h-10 shrink-0 gap-1 text-slate-400 hover:text-red-500"
          >
            <X className="size-4" />
            <span>{t('filters.clear')}</span>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
