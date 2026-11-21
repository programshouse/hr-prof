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
import { Search as SearchIcon, Filter, X, CalendarDays, ChevronDown } from 'lucide-react';
import React, { useState } from 'react';
import { useAllBranches, useAllDepartments, useAllShifts } from '@/shared/hooks';
import { useTranslation } from 'react-i18next';

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
            <SearchIcon className="absolute start-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

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

export function FingerprintIssuesFilters({
  month,
  year,
  filters,
  onFiltersChange,
}) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith('ar');

  const { data: branches = [] } = useAllBranches();
  const { data: companies = [] } = useAllDepartments();
  const { data: shifts = [] } = useAllShifts();

  const setOne = (key, value) => onFiltersChange({ ...filters, [key]: value });

  const toISO = (date) => {
    if (!date) return '';

    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');

    return `${y}-${m}-${d}`;
  };

  const monthStart = new Date(Number(year), Number(month) - 1, 1);
  const monthEnd = new Date(Number(year), Number(month), 0);

  const clampToMonth = (date) => {
    if (!date) return null;

    const time = date.getTime();
    const start = monthStart.getTime();
    const end = monthEnd.getTime();

    if (time < start) return new Date(monthStart);
    if (time > end) return new Date(monthEnd);

    return date;
  };

  React.useEffect(() => {
    const fromDate = filters.from ? new Date(filters.from) : null;
    const toDate = filters.to ? new Date(filters.to) : null;

    let nextFrom = fromDate ? clampToMonth(fromDate) : null;
    let nextTo = toDate ? clampToMonth(toDate) : null;

    if (nextFrom && nextTo && nextTo.getTime() < nextFrom.getTime()) {
      nextTo = new Date(nextFrom);
    }

    const changed =
      (nextFrom ? toISO(nextFrom) : '') !== (filters.from || '') ||
      (nextTo ? toISO(nextTo) : '') !== (filters.to || '');

    if (changed) {
      onFiltersChange({
        ...filters,
        from: nextFrom ? toISO(nextFrom) : '',
        to: nextTo ? toISO(nextTo) : '',
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  const hasFilters = Boolean(
    filters.search?.trim() ||
      (filters.company && filters.company !== 'all') ||
      (filters.branch && filters.branch !== 'all') ||
      (filters.shift && filters.shift !== 'all') ||
      (filters.from && String(filters.from).trim().length > 0) ||
      (filters.to && String(filters.to).trim().length > 0)
  );

  const handleReset = () => {
    onFiltersChange({
      search: '',
      company: 'all',
      branch: 'all',
      shift: 'all',
      from: '',
      to: '',
    });
  };

  const formatDisplayDate = (value) => {
    if (!value) return '';
    return new Date(value).toLocaleDateString(isArabic ? 'ar-EG' : 'en-GB');
  };

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="flex flex-col gap-3 bg-white xl:flex-row xl:items-center xl:justify-between"
    >
      <div className="flex w-full flex-1 flex-wrap items-center gap-3">
        <div className="relative w-full xl:max-w-[250px] xl:min-w-[150px] xl:flex-1">
          <SearchIcon className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

          <Input
            placeholder={t('fingerprintIssues.searchEmployee')}
            value={filters.search || ''}
            onChange={(e) => setOne('search', e.target.value)}
            className={`
              h-11 w-full rounded-md border-slate-200 ps-11 text-sm text-slate-700 shadow-sm
              ${isArabic ? 'text-right placeholder:text-right' : 'text-left placeholder:text-left'}
            `}
          />
        </div>

        <div className="flex-1 xl:w-[220px] xl:flex-none">
          <SearchableSelect
            value={filters.company ? String(filters.company) : 'all'}
            onValueChange={(val) => setOne('company', val === 'all' ? 'all' : val)}
            options={companies}
            placeholder={t('fingerprintIssues.company')}
            allOption={t('filters.allCompanies')}
          />
        </div>

        <div className="flex-1 xl:w-[220px] xl:flex-none">
          <SearchableSelect
            value={filters.branch ? String(filters.branch) : 'all'}
            onValueChange={(val) => setOne('branch', val === 'all' ? 'all' : val)}
            options={branches}
            placeholder={t('fingerprintIssues.branch')}
            allOption={t('filters.allBranches')}
          />
        </div>

        <div className="flex-1 xl:w-[220px] xl:flex-none">
          <SearchableSelect
            value={filters.shift || 'all'}
            onValueChange={(val) => setOne('shift', val === 'all' ? 'all' : val)}
            options={shifts}
            placeholder={t('fingerprintIssues.shift')}
            allOption={t('filters.allShifts')}
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
                    {filters.from
                      ? formatDisplayDate(filters.from)
                      : t('fingerprintIssues.from')}
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
                  selected={filters.from ? new Date(filters.from) : undefined}
                  onSelect={(date) => {
                    const clamped = clampToMonth(date);

                    if (!clamped) return setOne('from', '');

                    const newFrom = clamped;
                    let newTo = filters.to ? clampToMonth(new Date(filters.to)) : null;

                    if (newTo && newTo.getTime() < newFrom.getTime()) {
                      newTo = newFrom;
                    }

                    onFiltersChange({
                      ...filters,
                      from: toISO(newFrom),
                      to: newTo ? toISO(newTo) : filters.to || '',
                    });
                  }}
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
                    {filters.to
                      ? formatDisplayDate(filters.to)
                      : t('fingerprintIssues.to')}
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
                  selected={filters.to ? new Date(filters.to) : undefined}
                  onSelect={(date) => {
                    const clamped = clampToMonth(date);

                    if (!clamped) return setOne('to', '');

                    const newTo = clamped;
                    const newFrom = filters.from
                      ? clampToMonth(new Date(filters.from))
                      : null;
                    const fromISO = newFrom ? toISO(newFrom) : '';
                    const toISOVal = toISO(newTo);

                    if (newFrom && newTo.getTime() < newFrom.getTime()) {
                      onFiltersChange({
                        ...filters,
                        from: toISOVal,
                        to: toISOVal,
                      });
                    } else {
                      onFiltersChange({
                        ...filters,
                        from: fromISO,
                        to: toISOVal,
                      });
                    }
                  }}
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

            <span className="text-sm font-medium">
              {t('fingerprintIssues.clearFilters')}
            </span>
          </Button>
        )}
      </div>
    </div>
  );
}