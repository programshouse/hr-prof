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
import { Search, X, Plus } from 'lucide-react';
import { useState } from 'react';
import {
  useAllBranches,
  useAllDepartments,
  useAllShifts,
} from '@/shared/hooks';

// Searchable Select Component
function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder,
  allOption,
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language?.startsWith('ar');

  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const getOptionLabel = (option) => {
    if (isRTL) {
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
        className={`
          h-10 w-full border-slate-200 bg-white text-sm text-slate-600 shadow-sm
          ${isRTL ? 'text-right [&>span]:text-right' : 'text-left [&>span]:text-left'}
        `}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent dir={isRTL ? 'rtl' : 'ltr'} className="max-h-60">
        <div className="sticky top-0 z-10 border-b bg-white p-2">
          <div className="relative">
            <Search className="absolute start-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <Input
              placeholder={t('filters.salaries.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`
                h-8 ps-8 text-sm
                ${isRTL ? 'text-right placeholder:text-right' : 'text-left placeholder:text-left'}
              `}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>

        <div className="max-h-48 overflow-y-auto">
          <SelectItem
            value="all"
            className={isRTL ? 'text-right [&>span]:text-right' : 'text-left'}
          >
            {allOption || t('filters.all')}
          </SelectItem>

          {filteredOptions.map((option) => (
            <SelectItem
              key={option.id}
              value={String(option.id)}
              className={isRTL ? 'text-right [&>span]:text-right' : 'text-left'}
            >
              {getOptionLabel(option)}
            </SelectItem>
          ))}
        </div>
      </SelectContent>
    </Select>
  );
}

export default function SalaryUpdatesFilters({
  filters,
  onFiltersChange,
  onAddNew,
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language?.startsWith('ar');

  const { data: branches = [] } = useAllBranches();
  const { data: companies = [] } = useAllDepartments();
  const { data: shifts = [] } = useAllShifts();

  const handleChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value === 'all' ? '' : value,
    });
  };

  const handleReset = () => {
    onFiltersChange({
      search: '',
      company_id: '',
      branch_id: '',
      shift_id: '',
    });
  };

  const hasAnyFilter =
    filters.search ||
    filters.shift_id ||
    filters.company_id ||
    filters.branch_id;

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Filters block */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Employee Search */}
          <div className="w-full md:w-80">
            <div className="relative">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <Input
                placeholder={t('filters.salaries.searchEmployees')}
                value={filters.search || ''}
                onChange={(e) => handleChange('search', e.target.value)}
                className={`
                  h-10 w-full border-slate-200 bg-white ps-10 pe-3 text-sm text-slate-600 shadow-sm
                  ${isRTL ? 'text-right placeholder:text-right' : 'text-left placeholder:text-left'}
                `}
              />
            </div>
          </div>

          {/* Company */}
          <div className="w-full md:w-40">
            <SearchableSelect
              value={filters.company_id || 'all'}
              onValueChange={(val) => handleChange('company_id', val)}
              options={companies}
              placeholder={t('filters.company')}
              allOption={t('filters.all')}
            />
          </div>

          {/* Branch */}
          <div className="w-full md:w-40">
            <SearchableSelect
              value={filters.branch_id || 'all'}
              onValueChange={(val) => handleChange('branch_id', val)}
              options={branches}
              placeholder={t('filters.branch')}
              allOption={t('filters.all')}
            />
          </div>

          {/* Shift */}
          <div className="w-full md:w-40">
            <SearchableSelect
              value={filters.shift_id || 'all'}
              onValueChange={(val) => handleChange('shift_id', val)}
              options={shifts}
              placeholder={t('filters.shift')}
              allOption={t('filters.all')}
            />
          </div>

          {/* Clear button */}
          {hasAnyFilter && (
            <Button
              variant="ghost"
              onClick={handleReset}
              className="h-10 gap-1 px-3 text-slate-500 hover:text-red-500"
            >
              <X className="size-4" />

              <span className="text-sm font-medium">
                {t('salaries.clear')}
              </span>
            </Button>
          )}
        </div>

        {/* Actions */}
        <Button onClick={onAddNew} className="gap-2">
          <Plus className="h-4 w-4" />
          {t('salaries.addNewSalaryUpdate')}
        </Button>
      </div>
    </div>
  );
}