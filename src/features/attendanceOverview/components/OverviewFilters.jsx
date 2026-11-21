import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  CalendarDays,
  ChevronDown,
  Filter,
  Search,
  FileText,
  FileSpreadsheet,
  Printer,
  Clipboard,
  Clock4,
  ClockFading,
  X,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAllBranches, useAllDepartments } from '@/shared/hooks';

import { useFilter } from '@/shared/hooks/useFilter';
import { formatDateToLocal } from '@/shared/utils/dateUtils';

const isSameMonth = (a, b) =>
  a instanceof Date &&
  b instanceof Date &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth();

const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

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
        option.name_ar ||
        option.title_ar ||
        option.name ||
        option.name_en ||
        option.title_en ||
        ''
      );
    }

    return (
      option.name_en ||
      option.title_en ||
      option.name ||
      option.name_ar ||
      option.title_ar ||
      ''
    );
  };

  const filteredOptions = options.filter((option) =>
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

export default function OverviewFilters({ filters, onFiltersChange }) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith('ar');

  const { data: branches = [] } = useAllBranches();
  const { data: companies = [] } = useAllDepartments();

  const { searchTerm, handleSearchChange, handleChange, handleDateChange, handleReset } = useFilter(
    filters,
    onFiltersChange,
    'search'
  );

  const [visibleMonth, setVisibleMonth] = useState(() => {
    const from = filters?.from ? new Date(filters.from) : null;
    const to = filters?.to ? new Date(filters.to) : null;
    return startOfMonth(from || to || new Date());
  });

  const formatDisplayDate = (value) => {
    if (!value) return '';
    return new Date(value).toLocaleDateString(isArabic ? 'ar-EG' : 'en-GB');
  };

  const handleSameMonthDateChange = (key, date) => {
    if (!date) {
      handleDateChange(key, date);
      return;
    }

    const nextMonth = startOfMonth(date);
    setVisibleMonth(nextMonth);

    const fromDate = filters?.from ? new Date(filters.from) : null;
    const toDate = filters?.to ? new Date(filters.to) : null;

    if (key === 'from') {
      const nextFrom = date;
      const shouldKeepTo =
        toDate && isSameMonth(nextFrom, toDate) && toDate.getTime() >= nextFrom.getTime();
      const nextTo = shouldKeepTo ? toDate : endOfMonth(nextFrom);

      onFiltersChange({
        ...filters,
        from: formatDateToLocal(nextFrom),
        to: formatDateToLocal(nextTo),
        page: 1,
      });
      return;
    }

    if (key === 'to') {
      const nextTo = date;
      const shouldKeepFrom =
        fromDate && isSameMonth(fromDate, nextTo) && fromDate.getTime() <= nextTo.getTime();
      const nextFrom = shouldKeepFrom ? fromDate : startOfMonth(nextTo);

      onFiltersChange({
        ...filters,
        from: formatDateToLocal(nextFrom),
        to: formatDateToLocal(nextTo),
        page: 1,
      });
      return;
    }

    handleDateChange(key, date);
  };

  const handleCompanyChange = (val) => {
    handleChange('company', val === 'all' ? undefined : val);
  };

  const handleBranchChange = (val) => {
    handleChange('branch', val === 'all' ? undefined : val);
  };

  const hasFilters = Object.keys(filters).some((key) => {
    const value = filters[key];
    return value !== undefined && value !== null && value !== '' && value !== 'all';
  });

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="flex flex-col gap-3 bg-white xl:flex-row xl:items-center xl:justify-between"
    >
      <div className="flex w-full flex-1 flex-wrap items-center gap-3">
        <div className="relative w-full xl:max-w-[250px] xl:min-w-[150px] xl:flex-1">
          <Search className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

          <Input
            placeholder={t('filters.search')}
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className={`
              h-11 w-full rounded-md border-slate-200 ps-11 text-sm text-slate-700 shadow-sm
              ${isArabic ? 'text-right placeholder:text-right' : 'text-left placeholder:text-left'}
            `}
          />
        </div>

        <div className="flex-1 xl:w-[220px] xl:flex-none">
          <SearchableSelect
            value={filters.company || 'all'}
            onValueChange={handleCompanyChange}
            options={companies}
            placeholder={t('filters.company')}
            allOption={t('filters.allCompanies')}
          />
        </div>

        <div className="flex-1 xl:w-[220px] xl:flex-none">
          <SearchableSelect
            value={filters.branch || 'all'}
            onValueChange={handleBranchChange}
            options={branches}
            placeholder={t('filters.branch')}
            allOption={t('filters.allBranches')}
          />
        </div>

        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="flex-1 xl:w-[180px] xl:flex-none">
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
                    {filters.from ? formatDisplayDate(filters.from) : t('filters.fromDate')}
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
                  month={visibleMonth}
                  onMonthChange={(m) => setVisibleMonth(startOfMonth(m))}
                  selected={filters.from ? new Date(filters.from) : undefined}
                  onSelect={(date) => handleSameMonthDateChange('from', date)}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex-1 xl:w-[180px] xl:flex-none">
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
                    {filters.to ? formatDisplayDate(filters.to) : t('filters.toDate')}
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
                  month={visibleMonth}
                  onMonthChange={(m) => setVisibleMonth(startOfMonth(m))}
                  selected={filters.to ? new Date(filters.to) : undefined}
                  onSelect={(date) => handleSameMonthDateChange('to', date)}
                />
              </PopoverContent>
            </Popover>
          </div>
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

      <div className="flex items-center justify-between gap-3 self-stretch xl:w-auto xl:justify-end xl:self-auto">
        <div className="flex w-full flex-col gap-2 xl:w-auto xl:flex-row xl:items-center xl:gap-3">
          <span className="text-xs font-medium text-slate-500 xl:whitespace-nowrap">
            {t('attendance.workingBy')}
          </span>

          <div className="flex w-full gap-2 xl:w-auto">
            <Button
              type="button"
              variant={filters.timeFilter === 'days' ? 'default' : 'reset1'}
              size="sm"
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-md px-4 text-xs font-medium xl:flex-none"
              onClick={() => handleChange('timeFilter', 'days')}
            >
              <Clock4 className="size-4" />
              <span>{t('attendance.days')}</span>
            </Button>

            <Button
              type="button"
              variant={filters.timeFilter === 'hours' ? 'default' : 'reset1'}
              size="sm"
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-md px-4 text-xs font-medium xl:flex-none"
              onClick={() => handleChange('timeFilter', 'hours')}
            >
              <ClockFading className="size-4" />
              <span>{t('attendance.hours')}</span>
            </Button>
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>{null}</DialogTrigger>

          <DialogContent
            dir={isArabic ? 'rtl' : 'ltr'}
            className="max-h-[50vh] min-h-[30vh] w-[95vw] rounded-2xl border-slate-200 bg-slate-50 sm:max-w-4xl lg:max-w-5xl"
          >
            <DialogHeader className="mb-2">
              <DialogTitle
                className={`text-base font-semibold text-slate-900 ${
                  isArabic ? 'text-right' : 'text-left'
                }`}
              >
                {t('common.export')}
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex cursor-pointer flex-col items-center justify-between rounded-md border border-slate-200 bg-white px-4 py-5 text-center shadow-sm">
                <FileText className="text-error mb-3 size-8" />
                <p className="text-[11px] text-slate-500">{t('common.exportAs')}</p>
                <p className="text-sm font-semibold text-slate-900">PDF</p>
                <button className="text-primary mt-2 text-xs font-medium hover:underline">
                  {t('common.download')}
                </button>
              </div>

              <div className="flex cursor-pointer flex-col items-center justify-between rounded-md border border-indigo-300 bg-white px-4 py-5 text-center shadow-sm">
                <FileSpreadsheet className="mb-3 size-8 text-emerald-600" />
                <p className="text-[11px] text-slate-500">{t('common.exportAs')}</p>
                <p className="text-sm font-semibold text-slate-900">Excel</p>
                <button className="text-primary mt-2 text-xs font-medium hover:underline">
                  {t('common.download')}
                </button>
              </div>

              <div className="flex cursor-pointer flex-col items-center justify-between rounded-md border border-slate-200 bg-white px-4 py-5 text-center shadow-sm">
                <Printer className="mb-3 size-8 text-indigo-400" />
                <p className="text-[11px] text-slate-500">{t('common.exportAs')}</p>
                <p className="text-sm font-semibold text-slate-900">Print Table</p>
                <button className="text-primary mt-2 text-xs font-medium hover:underline">
                  {t('common.download')}
                </button>
              </div>

              <div className="flex cursor-pointer flex-col items-center justify-between rounded-md border border-slate-200 bg-white px-4 py-5 text-center shadow-sm">
                <Clipboard className="mb-3 size-8 text-indigo-400" />
                <p className="text-[11px] text-slate-500">{t('common.exportAs')}</p>
                <p className="text-sm font-semibold text-slate-900">Copy Clipboard</p>
                <button className="text-primary mt-2 text-xs font-medium hover:underline">
                  {t('common.download')}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}