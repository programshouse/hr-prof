// src/features/overtime/components/OvertimeSheetFilters.jsx
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
import { useAllDepartments } from '@/shared/hooks/useAllDepartments';
import { useAllBranches } from '@/shared/hooks/useAllBranches';
import { useFilter } from '@/shared/hooks/useFilter';

/* ============================= */
/*   Searchable Select Dropdown  */
/* ============================= */

function SearchableSelect({
  value,
  onValueChange,
  options = [],
  placeholder,
  allOption,
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language?.startsWith('ar');

  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);

  const getLabel = (option) => {
    if (isRTL) {
      return (
        option.name_ar ||
        option.title_ar ||
        option.name_en ||
        option.title_en ||
        option.name ||
        option.title ||
        '—'
      );
    }

    return (
      option.name_en ||
      option.title_en ||
      option.name_ar ||
      option.title_ar ||
      option.name ||
      option.title ||
      '—'
    );
  };

  const filteredOptions = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();

    if (!q) return options;

    return options.filter((option) =>
      getLabel(option).toLowerCase().includes(q)
    );
  }, [options, searchTerm, isRTL]);

  return (
    <Select
      dir={isRTL ? 'rtl' : 'ltr'}
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);

        if (!nextOpen) {
          setSearchTerm('');
        }
      }}
      value={value || 'all'}
      onValueChange={onValueChange}
    >
      <SelectTrigger
        className={`
          h-10 border-gray-200 bg-white text-sm shadow-sm
          ${isRTL ? 'text-right [&>span]:text-right' : 'text-left [&>span]:text-left'}
        `}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent dir={isRTL ? 'rtl' : 'ltr'} className="max-h-60">
        <div className="sticky top-0 border-b bg-white p-2">
          <div className="relative">
            <Search className="absolute start-2 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`
                h-8 ps-8 text-sm
                ${isRTL ? 'text-right placeholder:text-right' : 'text-left placeholder:text-left'}
              `}
              placeholder={t('overtime.filters.search')}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>

        <SelectItem
          value="all"
          className={isRTL ? 'text-right [&>span]:text-right' : 'text-left'}
        >
          {allOption || t('common.all')}
        </SelectItem>

        {filteredOptions.map((option) => (
          <SelectItem
            key={option.id}
            value={String(option.id)}
            className={isRTL ? 'text-right [&>span]:text-right' : 'text-left'}
          >
            {getLabel(option)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/* ============================= */
/*         Filters UI            */
/* ============================= */

export default function OvertimeSheetFilters({ filters, onFiltersChange }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language?.startsWith('ar');

  const { searchTerm, handleSearchChange, handleChange } = useFilter(
    filters,
    onFiltersChange,
    'keyword'
  );

  const { data: departments = [] } = useAllDepartments();
  const { data: branches = [] } = useAllBranches();

  const setFilter = (key, value) => {
    handleChange(key, value === 'all' ? '' : value);
  };

  const hasFilter = filters.keyword || filters.department || filters.branch;

  const reset = () => {
    handleSearchChange('');

    onFiltersChange({
      keyword: '',
      department: '',
      branch: '',
    });
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="flex flex-wrap gap-2"
    >
      {/* Search */}
      <div className="relative min-w-[150px] flex-1">
        <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

        <Input
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder={t('overtime.filters.searchEmployee')}
          className={`
            h-10 ps-9
            ${isRTL ? 'text-right placeholder:text-right' : 'text-left placeholder:text-left'}
          `}
        />
      </div>

      {/* Company */}
      <div className="min-w-[150px] flex-1">
        <SearchableSelect
          value={filters.department}
          onValueChange={(value) => setFilter('department', value)}
          options={departments}
          placeholder={t('overtime.filters.company')}
          allOption={t('overtime.filters.allCompanies')}
        />
      </div>

      {/* Branch */}
      <div className="min-w-[150px] flex-1">
        <SearchableSelect
          value={filters.branch}
          onValueChange={(value) => setFilter('branch', value)}
          options={branches}
          placeholder={t('overtime.filters.branch')}
          allOption={t('overtime.filters.allBranches')}
        />
      </div>

      {hasFilter && (
        <Button
          variant="ghost"
          onClick={reset}
          className="h-10 gap-1 text-red-500"
        >
          <X className="size-4" />
          <span>{t('overtime.filters.clear')}</span>
        </Button>
      )}
    </div>
  );
}