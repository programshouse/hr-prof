import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SearchableSelect } from '@/components/ui/SearchableSelect.jsx';

import { useAllDepartments } from '@/shared/hooks/useAllDepartments';
import { useAllBranches } from '@/shared/hooks/useAllBranches';

export default function SalaryOvertimeSummaryFilters({
  filters,
  onFiltersChange,
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language?.startsWith('ar');

  const { data: departments = [] } = useAllDepartments();
  const { data: branches = [] } = useAllBranches();

  const getDepartmentLabel = (department) => {
    if (isRTL) {
      return (
        department?.name_ar ||
        department?.title_ar ||
        department?.name ||
        department?.name_en ||
        department?.title_en ||
        ''
      );
    }

    return (
      department?.name_en ||
      department?.title_en ||
      department?.name ||
      department?.name_ar ||
      department?.title_ar ||
      ''
    );
  };

  const getBranchLabel = (branch) => {
    if (isRTL) {
      return (
        branch?.name_ar ||
        branch?.title_ar ||
        branch?.name ||
        branch?.name_en ||
        branch?.title_en ||
        ''
      );
    }

    return (
      branch?.name_en ||
      branch?.title_en ||
      branch?.name ||
      branch?.name_ar ||
      branch?.title_ar ||
      ''
    );
  };

  const updateFilter = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value === 'all' ? '' : value,
    });
  };

  const reset = () => {
    onFiltersChange({
      keyword: '',
      department: '',
      branch: '',
    });
  };

  const hasFilter =
    !!filters.keyword ||
    !!filters.department ||
    !!filters.branch;

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="
        grid w-full grid-cols-1 gap-3
        sm:grid-cols-2
        xl:grid-cols-[300px_220px_220px_auto]
        xl:items-center
      "
    >
      {/* Search employee */}
      <div className="relative w-full">
        <Search
          className={
            isRTL
              ? 'pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-slate-400'
              : 'pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400'
          }
        />

        <Input
          dir={isRTL ? 'rtl' : 'ltr'}
          value={filters.keyword || ''}
          onChange={(event) =>
            updateFilter('keyword', event.target.value)
          }
          placeholder={t('overtime.filters.searchEmployee', {
            defaultValue: 'Search employee',
          })}
          className={
            isRTL
              ? 'h-10 rounded-lg border-slate-200 pr-9 text-right text-sm placeholder:text-right'
              : 'h-10 rounded-lg border-slate-200 pl-9 text-left text-sm placeholder:text-left'
          }
        />
      </div>

      {/* Department dropdown */}
      <div className="w-full">
        <SearchableSelect
          value={filters.department || 'all'}
          onValueChange={(value) =>
            updateFilter('department', value)
          }
          options={departments}
          placeholder={t('filters.department', {
            defaultValue: 'Department',
          })}
          allOption={t('filters.allDepartments', {
            defaultValue: 'All Departments',
          })}
          getOptionValue={(department) =>
            getDepartmentLabel(department)
          }
          getOptionLabel={getDepartmentLabel}
        />
      </div>

      {/* Branch dropdown */}
      <div className="w-full">
        <SearchableSelect
          value={filters.branch || 'all'}
          onValueChange={(value) =>
            updateFilter('branch', value)
          }
          options={branches}
          placeholder={t('filters.branch', {
            defaultValue: 'Branch',
          })}
          allOption={t('filters.allBranches', {
            defaultValue: 'All Branches',
          })}
          getOptionValue={(branch) =>
            getBranchLabel(branch)
          }
          getOptionLabel={getBranchLabel}
        />
      </div>

      {/* Clear */}
      {hasFilter ? (
        <Button
          variant="ghost"
          type="button"
          onClick={reset}
          className="h-10 w-full px-3 text-slate-500 hover:text-red-500 xl:w-auto"
        >
          <X className="size-4" />

          <span
            className={`text-sm font-medium ${
              isRTL ? 'mr-1' : 'ml-1'
            }`}
          >
            {t('filters.clear', {
              defaultValue: 'Clear',
            })}
          </span>
        </Button>
      ) : (
        <div className="hidden xl:block" />
      )}
    </div>
  );
}