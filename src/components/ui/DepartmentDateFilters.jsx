import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarDays, ChevronDown, Filter, Search, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import { useAllDepartments } from '@/shared/hooks/useAllDepartments';
import { useFilter } from '@/shared/hooks/useFilter';

function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder,
  allOption,
}) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith('ar');

  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const getOptionLabel = (option) => {
    if (isArabic) {
      return (
        option?.name_ar ||
        option?.title_ar ||
        option?.name ||
        option?.name_en ||
        option?.title_en ||
        ''
      );
    }

    return (
      option?.name_en ||
      option?.title_en ||
      option?.name ||
      option?.name_ar ||
      option?.title_ar ||
      ''
    );
  };

  const filteredOptions = (options || []).filter((option) =>
    getOptionLabel(option).toLowerCase().includes(searchTerm.toLowerCase())
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
      value={value}
      onValueChange={onValueChange}
    >
      <SelectTrigger
        className={`
          h-11 w-full rounded-md border-slate-200 bg-white px-3 shadow-sm
          ${isArabic ? 'text-right [&>span]:text-right' : 'text-left [&>span]:text-left'}
        `}
      >
        <div className="flex w-full items-center gap-2">
          <Filter className="size-4 shrink-0 text-slate-400" />
          <SelectValue placeholder={placeholder} />
        </div>
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

          {filteredOptions.map((option) => (
            <SelectItem
              key={option.id}
              value={String(option.id)}
              className={isArabic ? 'text-right [&>span]:text-right' : 'text-left'}
            >
              {getOptionLabel(option)}
            </SelectItem>
          ))}
        </div>
      </SelectContent>
    </Select>
  );
}

export default function DepartmentDateFilters({
  filters,
  onFiltersChange,
  _searchPlaceholder,
  searchKey = 'keyword',
  departmentKey = 'department',
  statusKey = 'status',
  fromKey = 'from',
  toKey = 'to',
  getDepartmentLabel: _getDepartmentLabel,
  className = '',
  showStatus = true,
}) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith('ar');

  const { data: departments = [] } = useAllDepartments();

  const { searchTerm, handleSearchChange, handleChange, handleDateChange, handleReset } = useFilter(
    filters,
    onFiltersChange,
    searchKey
  );

  const hasFilters = Object.entries(filters || {}).some(([_key, value]) => {
    return value !== undefined && value !== null && value !== '' && value !== 'all';
  });

  const formatDisplayDate = (value) => {
    if (!value) return '';
    return new Date(value).toLocaleDateString(isArabic ? 'ar-EG' : 'en-GB');
  };

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className={`flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between ${className}`}
    >
      <div className="flex w-full flex-1 flex-wrap items-center gap-3">
        <div className="relative w-full xl:max-w-[250px] xl:min-w-[150px] xl:flex-1">
          <Search className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

          <Input
            dir={isArabic ? 'rtl' : 'ltr'}
            placeholder={t('filters.search')}
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className={`
              h-11 w-full rounded-md border-slate-200 ps-11 text-sm text-slate-700 shadow-sm
              ${isArabic ? 'text-right placeholder:text-right' : 'text-left placeholder:text-left'}
            `}
          />
        </div>

        <div className="flex-1">
          <SearchableSelect
            value={filters?.[departmentKey] ? String(filters?.[departmentKey]) : 'all'}
            onValueChange={(val) => handleChange(departmentKey, val)}
            options={departments}
            placeholder={t('filters.department')}
            allOption={t('filters.allDepartments')}
          />
        </div>

        {showStatus && (
          <div className="flex-1">
            <Select
              dir={isArabic ? 'rtl' : 'ltr'}
              value={filters?.[statusKey] ? String(filters?.[statusKey]) : 'all'}
              onValueChange={(val) => handleChange(statusKey, val)}
            >
              <SelectTrigger
                className={`
                  h-11 w-full rounded-md border-slate-200 bg-white px-3 shadow-sm
                  ${isArabic ? 'text-right [&>span]:text-right' : 'text-left [&>span]:text-left'}
                `}
              >
                <div className="flex w-full items-center gap-2">
                  <Filter className="size-4 shrink-0 text-slate-400" />
                  <SelectValue placeholder={t('filters.status')} />
                </div>
              </SelectTrigger>

              <SelectContent dir={isArabic ? 'rtl' : 'ltr'}>
                <SelectItem
                  value="all"
                  className={isArabic ? 'text-right [&>span]:text-right' : 'text-left'}
                >
                  {t('filters.allStatuses')}
                </SelectItem>
                <SelectItem
                  value="pending"
                  className={isArabic ? 'text-right [&>span]:text-right' : 'text-left'}
                >
                  {t('filters.pending')}
                </SelectItem>
                <SelectItem
                  value="approved"
                  className={isArabic ? 'text-right [&>span]:text-right' : 'text-left'}
                >
                  {t('filters.approved')}
                </SelectItem>
                <SelectItem
                  value="rejected"
                  className={isArabic ? 'text-right [&>span]:text-right' : 'text-left'}
                >
                  {t('filters.rejected')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="reset1"
                size="sm"
                className={`
                  flex h-11 w-full items-center justify-between rounded-md border-slate-200 bg-white px-4 text-xs font-medium text-slate-600 shadow-sm xl:w-[180px]
                  ${isArabic ? 'text-right' : 'text-left'}
                `}
              >
                <span className="flex items-center gap-2">
                  <CalendarDays className="size-4 text-slate-400" />
                  {filters?.[fromKey]
                    ? formatDisplayDate(filters[fromKey])
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
                selected={filters?.[fromKey] ? new Date(filters[fromKey]) : undefined}
                onSelect={(date) => handleDateChange(fromKey, date)}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="reset1"
                size="sm"
                className={`
                  flex h-11 w-full items-center justify-between rounded-md border-slate-200 bg-white px-4 text-xs font-medium text-slate-600 shadow-sm xl:w-[180px]
                  ${isArabic ? 'text-right' : 'text-left'}
                `}
              >
                <span className="flex items-center gap-2">
                  <CalendarDays className="size-4 text-slate-400" />
                  {filters?.[toKey]
                    ? formatDisplayDate(filters[toKey])
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
                selected={filters?.[toKey] ? new Date(filters[toKey]) : undefined}
                onSelect={(date) => handleDateChange(toKey, date)}
              />
            </PopoverContent>
          </Popover>
        </div>

        {hasFilters && (
          <Button
            variant="ghost"
            onClick={handleReset}
            className="flex h-11 items-center gap-2 px-3 text-slate-500 hover:text-red-500"
          >
            <X className="size-4" />
            <span className="text-sm font-medium">{t('filters.clearFilters')}</span>
          </Button>
        )}
      </div>
    </div>
  );
}