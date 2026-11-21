import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, UserPlus2, Filter, X, Upload } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAllDepartments, useAllBranches } from '@/shared/hooks';
import { useFilter } from '@/shared/hooks/useFilter';

function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder,
  allOption,
  getLabel,
  getValue,
}) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith('ar');

  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredOptions = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return options;

    return options.filter((opt) =>
      (getLabel(opt) || '').toLowerCase().includes(q)
    );
  }, [options, searchTerm, getLabel]);

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
          h-11 w-[180px] border-slate-200 bg-white shadow-sm
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

          {filteredOptions.map((opt) => {
            const v = String(getValue(opt) ?? '');
            const label = getLabel(opt) ?? '';

            if (!v || !label) return null;

            return (
              <SelectItem
                key={`${v}-${opt.id ?? label}`}
                value={v}
                className={isArabic ? 'text-right [&>span]:text-right' : 'text-left'}
              >
                {label}
              </SelectItem>
            );
          })}
        </div>
      </SelectContent>
    </Select>
  );
}

export function AttendanceFilters({
  filters,
  onFiltersChange,
  onAddClick,
  onUploadClick,
}) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith('ar');

  const { data: departments = [] } = useAllDepartments();
  const { data: branches = [] } = useAllBranches();

  const { searchTerm, handleSearchChange, handleChange, handleReset } = useFilter(
    filters,
    onFiltersChange,
    'keyword'
  );

  const getDepartmentLabel = (department) => {
    if (isArabic) {
      return (
        department.name_ar ||
        department.title_ar ||
        department.name ||
        department.name_en ||
        department.title_en ||
        ''
      );
    }

    return (
      department.name_en ||
      department.title_en ||
      department.name ||
      department.name_ar ||
      department.title_ar ||
      ''
    );
  };

  const getBranchLabel = (branch) => {
    if (isArabic) {
      return (
        branch.name_ar ||
        branch.title_ar ||
        branch.name ||
        branch.name_en ||
        branch.title_en ||
        ''
      );
    }

    return (
      branch.name_en ||
      branch.title_en ||
      branch.name ||
      branch.name_ar ||
      branch.title_ar ||
      ''
    );
  };

  const setFilter = (key, val) => {
    const cleaned = val === 'all' ? '' : val;
    handleChange(key, cleaned);
  };

  const hasActiveFilters = Object.entries(filters).some(
    ([_k, v]) => v && v !== 'all' && v !== ''
  );

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex flex-1 flex-wrap items-center gap-4">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

          <Input
            placeholder={t('attendance.searchEmployee')}
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className={`
              ps-10
              ${isArabic ? 'text-right placeholder:text-right' : 'text-left placeholder:text-left'}
            `}
          />
        </div>

        <SearchableSelect
          value={filters.department || 'all'}
          onValueChange={(val) => setFilter('department', val)}
          options={departments}
          placeholder={t('filters.selectDepartment')}
          allOption={t('filters.allDepartments')}
          getLabel={getDepartmentLabel}
          getValue={(d) => d.name_en || d.name || d.name_ar || d.title_en || d.title_ar || ''}
        />

        <SearchableSelect
          value={filters.branch || 'all'}
          onValueChange={(val) => setFilter('branch', val)}
          options={branches}
          placeholder={t('filters.selectBranch')}
          allOption={t('filters.allBranches')}
          getLabel={getBranchLabel}
          getValue={(b) => b.name_en || b.name || b.name_ar || b.title_en || b.title_ar || ''}
        />

        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={handleReset}
            className="flex h-11 items-center gap-2 px-3 text-slate-500 hover:text-red-500"
          >
            <X className="size-4" />
            <span className="text-sm font-medium">
              {t('filters.clearFilters')}
            </span>
          </Button>
        )}
      </div>

      <div
        className={`
          flex justify-end gap-2
          ${isArabic ? 'sm:justify-start' : 'sm:justify-end'}
        `}
      >
        <Button
          className="gap-2"
          variant="outline"
          size="lg"
          onClick={onUploadClick}
        >
          <Upload className="size-4" />
          {t('attendance.uploadSheet')}
        </Button>

        <Button
          className="gap-2"
          variant="outline"
          size="lg"
          onClick={onAddClick}
        >
          <UserPlus2 className="size-4" />
          {t('attendance.addAttendance')}
        </Button>
      </div>
    </div>
  );
}