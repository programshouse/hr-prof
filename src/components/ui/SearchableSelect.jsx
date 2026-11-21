import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, Search } from 'lucide-react';
import { resolveEntityDisplayName } from '@/lib/utils/employeeDisplayName';

const buildDefaultOptionLabel =
  (preferArabic) => (option) =>
    option?.label ||
    resolveEntityDisplayName(option, { preferArabic }) ||
    option?.employee_name ||
    option?.full_name ||
    (option?.first_name && option?.last_name
      ? `${option.first_name} ${option.last_name}`
      : '') ||
    '—';

export function SearchableSelect({
  value,
  onValueChange,
  options = [],
  placeholder,
  allOption,
  disabled = false,
  getOptionValue = (option) => String(option.value ?? option.id ?? ''),
  getOptionLabel,
}) {
  const { t, i18n } = useTranslation();
  const preferArabic = i18n.language?.startsWith('ar');
  const resolveOptionLabel = getOptionLabel || buildDefaultOptionLabel(preferArabic);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const resolvedAllOption = allOption ?? t('common.all');

  const safeOptions = Array.isArray(options) ? options : [];

  const filteredOptions = safeOptions.filter((option) =>
    String(resolveOptionLabel(option))
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const selectedOption = safeOptions.find(
    (option) => String(getOptionValue(option)) === String(value)
  );

  const selectedLabel =
    value && value !== 'all' && selectedOption
      ? resolveOptionLabel(selectedOption)
      : undefined;

  const handleOpenChange = (open) => {
    setIsOpen(open);
    // Reset search term when dropdown closes
    if (!open) {
      setSearchTerm('');
    }
  };

  return (
    <Select
      key={i18n.language}
      dir={preferArabic ? 'rtl' : 'ltr'}
      open={isOpen}
      onOpenChange={handleOpenChange}
      value={value || 'all'}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger className="h-10 w-full rounded-lg border-slate-200 bg-white px-3 text-sm text-slate-600 shadow-sm">
        <div className="flex min-w-0 items-center gap-2">
          <Filter className="size-4 shrink-0 text-slate-400" />

          <SelectValue placeholder={placeholder}>
            {selectedLabel || placeholder}
          </SelectValue>
        </div>
      </SelectTrigger>

      <SelectContent className="max-h-72">
        <div className="sticky top-0 z-10 border-b bg-white p-2">
          <div className="relative">
            <Search className="absolute start-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <Input
              placeholder={t('filters.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 ps-8 text-sm"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
        </div>

        <div className="max-h-52 overflow-y-auto py-1">
          {resolvedAllOption && (
            <SelectItem
              key="all-option"
              value="all"
              className="py-2 ps-8 pe-2 text-sm"
            >
              {resolvedAllOption}
            </SelectItem>
          )}

          {filteredOptions.map((option, index) => {
            const itemValue = String(getOptionValue(option) || `option-${index}`);
            const displayName = resolveOptionLabel(option);

            return (
              <SelectItem
                key={`${itemValue}-${index}`}
                value={itemValue}
                className="py-2 ps-8 pe-2 text-sm data-highlighted:bg-slate-100 focus:bg-slate-100"
              >
                {displayName}
              </SelectItem>
            );
          })}
        </div>
      </SelectContent>
    </Select>
  );
}
