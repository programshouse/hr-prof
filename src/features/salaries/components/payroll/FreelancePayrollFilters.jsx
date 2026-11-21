import { Search, X, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ExportDialog from '@/components/ui/exportDialog.jsx';
import { SearchableSelect } from '@/components/ui/SearchableSelect.jsx';

import { useAllDepartments } from '@/shared/hooks/useAllDepartments';

export default function FreelancePayrollFilters({
  filters,
  onFiltersChange,
  onPdf,
  onExcel,
  onPrintTable,
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language?.startsWith('ar');

  const { data: departments = [] } = useAllDepartments();

  const paymentDays = Array.from({ length: 31 }, (_, index) => ({
    id: String(index + 1),
    label: String(index + 1),
  }));

  const getDepartmentLabel = (department) => {
    if (isRTL) {
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

  const updateFilter = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value === 'all' ? '' : value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      payment_date: '',
      department_id: '',
    });
  };

  const hasFilters = !!filters.search || !!filters.payment_date || !!filters.department_id;

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[230px_220px_220px_auto_1fr] xl:items-center"
    >
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
          value={filters.search || ''}
          placeholder={t('filters.search', 'Search')}
          onChange={(e) => updateFilter('search', e.target.value)}
          className={
            isRTL
              ? 'h-10 rounded-lg border-slate-200 pr-9 text-right text-sm placeholder:text-right'
              : 'h-10 rounded-lg border-slate-200 pl-9 text-left text-sm placeholder:text-left'
          }
        />
      </div>

      <div className="w-full">
        <SearchableSelect
          value={filters.payment_date || 'all'}
          onValueChange={(value) => updateFilter('payment_date', value)}
          options={paymentDays}
          placeholder={t('filters.paymentDate', 'Payment Date')}
          allOption={t('filters.paymentDate', 'Payment Date')}
          getOptionValue={(option) => option.id}
          getOptionLabel={(option) => option.label}
        />
      </div>

      <div className="w-full">
        <SearchableSelect
          value={filters.department_id || 'all'}
          onValueChange={(value) => updateFilter('department_id', value)}
          options={departments}
          placeholder={t('filters.department', 'Department')}
          allOption={t('filters.allDepartments', 'All Departments')}
          getOptionValue={(department) => department.id}
          getOptionLabel={getDepartmentLabel}
        />
      </div>

      {hasFilters ? (
        <Button
          variant="ghost"
          onClick={clearFilters}
          className="h-10 w-full px-3 text-slate-500 hover:text-red-500 xl:w-auto"
        >
          <X className="size-4" />
          <span className={`${isRTL ? 'mr-1' : 'ml-1'} text-sm font-medium`}>
            {t('filters.clear', 'Clear')}
          </span>
        </Button>
      ) : (
        <div className="hidden xl:block" />
      )}

      <div className="flex w-full justify-end sm:col-span-2 xl:col-span-1 xl:col-start-5 xl:w-auto">
        <ExportDialog
          trigger={
            <Button
              variant="outline"
              size="sm"
              className="text-primary h-10 w-full justify-center rounded-lg px-4 text-xs font-semibold shadow-sm sm:w-auto"
            >
              <Download className={isRTL ? 'ml-1.5 h-4 w-4' : 'mr-1.5 h-4 w-4'} />
              {t('salaries.freelancePayroll.buttons.export', 'Export Salaries')}
            </Button>
          }
          onPdf={onPdf}
          onExcel={onExcel}
          onPrintTable={onPrintTable}
        />
      </div>
    </div>
  );
}