import React, { useMemo, useState } from 'react';
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
import { DatePicker } from '@/components/ui/DatePicker';
import { Search, Plus, X } from 'lucide-react';
import { useAllPositions } from '@/shared/hooks/useAllPositions';
import { useAllDepartments } from '@/shared/hooks/useAllDepartments';
import { useAllBranches } from '@/shared/hooks/useAllBranches';

/* ---------------------------------------------
  helpers
--------------------------------------------- */
function getOptionLabel(o, isArabic = false) {
  if (isArabic) {
    return (
      o?.title_ar ||
      o?.name_ar ||
      o?.title_en ||
      o?.name_en ||
      o?.name ||
      o?.label ||
      ''
    );
  }

  return o?.title_en || o?.name_en || o?.name_ar || o?.name || o?.label || '';
}

// supports array OR { data: [...] } OR { data: { data: [...] } }
function normalizeOptions(input) {
  if (Array.isArray(input)) return input;
  if (Array.isArray(input?.data)) return input.data;
  if (Array.isArray(input?.data?.data)) return input.data.data;
  return [];
}

/* ---------------------------------------------
  Searchable Select Component
--------------------------------------------- */
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

  const normalized = useMemo(() => normalizeOptions(options), [options]);

  const filteredOptions = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();

    if (!q) return normalized;

    return normalized.filter((o) =>
      getOptionLabel(o, isArabic).toLowerCase().includes(q)
    );
  }, [normalized, searchTerm, isArabic]);

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
          h-10 w-full rounded-md border-slate-200 bg-white text-sm text-slate-600 shadow-sm
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
            {allOption || t('filters.all')}
          </SelectItem>

          {filteredOptions.map((option) => (
            <SelectItem
              key={option.id ?? option.value}
              value={String(option.id ?? option.value)}
              className={isArabic ? 'text-right [&>span]:text-right' : 'text-left'}
            >
              {getOptionLabel(option, isArabic) || '--'}
            </SelectItem>
          ))}
        </div>
      </SelectContent>
    </Select>
  );
}

/* ---------------------------------------------
  External Missions Filters Component
--------------------------------------------- */
export default function ExternalMissionsFilters({
  filters,
  onFilterChange,
  onReset,
  onAddMission,
}) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith('ar');

  const { data: positionsData = [] } = useAllPositions();
  const { data: departmentsData = [] } = useAllDepartments();
  const { data: branchesData = [] } = useAllBranches();

  const companies = useMemo(
    () =>
      normalizeOptions([
        { id: 'medical', name: 'Medical' },
        { id: 'pharma', name: 'Pharma' },
      ]),
    []
  );

  const departments = useMemo(
    () => normalizeOptions(departmentsData),
    [departmentsData]
  );

  const positions = useMemo(
    () => normalizeOptions(positionsData),
    [positionsData]
  );

  const branches = useMemo(
    () => normalizeOptions(branchesData),
    [branchesData]
  );

  const statuses = [
    { value: 'upcoming', label: t('externalMissions.status.upcoming') },
    { value: 'ongoing', label: t('externalMissions.status.ongoing') },
    { value: 'finished', label: t('externalMissions.status.finished') },
    { value: 'canceled', label: t('externalMissions.status.canceled') },
  ];

  const priorities = [
    { value: 'high', label: t('externalMissions.priority.high') },
    { value: 'medium', label: t('externalMissions.priority.medium') },
    { value: 'low', label: t('externalMissions.priority.low') },
  ];

  const handleChange = (key, value) => {
    onFilterChange?.(key, value);
  };

  const hasAnyFilter =
    filters.search ||
    (filters.company && filters.company !== 'all') ||
    (filters.branch && filters.branch !== 'all') ||
    (filters.department && filters.department !== 'all') ||
    (filters.position && filters.position !== 'all') ||
    (filters.status && filters.status !== 'all') ||
    (filters.priority && filters.priority !== 'all') ||
    filters.from ||
    filters.to;

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="grid gap-3 py-5 xl:grid-cols-[1fr_auto] xl:items-center"
    >
      <div className="w-full">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 xl:flex xl:flex-wrap xl:items-center xl:gap-3">
          {/* Search */}
          <div className="relative w-full xl:w-[320px] 2xl:w-[340px]">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

            <Input
              placeholder={t('filters.search')}
              value={filters.search}
              onChange={(e) => handleChange('search', e.target.value)}
              className={`
                h-10 w-full rounded-md border-slate-200 ps-9 text-sm text-slate-700 shadow-sm
                ${isArabic ? 'text-right placeholder:text-right' : 'text-left placeholder:text-left'}
              `}
            />
          </div>

          {/* Department */}
          <div className="w-full xl:w-[170px]">
            <SearchableSelect
              value={filters.department}
              onValueChange={(val) => handleChange('department', val)}
              options={departments}
              placeholder={t('filters.department')}
              allOption={t('filters.allDepartments')}
            />
          </div>

          {/* Branch */}
          <div className="w-full xl:w-[170px]">
            <SearchableSelect
              value={filters.branch}
              onValueChange={(val) => handleChange('branch', val)}
              options={branches}
              placeholder={t('filters.branch')}
              allOption={t('filters.allBranches')}
            />
          </div>

          {/* Position */}
          <div className="w-full xl:w-[170px]">
            <SearchableSelect
              value={filters.position}
              onValueChange={(val) => handleChange('position', val)}
              options={positions}
              placeholder={t('filters.position')}
              allOption={t('filters.allPositions')}
            />
          </div>

          {/* Status */}
          <div className="w-full xl:w-[140px]">
            <SearchableSelect
              value={filters.status}
              onValueChange={(val) => handleChange('status', val)}
              options={statuses}
              placeholder={t('filters.status')}
              allOption={t('filters.allStatuses')}
            />
          </div>

          {/* From */}
          <div
            className={`
              w-full xl:w-[150px]
              ${isArabic ? '[&_input]:text-right [&_input::placeholder]:text-right' : '[&_input]:text-left'}
            `}
          >
            <DatePicker
              placeholder={t('filters.fromDate')}
              value={filters.from}
              onChange={(val) => handleChange('from', val)}
            />
          </div>

          {/* To */}
          <div
            className={`
              w-full xl:w-[150px]
              ${isArabic ? '[&_input]:text-right [&_input::placeholder]:text-right' : '[&_input]:text-left'}
            `}
          >
            <DatePicker
              placeholder={t('filters.toDate')}
              value={filters.to}
              onChange={(val) => handleChange('to', val)}
            />
          </div>

          {/* Clear */}
          {hasAnyFilter && (
            <div className="w-full xl:w-auto">
              <Button
                variant="ghost"
                onClick={onReset}
                className="h-10 w-full justify-center px-3 text-slate-500 hover:text-red-500 xl:w-auto"
              >
                <X className="size-4" />

                <span className={`${isArabic ? 'mr-1' : 'ml-1'} text-sm font-medium`}>
                  {t('filters.clear')}
                </span>
              </Button>
            </div>
          )}
        </div>
      </div>

      <div
        className={`
          flex w-full xl:w-auto
          ${isArabic ? 'justify-start' : 'justify-end'}
        `}
      >
        <Button
          onClick={onAddMission}
          className="h-10 gap-2 px-4"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          {t('externalMissions.addMission')}
        </Button>
      </div>
    </div>
  );
}