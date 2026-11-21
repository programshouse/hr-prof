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
import { Search, X } from 'lucide-react';
import { useState } from 'react';
import {
  useAllBranches,
  useAllDepartments,
  useAllShifts,
  useAllPositions,
} from '@/shared/hooks';
import { useFilter } from '@/shared/hooks/useFilter';
import SalariesHeaderActions from './SalariesHeaderActions';

function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder,
  allOption,
}) {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const isRTL = i18n.language?.startsWith('ar');

  const getOptionLabel = (option) => {
    if (isRTL) {
      return (
        option?.name_ar ||
        option?.title_ar ||
        option?.title ||
        option?.name ||
        option?.name_en ||
        option?.title_en ||
        ''
      );
    }

    return (
      option?.name_en ||
      option?.title_en ||
      option?.title ||
      option?.name ||
      option?.name_ar ||
      option?.title_ar ||
      ''
    );
  };

  const filteredOptions = (options || []).filter((option) =>
    getOptionLabel(option).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (!open) setSearchTerm('');
  };

  return (
    <Select
      dir={isRTL ? 'rtl' : 'ltr'}
      open={isOpen}
      onOpenChange={handleOpenChange}
      value={value || 'all'}
      onValueChange={onValueChange}
    >
      <SelectTrigger
        className={`h-10 w-full border-slate-200 bg-white text-sm text-slate-600 shadow-sm ${
          isRTL ? 'text-right' : 'text-left'
        }`}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent dir={isRTL ? 'rtl' : 'ltr'} className="max-h-60">
        <div className="sticky top-0 z-10 border-b bg-white p-2">
          <div className="relative">
            <Search
              className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 ${
                isRTL ? 'right-2' : 'left-2'
              }`}
            />

            <Input
              dir={isRTL ? 'rtl' : 'ltr'}
              placeholder={t('salaries.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`h-8 text-sm ${
                isRTL
                  ? 'pr-8 pl-2 text-right placeholder:text-right'
                  : 'pl-8 pr-2 text-left placeholder:text-left'
              }`}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>

        <div className="max-h-48 overflow-y-auto">
          <SelectItem className={isRTL ? 'text-right' : 'text-left'} value="all">
            {allOption || t('salaries.all')}
          </SelectItem>

          {filteredOptions.map((option) => (
            <SelectItem
              key={option.id}
              value={String(option.id)}
              className={isRTL ? 'text-right' : 'text-left'}
            >
              {getOptionLabel(option)}
            </SelectItem>
          ))}
        </div>
      </SelectContent>
    </Select>
  );
}

export default function SalariesFilters({
  filters,
  onFiltersChange,
  table,
  showSelection,
  onEnableSelection,
  hideColumns,
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language?.startsWith('ar');

  const { data: branches = [] } = useAllBranches();
  const { data: companies = [] } = useAllDepartments();
  const { data: shifts = [] } = useAllShifts();
  const { data: positions = [] } = useAllPositions();

  const { searchTerm, handleSearchChange, handleChange, handleReset } = useFilter(
    filters,
    onFiltersChange,
    'search'
  );

  const hasAnyFilter =
    filters.search ||
    filters.shift_id ||
    filters.position_id ||
    filters.department_id ||
    filters.branch_id;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 xl:grid-cols-[1fr_auto] xl:items-center">
        <div className="w-full">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 xl:flex xl:flex-wrap xl:items-center xl:gap-3">
            <div className="relative w-full xl:w-[320px] 2xl:w-[340px]">
              <Search
                className={`pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 ${
                  isRTL ? 'right-3' : 'left-3'
                }`}
              />

              <Input
                dir={isRTL ? 'rtl' : 'ltr'}
                placeholder={t('salaries.searchSalaries')}
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className={`h-10 w-full rounded-md border-slate-200 text-sm text-slate-700 ${
                  isRTL
                    ? 'pr-10 pl-3 text-right placeholder:text-right'
                    : 'pl-10 pr-3 text-left placeholder:text-left'
                }`}
              />
            </div>

            <div className="w-full xl:w-[150px]">
              <SearchableSelect
                value={filters.shift_id}
                onValueChange={(val) => handleChange('shift_id', val)}
                options={shifts}
                placeholder={t('salaries.type')}
                allOption={t('salaries.allShifts')}
              />
            </div>

            <div className="w-full xl:w-[170px]">
              <SearchableSelect
                value={filters.position_id}
                onValueChange={(val) => handleChange('position_id', val)}
                options={positions}
                placeholder={t('salaries.position')}
                allOption={t('salaries.allPositions')}
              />
            </div>

            <div className="w-full xl:w-[170px]">
              <SearchableSelect
                value={filters.department_id}
                onValueChange={(val) => handleChange('department_id', val)}
                options={companies}
                placeholder={t('salaries.company')}
                allOption={t('salaries.allCompanies')}
              />
            </div>

            <div className="w-full xl:w-[170px]">
              <SearchableSelect
                value={filters.branch_id}
                onValueChange={(val) => handleChange('branch_id', val)}
                options={branches}
                placeholder={t('salaries.branch')}
                allOption={t('salaries.allBranches')}
              />
            </div>

            {hasAnyFilter && (
              <div className="w-full xl:w-auto">
                <Button
                  variant="ghost"
                  onClick={handleReset}
                  className="h-10 w-full justify-center px-3 text-slate-500 hover:text-red-500 xl:w-auto"
                >
                  <X className="size-4" />
                  <span className={isRTL ? 'mr-1 text-sm font-medium' : 'ml-1 text-sm font-medium'}>
                    {t('salaries.clear')}
                  </span>
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex w-full justify-end xl:w-auto">
          <SalariesHeaderActions
            table={table}
            showSelection={showSelection}
            onEnableSelection={onEnableSelection}
            hideColumns={hideColumns}
          />
        </div>
      </div>
    </div>
  );
}