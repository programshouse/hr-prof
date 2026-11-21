import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, CalendarDays, ChevronDown } from 'lucide-react';
import { useAllDepartments } from '@/shared/hooks';

function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder,
  allOption,
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
      dir={isArabic ? 'rtl' : 'ltr'}
      open={isOpen}
      onOpenChange={handleOpenChange}
      value={value || 'all'}
      onValueChange={onValueChange}
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
              dir={isArabic ? 'rtl' : 'ltr'}
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
            {allOption || t('filters.all')}
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

function toISO(date) {
  if (!date) return '';

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');

  return `${y}-${m}-${d}`;
}
export default function AllowanceFilters({ filters, onFiltersChange }) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith('ar');

  const { data: departments = [] } = useAllDepartments();

  const updateFilter = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value === 'all' ? '' : value,
    });
  };

  const handleReset = () => {
    onFiltersChange({
      keyword: '',
      department_id: '',
      from_date: '',
      to_date: '',
    });
  };

  const hasAnyFilter =
    filters.keyword || filters.department_id || filters.from_date || filters.to_date;

  const formatDisplayDate = (value) => {
    if (!value) return '';
    return new Date(value).toLocaleDateString(isArabic ? 'ar-EG' : 'en-GB');
  };

  return (
    <div dir={isArabic ? 'rtl' : 'ltr'} className="flex flex-col gap-3">
      <div className="grid gap-3 xl:grid-cols-[1fr_auto] xl:items-center">
        <div className="w-full">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4 xl:flex xl:flex-wrap xl:items-center xl:gap-3">
            <div className="relative w-full xl:w-[320px] 2xl:w-[340px]">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

              <Input
                dir={isArabic ? 'rtl' : 'ltr'}
                placeholder={t('filters.search')}
                value={filters.keyword || ''}
                onChange={(e) => updateFilter('keyword', e.target.value)}
                className={`
                  h-10 w-full rounded-md border-slate-200 ps-9 text-sm text-slate-700 shadow-sm
                  ${isArabic ? 'text-right placeholder:text-right' : 'text-left placeholder:text-left'}
                `}
              />
            </div>

            <div className="w-full xl:w-[180px]">
              <SearchableSelect
                value={filters.department_id || 'all'}
                onValueChange={(value) => updateFilter('department_id', value)}
                options={departments}
                placeholder={t('filters.department')}
                allOption={t('filters.allDepartments')}
              />
            </div>

            <div className="w-full xl:w-[170px]">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={`
                      flex h-10 w-full items-center justify-between rounded-md border-slate-200 bg-white px-3 text-sm font-normal text-slate-600 shadow-sm hover:bg-white
                      ${isArabic ? 'text-right' : 'text-left'}
                    `}
                  >
                    <span className="flex items-center gap-2">
                      <CalendarDays className="size-4 text-slate-400" />
                      {filters.from_date
                        ? formatDisplayDate(filters.from_date)
                        : t('filters.fromDate')}
                    </span>

                    <ChevronDown className="size-4 text-slate-400" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent
                  dir={isArabic ? 'rtl' : 'ltr'}
                  className="w-auto p-2"
                  align={isArabic ? 'end' : 'start'}
                >
                  <Calendar
                    mode="single"
                    selected={filters.from_date ? new Date(filters.from_date) : undefined}
                    onSelect={(date) => {
                      if (!date) {
                        updateFilter('from_date', '');
                        return;
                      }

                      const nextFrom = toISO(date);
                      const currentTo = filters.to_date;

                      if (currentTo && new Date(currentTo) < date) {
                        onFiltersChange({
                          ...filters,
                          from_date: nextFrom,
                          to_date: nextFrom,
                        });
                        return;
                      }

                      updateFilter('from_date', nextFrom);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="w-full xl:w-[170px]">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={`
                      flex h-10 w-full items-center justify-between rounded-md border-slate-200 bg-white px-3 text-sm font-normal text-slate-600 shadow-sm hover:bg-white
                      ${isArabic ? 'text-right' : 'text-left'}
                    `}
                  >
                    <span className="flex items-center gap-2">
                      <CalendarDays className="size-4 text-slate-400" />
                      {filters.to_date
                        ? formatDisplayDate(filters.to_date)
                        : t('filters.toDate')}
                    </span>

                    <ChevronDown className="size-4 text-slate-400" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent
                  dir={isArabic ? 'rtl' : 'ltr'}
                  className="w-auto p-2"
                  align={isArabic ? 'end' : 'start'}
                >
                  <Calendar
                    mode="single"
                    selected={filters.to_date ? new Date(filters.to_date) : undefined}
                    onSelect={(date) => {
                      if (!date) {
                        updateFilter('to_date', '');
                        return;
                      }

                      const nextTo = toISO(date);
                      const currentFrom = filters.from_date;

                      if (currentFrom && date < new Date(currentFrom)) {
                        onFiltersChange({
                          ...filters,
                          from_date: nextTo,
                          to_date: nextTo,
                        });
                        return;
                      }

                      updateFilter('to_date', nextTo);
                    }}
                  />
                </PopoverContent>
              </Popover>
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