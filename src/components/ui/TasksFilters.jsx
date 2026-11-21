import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarDays, ChevronDown, Filter, Search, X } from 'lucide-react';

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

import { useAllDepartments } from '@/shared/hooks/useAllDepartments';
import { useAllPositions } from '@/shared/hooks/useAllPositions';
import { useAllBranches } from '@/shared/hooks/useAllBranches';
import { useAllShifts } from '@/shared/hooks/useAllShifts';
import { useFilter } from '@/shared/hooks/useFilter';
import {
  resolveEntityDisplayName,
  resolvePositionDisplayName,
} from '@/lib/utils/employeeDisplayName';

const formatFilterDate = (value, isRTL) => {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(isRTL ? 'ar-EG' : 'en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

const getOptionLabel = (option, isRTL, { preferTitle = false } = {}) => {
  if (!option) return '';

  if (preferTitle) {
    return resolvePositionDisplayName(option, { preferArabic: isRTL });
  }

  return resolveEntityDisplayName(option, { preferArabic: isRTL });
};

function SearchableSelect({
  value,
  onValueChange,
  options = [],
  placeholder,
  allOption,
  preferTitle = false,
}) {
  const { t, i18n } = useTranslation();

  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const isRTL = i18n.language?.startsWith('ar');

  const resolveLabel = (option) => getOptionLabel(option, isRTL, { preferTitle });

  const filteredOptions = options.filter((option) => {
    const label = resolveLabel(option);
    return label.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const selectedOption = options.find((option) => String(option.id) === String(value));
  const selectedLabel =
    value && value !== 'all' && selectedOption ? resolveLabel(selectedOption) : undefined;

  const handleOpenChange = (open) => {
    setIsOpen(open);

    if (!open) {
      setSearchTerm('');
    }
  };

  return (
    <Select
      key={i18n.language}
      dir={isRTL ? 'rtl' : 'ltr'}
      open={isOpen}
      onOpenChange={handleOpenChange}
      value={value}
      onValueChange={onValueChange}
    >
      <SelectTrigger
        className={`h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-500 shadow-none ${
          isRTL ? 'text-right' : 'text-left'
        }`}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Filter className="size-4 shrink-0 text-slate-400" />

          <div
            className={`min-w-0 flex-1 truncate ${
              isRTL ? 'text-right' : 'text-left'
            }`}
          >
            <SelectValue placeholder={placeholder}>
              {value !== 'all' ? selectedLabel : undefined}
            </SelectValue>
          </div>
        </div>
      </SelectTrigger>

      <SelectContent
        dir={isRTL ? 'rtl' : 'ltr'}
        className={`max-h-60 ${isRTL ? 'text-right' : 'text-left'}`}
      >
        <div className="sticky top-0 z-10 border-b bg-white p-2">
          <div className="relative">
            <Search
              className={
                isRTL
                  ? 'absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400'
                  : 'absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400'
              }
            />

            <Input
              dir={isRTL ? 'rtl' : 'ltr'}
              placeholder={t('filters.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={
                isRTL
                  ? 'h-8 pr-9 text-right text-sm placeholder:text-right'
                  : 'h-8 pl-9 text-left text-sm placeholder:text-left'
              }
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>

        <div className="max-h-48 overflow-y-auto">
          <SelectItem
            value="all"
            className={isRTL ? 'cursor-pointer text-right' : 'cursor-pointer text-left'}
          >
            {allOption || t('filters.all')}
          </SelectItem>

          {filteredOptions.map((option) => (
            <SelectItem
              key={option.id}
              value={String(option.id)}
              className={isRTL ? 'cursor-pointer text-right' : 'cursor-pointer text-left'}
            >
              {resolveLabel(option)}
            </SelectItem>
          ))}
        </div>
      </SelectContent>
    </Select>
  );
}

export default function TasksFilters({
  filters,
  onFiltersChange,
  searchPlaceholder = 'Search',
  searchKey = 'keyword',
  departmentKey = 'department',
  positionKey = 'position',
  shiftKey = 'shift_id',
  branchKey = 'branch_id',
  fromKey = 'from',
  toKey = 'to',
  showShift = false,
  showBranch = false,
  className = '',
}) {
  const { t, i18n } = useTranslation();

  const { data: departments = [] } = useAllDepartments();
  const { data: positions = [] } = useAllPositions();
  const { data: branches = [] } = useAllBranches();
  const { data: shifts = [] } = useAllShifts();

  const isRTL = i18n.language?.startsWith('ar');

  const {
    searchTerm,
    handleSearchChange,
    handleChange,
    handleDateChange,
    handleReset,
  } = useFilter(filters, onFiltersChange, searchKey);

  const hasFilters = Object.values(filters || {}).some(
    (value) => value && value !== 'all'
  );

  return (
    <div className={`flex w-full flex-wrap items-center gap-4 ${className}`}>
      <div className="relative w-[230px]">
        <Search
          className={
            isRTL
              ? 'pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-400'
              : 'pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400'
          }
        />

        <Input
          dir={isRTL ? 'rtl' : 'ltr'}
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className={
            isRTL
              ? 'h-10 w-full rounded-lg border-slate-200 pr-11 text-right text-xs text-slate-600 shadow-none placeholder:text-right'
              : 'h-10 w-full rounded-lg border-slate-200 pl-11 text-left text-xs text-slate-600 shadow-none placeholder:text-left'
          }
        />
      </div>

      <div className="w-[230px]">
        <SearchableSelect
          value={filters?.[departmentKey] ? String(filters?.[departmentKey]) : 'all'}
          onValueChange={(val) => handleChange(departmentKey, val)}
          options={departments}
          placeholder={t('filters.department')}
          allOption={t('filters.allDepartments')}
        />
      </div>

      <div className="w-[230px]">
        <SearchableSelect
          value={filters?.[positionKey] ? String(filters?.[positionKey]) : 'all'}
          onValueChange={(val) => handleChange(positionKey, val)}
          options={positions}
          placeholder={t('filters.position')}
          allOption={t('filters.allPositions')}
          preferTitle
        />
      </div>

      {showShift && (
        <div className="w-[230px]">
          <SearchableSelect
            value={filters?.[shiftKey] ? String(filters?.[shiftKey]) : 'all'}
            onValueChange={(val) => handleChange(shiftKey, val)}
            options={shifts}
            placeholder={t('filters.shift')}
            allOption={t('filters.allShifts')}
          />
        </div>
      )}

      {showBranch && (
        <div className="w-[230px]">
          <SearchableSelect
            value={filters?.[branchKey] ? String(filters?.[branchKey]) : 'all'}
            onValueChange={(val) => handleChange(branchKey, val)}
            options={branches}
            placeholder={t('filters.branch')}
            allOption={t('filters.allBranches')}
          />
        </div>
      )}

      <div className="w-[230px]">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={`flex h-10 w-full items-center justify-between rounded-lg border-slate-200 bg-white px-3 text-xs font-normal text-slate-500 shadow-none hover:bg-white ${
                isRTL ? 'text-right' : 'text-left'
              }`}
            >
              <span className="flex min-w-0 flex-1 items-center gap-2">
                <CalendarDays className="size-4 shrink-0 text-slate-400" />

                <span
                  className={`truncate ${
                    isRTL ? 'text-right' : 'text-left'
                  }`}
                >
                  {filters?.[fromKey]
                    ? formatFilterDate(filters[fromKey], isRTL)
                    : t('filters.from')}
                </span>
              </span>

              <ChevronDown className="size-4 shrink-0 text-slate-400" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-auto p-2" align="start">
            <Calendar
              mode="single"
              selected={filters?.[fromKey] ? new Date(filters[fromKey]) : undefined}
              onSelect={(date) => handleDateChange(fromKey, date)}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="w-[230px]">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={`flex h-10 w-full items-center justify-between rounded-lg border-slate-200 bg-white px-3 text-xs font-normal text-slate-500 shadow-none hover:bg-white ${
                isRTL ? 'text-right' : 'text-left'
              }`}
            >
              <span className="flex min-w-0 flex-1 items-center gap-2">
                <CalendarDays className="size-4 shrink-0 text-slate-400" />

                <span
                  className={`truncate ${
                    isRTL ? 'text-right' : 'text-left'
                  }`}
                >
                  {filters?.[toKey]
                    ? formatFilterDate(filters[toKey], isRTL)
                    : t('filters.to')}
                </span>
              </span>

              <ChevronDown className="size-4 shrink-0 text-slate-400" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-auto p-2" align="start">
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
          className="flex h-10 items-center gap-2 px-3 text-slate-500 hover:text-red-500"
        >
          <X className="size-4" />

          <span className="text-sm font-medium">
            {t('filters.clearFilters')}
          </span>
        </Button>
      )}
    </div>
  );
}