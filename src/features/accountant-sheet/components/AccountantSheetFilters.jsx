import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { useState } from 'react';
import { useAllDepartments } from '@/shared/hooks';
import { useQuery } from '@tanstack/react-query';
import { salaryMethodApi } from '@/features/settings/api/salary-method.api';

function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder,
  allOption = 'All',
  getOptionValue = (option) => String(option.id),
  getOptionLabel,
}) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith('ar');

  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const resolveLabel = (option) => {
    if (getOptionLabel) return getOptionLabel(option, isArabic);

    if (isArabic) {
      return (
        option?.name_ar ||
        option?.title_ar ||
        option?.label_ar ||
        option?.label ||
        option?.name ||
        option?.name_en ||
        option?.title_en ||
        '—'
      );
    }

    return (
      option?.name_en ||
      option?.title_en ||
      option?.label_en ||
      option?.label ||
      option?.name ||
      option?.name_ar ||
      option?.title_ar ||
      '—'
    );
  };

  const filteredOptions = (options || []).filter((option) =>
    String(resolveLabel(option))
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (!open) setSearchTerm('');
  };

  return (
    <Select
      open={isOpen}
      onOpenChange={handleOpenChange}
      value={value || 'all'}
      onValueChange={onValueChange}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <SelectTrigger
        className={`
          h-10 w-full border-slate-200 bg-white text-sm text-slate-600 shadow-sm
          ${isArabic ? 'text-right [&>span]:text-right' : 'text-left [&>span]:text-left'}
        `}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent dir={isArabic ? 'rtl' : 'ltr'} className="max-h-60">
        <div className="sticky top-0 z-10 border-b bg-white p-2">
          <div className="relative">
            <Search className="absolute start-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <Input
              placeholder={t('filters.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`
                h-8 ps-8 text-sm
                ${isArabic ? 'text-right placeholder:text-right' : 'text-left placeholder:text-left'}
              `}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>

        <div className="max-h-48 overflow-y-auto">
          <SelectItem
            value="all"
            className={isArabic ? 'text-right [&>span]:text-right' : 'text-left'}
          >
            {allOption}
          </SelectItem>

          {filteredOptions.map((option, index) => (
            <SelectItem
              key={`${getOptionValue(option)}-${index}`}
              value={String(getOptionValue(option))}
              className={isArabic ? 'text-right [&>span]:text-right' : 'text-left'}
            >
              {resolveLabel(option)}
            </SelectItem>
          ))}
        </div>
      </SelectContent>
    </Select>
  );
}

export default function AccountantSheetFilters({ filters, onFiltersChange }) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith('ar');

  const { data: departments = [] } = useAllDepartments();

  const { data: salaryMethodsResponse = [] } = useQuery({
    queryKey: ['salary-methods'],
    queryFn: () => salaryMethodApi.getSalaryMethods(),
  });

  const salaryMethodItems = Array.isArray(salaryMethodsResponse)
    ? salaryMethodsResponse
    : salaryMethodsResponse?.data || [];

  const salaryMethodOptions = salaryMethodItems.map((item) => {
    if (typeof item === 'string') {
      return { value: item, label: item, label_ar: item };
    }

    return {
      // If the backend is case-sensitive and stores lowercase values
      // (e.g. "visa"), use: (item.name_en ?? item.name ?? '').toLowerCase()
      value: String(item.name_en ?? item.name ?? item.id),
      label: item.name_en || item.name || item.name_ar,
      label_ar: item.name_ar || item.name || item.name_en,
    };
  });

  const updateFilter = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value === 'all' ? '' : value,
    });
  };

  const handleReset = () => {
    onFiltersChange({
      keyword: '',
      salary_payment_day: '',
      department_id: '',
      salary_method: '',
    });
  };

  const hasAnyFilter =
    filters.keyword ||
    filters.salary_payment_day ||
    filters.department_id ||
    filters.salary_method;

  const paymentDays = Array.from({ length: 31 }, (_, index) => ({
    id: String(index + 1),
    label: String(index + 1),
  }));

  return (
    <div dir={isArabic ? 'rtl' : 'ltr'} className="flex flex-col gap-3">
      <div className="grid gap-3 xl:grid-cols-[1fr_auto] xl:items-center">
        <div className="w-full">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4 xl:flex xl:flex-wrap xl:items-center xl:gap-3">
            <div className="relative w-full xl:w-[320px] 2xl:w-[340px]">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

              <Input
                placeholder={t('filters.search')}
                value={filters.keyword || ''}
                onChange={(e) => updateFilter('keyword', e.target.value)}
                className={`
                  h-10 w-full rounded-md border-slate-200 ps-9 text-sm text-slate-700 shadow-sm
                  ${isArabic ? 'text-right placeholder:text-right' : 'text-left placeholder:text-left'}
                `}
              />
            </div>

            <div className="w-full xl:w-[170px]">
              <SearchableSelect
                value={filters.salary_payment_day || 'all'}
                onValueChange={(value) => updateFilter('salary_payment_day', value)}
                options={paymentDays}
                placeholder={t('filters.paymentDate')}
                allOption={t('filters.paymentDate')}
                getOptionValue={(option) => option.id}
                getOptionLabel={(option) => option.label}
              />
            </div>

            <div className="w-full xl:w-[180px]">
              <SearchableSelect
                value={filters.department_id || 'all'}
                onValueChange={(value) => updateFilter('department_id', value)}
                options={departments}
                placeholder={t('filters.department')}
                allOption={t('filters.department')}
              />
            </div>

            <div className="w-full xl:w-[190px]">
              <SearchableSelect
                value={filters.salary_method || 'all'}
                onValueChange={(value) => updateFilter('salary_method', value)}
                options={salaryMethodOptions}
                placeholder={t('filters.paymentMethod')}
                allOption={t('filters.paymentMethod')}
                getOptionValue={(option) => option.value}
              />
            </div>

            {hasAnyFilter ? (
              <div className="w-full xl:w-auto">
                <Button
                  variant="ghost"
                  onClick={handleReset}
                  className="h-10 w-full justify-center px-3 text-slate-500 hover:text-red-500 xl:w-auto"
                >
                  <X className="size-4" />

                  <span className={`${isArabic ? 'mr-1' : 'ml-1'} text-sm font-medium`}>
                    {t('filters.clear')}
                  </span>
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
