import { Search, X, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ExportDialog from '@/components/ui/exportDialog.jsx';
import { SearchableSelect } from '@/components/ui/SearchableSelect.jsx';

import { useAllDepartments } from '@/shared/hooks/useAllDepartments';

export default function PayrollFilters({
  filters,
  onFiltersChange,
  onPdf,
  onExcel,
  onPrintTable,
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language?.startsWith('ar');

  const { data: departments = [], isLoading } = useAllDepartments();

  const paymentDays = Array.from({ length: 31 }, (_, i) => ({
    id: String(i + 1),
    label: String(i + 1),
  }));

  const getDepartmentLabel = (dep) => {
    if (isRTL) {
      return dep.name_ar || dep.title_ar || dep.name || dep.name_en || dep.title_en || '';
    }

    return dep.name_en || dep.title_en || dep.name || dep.name_ar || dep.title_ar || '';
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
              ? 'absolute top-1/2 right-3 size-4 -translate-y-1/2 text-slate-400'
              : 'absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400'
          }
        />

        <Input
          dir={isRTL ? 'rtl' : 'ltr'}
          value={filters.search || ''}
          placeholder={t('salaries.freelanceTasksPayroll.filters.search', 'Search')}
          onChange={(e) => updateFilter('search', e.target.value)}
          className={
            isRTL
              ? 'h-10 rounded-lg border-[#E6E8F0] pr-9 text-right text-sm'
              : 'h-10 rounded-lg border-[#E6E8F0] pl-9 text-left text-sm'
          }
        />
      </div>

      <div className="w-full">
        <SearchableSelect
          value={filters.payment_date || 'all'}
          onValueChange={(value) => updateFilter('payment_date', value)}
          options={paymentDays}
          placeholder={t('salaries.freelanceTasksPayroll.filters.paymentDate', 'Payment Date')}
          allOption={t('salaries.freelanceTasksPayroll.filters.paymentDate', 'Payment Date')}
          getOptionValue={(opt) => opt.id}
          getOptionLabel={(opt) => opt.label}
        />
      </div>

      <div className="w-full">
        <SearchableSelect
          value={filters.department_id || 'all'}
          onValueChange={(value) => updateFilter('department_id', value)}
          options={departments}
          placeholder={
            isLoading
              ? t('filters.loading', 'Loading...')
              : t('salaries.freelanceTasksPayroll.filters.department', 'Department')
          }
          allOption={t(
            'salaries.freelanceTasksPayroll.filters.allDepartments',
            'All Departments'
          )}
          getOptionValue={(dep) => dep.id}
          getOptionLabel={getDepartmentLabel}
          disabled={isLoading}
        />
      </div>

      {hasFilters ? (
        <Button
          variant="ghost"
          onClick={clearFilters}
          className="h-10 w-full px-3 text-slate-500 hover:text-red-500 xl:w-auto"
        >
          <X className="size-4" />
          <span className={`${isRTL ? 'mr-1' : 'ml-1'} text-sm`}>
            {t('salaries.freelanceTasksPayroll.filters.clear', 'Clear')}
          </span>
        </Button>
      ) : (
        <div className="hidden xl:block" />
      )}

      <div className="flex w-full justify-end sm:col-span-2 xl:col-span-1 xl:col-start-5">
        <ExportDialog
          trigger={
            <Button
              variant="outline"
              size="sm"
              className="text-primary h-10 w-full justify-center rounded-lg px-4 text-xs font-semibold shadow-sm sm:w-auto"
            >
              <Download className={isRTL ? 'ml-1.5 h-4 w-4' : 'mr-1.5 h-4 w-4'} />
              {t('salaries.freelanceTasksPayroll.filters.export', 'Export Salaries')}
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