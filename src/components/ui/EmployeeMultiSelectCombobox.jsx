import { useEffect, useMemo, useState } from 'react';
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
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  resolveEmployeeDisplayName,
  formatEmployeeSelectLabel,
} from '@/lib/utils/employeeDisplayName';
import { useTranslation } from 'react-i18next';
import axiosClient from '@/services/http/axiosClient';

const getEmployeeId = (employee) =>
  employee?.employee_id ??
  employee?.id ??
  employee?.user_id ??
  employee?.employee?.employee_id ??
  employee?.employee?.id ??
  null;

export default function EmployeeMultiSelectCombobox({
  value = [],
  onChange,
  employees: employeesProp,
  loading: loadingProp = false,
  departmentId,
  departmentIds,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  loadingLabel,
  selectedLabel,
  clearAllLabel,
  disabled = false,
  excludeIds = [],
  formatSelectedLabel,
  searchQuery: controlledSearchQuery,
  onSearchQueryChange,
  open: controlledOpen,
  onOpenChange,
  selectedEmployeesClassName,
  hideRemoveButtons = false,
  hideClearAll = false,
}) {
  const { t, i18n } = useTranslation();
  const preferArabic = i18n.language?.startsWith('ar');

  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Employees loaded from GET /list
  const [allEmployees, setAllEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);

  const placeholderText =
    placeholder ?? t('common.selectEmployees');

  const searchPlaceholderText =
    searchPlaceholder ?? t('common.searchEmployees');

  const emptyMessageText =
    emptyMessage ?? t('common.noEmployeeFound');

  const loadingLabelText =
    loadingLabel ?? t('common.loading');

  const selectedLabelText =
    selectedLabel ?? t('common.selectedEmployees');

  const clearAllLabelText =
    clearAllLabel ?? t('common.clearAll');

  const popoverOpen = controlledOpen ?? open;
  const setPopoverOpen = onOpenChange ?? setOpen;

  const effectiveSearchQuery =
    controlledSearchQuery ?? searchQuery;

  const setEffectiveSearchQuery =
    onSearchQueryChange ?? setSearchQuery;

  const hasExternalEmployees =
    employeesProp !== undefined && employeesProp !== null;

  /*
   * IMPORTANT:
   * Always get the employee list from:
   * GET /list (or GET /list?department_id=... if filtered by department)
   */
  useEffect(() => {
    if (hasExternalEmployees) {
      return;
    }

    let cancelled = false;

      const loadEmployees = async () => {
        setEmployeesLoading(true);

        try {
          let loaded = [];
          const hasDeptIds =
            Array.isArray(departmentIds) &&
            departmentIds.length > 0 &&
            !departmentIds.includes('all');
          const hasSingleDept =
            departmentId && departmentId !== 'all';

          if (hasDeptIds) {
            if (departmentIds.length === 1) {
              const response = await axiosClient.get('/list', {
                params: { department_id: departmentIds[0] },
              });
              const list =
                response?.data?.employees ??
                response?.data?.data?.employees ??
                response?.data?.data ??
                [];
              loaded = Array.isArray(list) ? list : [];
            } else {
              const responses = await Promise.all(
                departmentIds.map((id) =>
                  axiosClient
                    .get('/list', {
                      params: { department_id: id },
                    })
                    .catch((error) => {
                      console.error(
                        `Failed to load employees for department ${id}:`,
                        error
                      );
                      return null;
                    })
                )
              );
              const map = new Map();
              responses.forEach((response) => {
                const list =
                  response?.data?.employees ??
                  response?.data?.data?.employees ??
                  response?.data?.data ??
                  [];
                if (Array.isArray(list)) {
                  list.forEach((emp) => {
                    const id = getEmployeeId(emp);
                    if (id != null && !map.has(String(id))) {
                      map.set(String(id), emp);
                    }
                  });
                }
              });
              loaded = Array.from(map.values());
            }
          } else if (hasSingleDept) {
            const response = await axiosClient.get('/list', {
              params: { department_id: departmentId },
            });
            const list =
              response?.data?.employees ??
              response?.data?.data?.employees ??
              response?.data?.data ??
              [];
            loaded = Array.isArray(list) ? list : [];
          } else {
            const response = await axiosClient.get('/list');
            const list =
              response?.data?.employees ??
              response?.data?.data?.employees ??
              response?.data?.data ??
              [];
            loaded = Array.isArray(list) ? list : [];
          }

          if (!cancelled) {
            setAllEmployees(loaded);
          }
        } catch (error) {
          console.error(
            'Failed to load employees from /list:',
            error
          );

          if (!cancelled) {
            setAllEmployees([]);
          }
        } finally {
          if (!cancelled) {
            setEmployeesLoading(false);
          }
        }
      };

      loadEmployees();

      return () => {
        cancelled = true;
      };
}, [
  hasExternalEmployees,
  departmentId,
  JSON.stringify(departmentIds),
]);

/*
 * Use the employees returned from /list (or the external employees prop if supplied).
 */
const employees = hasExternalEmployees
  ? Array.isArray(employeesProp)
    ? employeesProp
    : []
  : allEmployees;

const loading =
loadingProp ||
  (!hasExternalEmployees && employeesLoading);

const selectedEmployees = useMemo(() => {
  if (!value || value.length === 0) {
    return [];
  }

  return employees.filter((employee) =>
    value.includes(
      String(getEmployeeId(employee))
    )
  );
}, [employees, value]);

const filteredEmployees = useMemo(() => {
  const excludeSet = new Set(
    excludeIds.map(String)
  );

  return employees.filter((employee) => {
    const employeeId = getEmployeeId(employee);

    if (employeeId == null) {
      return false;
    }

    return !excludeSet.has(String(employeeId));
  });
}, [employees, excludeIds]);

const handleSelect = (employeeId) => {
  const empId = String(employeeId);

  const newValue = value.includes(empId)
    ? value.filter((id) => id !== empId)
    : [...value, empId];

  onChange(newValue);
};

const handleRemove = (employeeId) => {
  const newValue = value.filter(
    (id) => id !== String(employeeId)
  );

  onChange(newValue);
};

const handleClearAll = () => {
  onChange([]);
};

return (
  <div className="space-y-2">
    <Popover
      open={popoverOpen}
      onOpenChange={setPopoverOpen}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="input"
          disabled={disabled}
          className="h-11 w-full justify-between"
        >
          {selectedEmployees.length > 0 ? (
            formatSelectedLabel ? (
              formatSelectedLabel(
                selectedEmployees.length
              )
            ) : (
              t('common.selectedCount', {
                count: selectedEmployees.length,
              })
            )
          ) : loading ? (
            loadingLabelText
          ) : (
            placeholderText
          )}

          <ChevronsUpDown className="size-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command
          filter={(itemValue, search) => {
            const s = search
              .toLowerCase()
              .trim();

            if (!s) return 1;

            return itemValue
              .toLowerCase()
              .includes(s)
              ? 1
              : 0;
          }}
        >
          <CommandInput
            placeholder={searchPlaceholderText}
            value={effectiveSearchQuery}
            onValueChange={setEffectiveSearchQuery}
          />

          <CommandList>
            <CommandEmpty>
              {loading
                ? loadingLabelText
                : emptyMessageText}
            </CommandEmpty>

            <CommandGroup>
              {filteredEmployees.map((emp) => {
                const employeeId =
                  getEmployeeId(emp);

                if (employeeId == null) {
                  return null;
                }

                const empId =
                  String(employeeId);

                const displayLabel =
                  formatEmployeeSelectLabel(
                    emp,
                    { preferArabic }
                  );

                const isSelected =
                  value.includes(empId);

                const searchValue = [
                  getEmployeeId(emp),

                  resolveEmployeeDisplayName(
                    emp?.employee ?? emp,
                    {
                      preferArabic: true,
                    }
                  ),

                  resolveEmployeeDisplayName(
                    emp?.employee ?? emp,
                    {
                      preferArabic: false,
                    }
                  ),

                  emp.employee_name,
                  emp.full_name,
                  emp.name,
                  emp.employee_code,
                  emp.code,
                ]
                  .filter(Boolean)
                  .join('|');

                return (
                  <CommandItem
                    key={empId}
                    value={searchValue}
                    onSelect={() =>
                      handleSelect(empId)
                    }
                  >
                    <Check
                      className={cn(
                        'mr-2 size-4',
                        isSelected
                          ? 'opacity-100'
                          : 'opacity-0'
                      )}
                    />

                    <span className="truncate">
                      {displayLabel}
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>

    {/* Selected employees display */}
    {selectedEmployees.length > 0 && (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {selectedLabelText} (
            {selectedEmployees.length})
          </span>

          {!hideClearAll ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="h-auto p-1 text-xs"
            >
              {clearAllLabelText}
            </Button>
          ) : null}
        </div>

        <div
          className={cn(
            'flex flex-wrap gap-1',
            selectedEmployeesClassName
          )}
        >
          {selectedEmployees.map((emp) => {
            const employeeId =
              getEmployeeId(emp);

            return (
              <div
                key={String(employeeId)}
                className="flex items-center gap-1 rounded-sm bg-secondary px-2 py-1 text-xs"
              >
                <span>
                  {formatEmployeeSelectLabel(
                    emp,
                    { preferArabic }
                  )}
                </span>

                {!hideRemoveButtons ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleRemove(employeeId)
                    }
                    className="h-auto p-0 text-secondary-foreground hover:text-destructive"
                  >
                    <X className="size-3" />
                  </Button>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    )}
  </div>
);
}