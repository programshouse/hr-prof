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
import { useMemo, useState } from 'react';

import { useFilter } from '@/shared/hooks/useFilter';
import { useAllPositions } from '@/shared/hooks/useAllPositions';

function getOptionLabel(option, isRTL) {
  if (!option) return '';

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
}

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

  const filteredOptions = (options || []).filter((option) =>
    getOptionLabel(option, isRTL)
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
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
      value={value}
      onValueChange={onValueChange}
    >
      <SelectTrigger
        className={`h-11 min-w-[170px] border-gray-200 bg-white text-sm text-gray-500 shadow-sm ${
          isRTL ? 'text-right' : 'text-left'
        }`}
      >
        <div className={`w-full truncate ${isRTL ? 'text-right' : 'text-left'}`}>
          <SelectValue placeholder={placeholder} />
        </div>
      </SelectTrigger>

      <SelectContent
        dir={isRTL ? 'rtl' : 'ltr'}
        className={`max-h-60 ${isRTL ? 'text-right' : 'text-left'}`}
      >
        <div className="sticky top-0 z-10 border-b bg-white p-2">
          <div className="relative">
            <Search
              className={
                isRTL
                  ? 'absolute right-2 top-1/2 h-4 w-4 translate-x-1/2 -translate-y-1/2 text-gray-400'
                  : 'absolute left-2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 text-gray-400'
              }
            />

            <Input
              dir={isRTL ? 'rtl' : 'ltr'}
              placeholder={t('filters.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={
                isRTL
                  ? 'h-8 pr-8 pl-2 text-right text-sm placeholder:text-right'
                  : 'h-8 pl-8 text-left text-sm placeholder:text-left'
              }
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>

        <div className="max-h-48 overflow-y-auto">
          <SelectItem
            value="all"
            className={isRTL ? 'cursor-pointer text-right' : 'cursor-pointer text-left'}
          >
            {allOption || t('filters.all')}
          </SelectItem>

          {filteredOptions.map((option) => (
            <SelectItem
              key={option.id}
              value={String(option.id)}
              className={isRTL ? 'cursor-pointer text-right' : 'cursor-pointer text-left'}
            >
              {getOptionLabel(option, isRTL)}
            </SelectItem>
          ))}
        </div>
      </SelectContent>
    </Select>
  );
}

export default function ApplicantsFilters({ filters, onFiltersChange }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language?.startsWith('ar');

  const { searchTerm, handleSearchChange, handleChange, handleReset } = useFilter(
    filters,
    onFiltersChange,
    'keyword'
  );

  const { data: positionsRaw = [] } = useAllPositions();

  const positions = useMemo(() => {
    return (positionsRaw || []).map((p) => ({
      id: p.id,
      name_en: p.name_en ?? p.title_en ?? p.name ?? p.title,
      name_ar: p.name_ar ?? p.title_ar,
      name: p.name ?? p.title,
      title_en: p.title_en,
      title_ar: p.title_ar,
      title: p.title,
    }));
  }, [positionsRaw]);

  const hasAnyFilter = useMemo(() => {
    const s = String(searchTerm || '').trim();
    const pos = String(filters?.position_id ?? 'all');
    const status = String(filters?.status ?? 'all');

    return s.length > 0 || pos !== 'all' || status !== 'all';
  }, [searchTerm, filters?.position_id, filters?.status]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-[240px]">
        <Search
          className={
            isRTL
              ? 'pointer-events-none absolute right-3 top-1/2 size-4 translate-x-1/2 -translate-y-1/2 text-gray-400'
              : 'pointer-events-none absolute left-3 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 text-gray-400'
          }
        />

        <Input
          dir={isRTL ? 'rtl' : 'ltr'}
          placeholder={t('filters.search')}
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className={
            isRTL
              ? 'h-11 w-full rounded-md border-gray-200 bg-white pr-9 pl-3 text-right text-sm text-gray-700 shadow-sm placeholder:text-right'
              : 'h-11 w-full rounded-md border-gray-200 bg-white pr-3 pl-9 text-left text-sm text-gray-700 shadow-sm placeholder:text-left'
          }
        />
      </div>

      <div className="min-w-[170px]">
        <SearchableSelect
          value={
            filters?.position_id && filters.position_id !== 'all'
              ? String(filters.position_id)
              : 'all'
          }
          onValueChange={(val) => handleChange('position_id', val)}
          options={positions}
          placeholder={t('filters.selectPosition')}
          allOption={t('filters.allPositions')}
        />
      </div>

      <div className="min-w-[170px]">
        <Select
          dir={isRTL ? 'rtl' : 'ltr'}
          value={filters?.status ? String(filters.status) : 'all'}
          onValueChange={(val) => handleChange('status', val)}
        >
          <SelectTrigger
            className={`h-11 min-w-0 border-gray-200 bg-white text-sm text-gray-500 shadow-sm ${
              isRTL ? 'text-right' : 'text-left'
            }`}
          >
            <div className={`w-full truncate ${isRTL ? 'text-right' : 'text-left'}`}>
              <SelectValue placeholder={t('filters.selectStatus')} />
            </div>
          </SelectTrigger>

          <SelectContent
            dir={isRTL ? 'rtl' : 'ltr'}
            className={isRTL ? 'text-right' : 'text-left'}
          >
            <SelectItem
              value="all"
              className={isRTL ? 'cursor-pointer text-right' : 'cursor-pointer text-left'}
            >
              {t('filters.all')}
            </SelectItem>

            <SelectItem
              value="pending"
              className={isRTL ? 'cursor-pointer text-right' : 'cursor-pointer text-left'}
            >
              {t('applicants.pending')}
            </SelectItem>

            <SelectItem
              value="rejected"
              className={isRTL ? 'cursor-pointer text-right' : 'cursor-pointer text-left'}
            >
              {t('applicants.rejected')}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasAnyFilter && (
        <Button
          type="button"
          variant="ghost"
          onClick={handleReset}
          className={cn('h-11 gap-2 px-3 text-slate-400 hover:text-red-500')}
        >
          <X className="size-4" />
          <span className="text-sm font-medium">{t('filters.clear')}</span>
        </Button>
      )}
    </div>
  );
}