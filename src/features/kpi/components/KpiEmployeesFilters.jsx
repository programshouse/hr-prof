import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

import { useAllDepartments } from '@/shared/hooks/useAllDepartments';
import { useAllPositions } from '@/shared/hooks/useAllPositions';
import { useAllShifts } from '@/shared/hooks/useAllShifts';
import { useAllBranches } from '@/shared/hooks/useAllBranches';

import { useFilter } from '@/shared/hooks/useFilter';

// Searchable Select Component
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
        option.name_en ||
        option.title_en ||
        option.name ||
        option.title ||
        ''
      );
    }

    return (
      option.name_en ||
      option.title_en ||
      option.name_ar ||
      option.title_ar ||
      option.name ||
      option.title ||
      ''
    );
  };

  const filteredOptions = options.filter((option) =>
    getOptionLabel(option).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenChange = (open) => {
    setIsOpen(open);

    if (!open) {
      setSearchTerm('');
    }
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
        className={cn(
          'h-11 border-gray-200 bg-white text-sm text-gray-500 shadow-sm',
          isArabic
            ? 'text-right [&>span]:text-right'
            : 'text-left [&>span]:text-left'
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent dir={isArabic ? 'rtl' : 'ltr'} className="max-h-60">
        <div className="sticky top-0 z-10 border-b bg-white p-2">
          <div className="relative">
            <Search className="absolute start-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <Input
              placeholder={t('filters.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                'h-8 ps-8 text-sm',
                isArabic
                  ? 'text-right placeholder:text-right'
                  : 'text-left placeholder:text-left'
              )}
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

export default function KpiEmployeesFilters({ filters, onFiltersChange }) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith('ar');

  const { searchTerm, handleSearchChange, handleChange } = useFilter(
    filters,
    onFiltersChange,
    'keyword'
  );

  const { data: departments = [], isLoading: loadingDepartments } =
    useAllDepartments();
  const { data: positions = [], isLoading: loadingPositions } =
    useAllPositions();
  const { data: shifts = [], isLoading: loadingShifts } = useAllShifts();
  const { data: branches = [], isLoading: loadingBranches } = useAllBranches();

  const hasAnyFilter =
    (filters?.keyword && String(filters.keyword).trim().length > 0) ||
    (filters?.department && String(filters.department) !== 'all') ||
    (filters?.position && String(filters.position) !== 'all') ||
    (filters?.shift && String(filters.shift) !== 'all') ||
    (filters?.branch && String(filters.branch) !== 'all');

  const handleReset = () => {
    onFiltersChange({
      department: 'all',
      keyword: '',
      position: 'all',
      shift: 'all',
      branch: 'all',
    });
  };

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className={cn('flex w-full flex-1 flex-wrap items-center gap-3')}
    >
      {/* Search */}
      <div className="relative w-full xl:max-w-[250px] xl:min-w-[150px] xl:flex-1">
        <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />

        <Input
          placeholder={t('filters.search')}
          value={searchTerm || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          className={cn(
            'h-11 w-full rounded-md border-gray-200 bg-white ps-9 pe-3 text-sm text-gray-700 shadow-sm',
            isArabic
              ? 'text-right placeholder:text-right'
              : 'text-left placeholder:text-left'
          )}
        />
      </div>

      {/* Shift */}
      <div className="flex-1">
        <SearchableSelect
          value={filters?.shift ? String(filters.shift) : 'all'}
          onValueChange={(val) => handleChange('shift', val)}
          options={shifts}
          placeholder={
            loadingShifts ? t('filters.loading') : t('filters.selectShift')
          }
          allOption={t('filters.allShifts')}
        />
      </div>

      {/* Position */}
      <div className="flex-1">
        <SearchableSelect
          value={filters?.position ? String(filters.position) : 'all'}
          onValueChange={(val) => handleChange('position', val)}
          options={positions}
          placeholder={
            loadingPositions ? t('filters.loading') : t('filters.selectJob')
          }
          allOption={t('filters.allJobs')}
        />
      </div>

      {/* Department */}
      <div className="flex-1">
        <SearchableSelect
          value={filters?.department ? String(filters.department) : 'all'}
          onValueChange={(val) => handleChange('department', val)}
          options={departments}
          placeholder={
            loadingDepartments
              ? t('filters.loading')
              : t('filters.selectDepartment')
          }
          allOption={t('filters.allDepartments')}
        />
      </div>

      {/* Branch */}
      <div className="flex-1">
        <SearchableSelect
          value={filters?.branch ? String(filters.branch) : 'all'}
          onValueChange={(val) => handleChange('branch', val)}
          options={branches}
          placeholder={
            loadingBranches ? t('filters.loading') : t('filters.selectBranch')
          }
          allOption={t('filters.allBranches')}
        />
      </div>

      {/* Clear filters */}
      {hasAnyFilter && (
        <Button
          variant="ghost"
          onClick={handleReset}
          className="flex h-11 items-center gap-2 px-3 text-slate-400 hover:text-red-500"
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