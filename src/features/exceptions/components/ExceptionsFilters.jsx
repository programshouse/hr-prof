import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, UserPlus2, Filter, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAllDepartments, useAllBranches, useAllPositions, useAllShifts } from '@/shared/hooks';
import { useFilter } from '@/shared/hooks/useFilter';
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

  const filteredOptions = useMemo(() => {
    const term = (searchTerm || '').toLowerCase();

    return (options || []).filter((option) =>
      getOptionLabel(option).toLowerCase().includes(term)
    );
  }, [options, searchTerm, isArabic]);

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
          h-11 w-full border-slate-200 bg-white shadow-sm xl:w-[180px]
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

export function ExceptionsFilters({ filters, onFiltersChange, onAddClick }) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith('ar');

  const { data: departments = [] } = useAllDepartments();
  const { data: branches = [] } = useAllBranches();
  const { data: positions = [] } = useAllPositions();
  const { data: shifts = [] } = useAllShifts();

  const { searchTerm, handleSearchChange, handleChange, handleReset } = useFilter(
    filters,
    onFiltersChange,
    'search'
  );

  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters || {}).some(([_key, value]) => {
      if (!value || value === 'all' || value === '') return false;
      return true;
    });
  }, [filters]);

  return (
    <div dir={isArabic ? 'rtl' : 'ltr'} className="w-full max-w-full">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-3 xl:flex-row xl:items-center xl:gap-4">
          <div className="relative w-full xl:w-auto">
            <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

            <Input
              placeholder={t('exceptions.searchEmployee')}
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className={`
                h-11 w-full ps-10 xl:w-[240px]
                ${isArabic ? 'text-right placeholder:text-right' : 'text-left placeholder:text-left'}
              `}
            />
          </div>

          <div className="flex min-w-0 w-full flex-wrap gap-3 xl:w-auto xl:flex-nowrap xl:gap-4">
            <div className="w-full xl:w-auto">
              <SearchableSelect
                value={filters.company || 'all'}
                onValueChange={(val) => handleChange('company', val)}
                options={departments}
                placeholder={t('exceptions.company')}
                allOption={t('filters.allCompanies')}
              />
            </div>

            <div className="w-full xl:w-auto">
              <SearchableSelect
                value={filters.branch || 'all'}
                onValueChange={(val) => handleChange('branch', val)}
                options={branches}
                placeholder={t('exceptions.branch')}
                allOption={t('filters.allBranches')}
              />
            </div>

            <div className="w-full xl:w-auto">
              <SearchableSelect
                value={filters.shift || 'all'}
                onValueChange={(val) => handleChange('shift', val)}
                options={shifts}
                placeholder={t('exceptions.shift')}
                allOption={t('filters.allShifts')}
              />
            </div>

            <div className="w-full xl:w-auto">
              <SearchableSelect
                value={filters.position || 'all'}
                onValueChange={(val) => handleChange('position', val)}
                options={positions}
                placeholder={t('exceptions.position')}
                allOption={t('filters.allPositions')}
              />
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={handleReset}
                className="flex h-11 w-full items-center justify-center gap-2 px-3 text-slate-500 hover:text-red-500 xl:w-auto xl:justify-start"
              >
                <X className="size-4" />
                <span className="text-sm font-medium">{t('exceptions.clearFilters')}</span>
              </Button>
            )}
          </div>
        </div>

        <Button
          className="h-11 w-full gap-2 xl:w-auto xl:shrink-0"
          variant="outline"
          size="lg"
          onClick={onAddClick}
        >
          <UserPlus2 className="size-4" />
          {t('exceptions.addNew')}
        </Button>
      </div>
    </div>
  );
}