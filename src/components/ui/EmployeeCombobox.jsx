import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  formatEmployeeSelectLabel,
  resolveEmployeeDisplayName,
} from '@/lib/utils/employeeDisplayName';

const getEmployeeCode = (emp) =>
  emp?.employee_code || emp?.code || emp?.employee_id || emp?.id || '';

export default function EmployeeCombobox({
  value, // string employee_id
  onChange, // (newValue: string) => void
  employees = [],
  loading = false,
  placeholder = 'Select employee...',
  searchPlaceholder = 'Search employee...',
  disabled = false,
  excludeIds = [], // array of string ids to exclude
}) {
  const { t, i18n } = useTranslation();
  const preferArabic = i18n.language?.startsWith('ar');
  const [open, setOpen] = useState(false);

  const selected = useMemo(() => {
    if (!value) return null;
    return employees.find((e) => String(e.employee_id) === String(value)) || null;
  }, [employees, value]);

  const filteredEmployees = useMemo(() => {
    const excludeSet = new Set(excludeIds.map(String));
    return employees.filter((e) => !excludeSet.has(String(e.employee_id)));
  }, [employees, excludeIds]);

  const formatEmployeeOption = (emp) =>
    formatEmployeeSelectLabel(emp, { preferArabic });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="input"
          disabled={disabled}
          className="h-11 w-full justify-between"
        >
          {selected
            ? formatEmployeeOption(selected)
            : loading
              ? t('common.loading', 'Loading...')
              : placeholder}
          <ChevronsUpDown className="size-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command
          filter={(itemValue, search) => {
            const s = search.toLowerCase().trim();
            if (!s) return 1;
            return itemValue.toLowerCase().includes(s) ? 1 : 0;
          }}
        >
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{t('common.noResults', 'No employee found.')}</CommandEmpty>

            <CommandGroup>
              {filteredEmployees.map((emp) => {
                const empId = String(emp.employee_id);
                const isSelected = empId === String(value);
                const displayLabel = formatEmployeeOption(emp);
                const searchValue = [
                  getEmployeeCode(emp),
                  resolveEmployeeDisplayName(emp, { preferArabic: true }),
                  resolveEmployeeDisplayName(emp, { preferArabic: false }),
                  emp.employee_name,
                  emp.full_name,
                  emp.name,
                ]
                  .filter(Boolean)
                  .join('|');

                return (
                  <CommandItem
                    key={empId}
                    value={searchValue}
                    onSelect={() => {
                      onChange(empId);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn('mr-2 size-4', isSelected ? 'opacity-100' : 'opacity-0')}
                    />
                    <span className="truncate">{displayLabel}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
