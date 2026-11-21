import { useMemo, useState } from 'react';
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

const DEFAULT_SUGGESTIONS = [
  'updated asset',
  'Admin User',
  'Laptop',
  'Medicines update'
];

export default function TaskNameCombobox({
  value,
  onChange,
  placeholder = 'Enter task name...',
  searchPlaceholder = 'Search task name...',
  disabled = false,
  employees = [], // Employee data to extract names from
}) {
  const [open, setOpen] = useState(false);
  
  console.log('TaskNameCombobox - received value:', value);

  const suggestions = useMemo(() => {
    // Extract employee code-name combinations from the employee data
    const employeeCodeNames = employees
      .map(emp => {
        const code = emp.employee_code;
        const name = emp.employee_name || emp.full_name || emp.name;
        if (code && name && name.trim()) {
          return `${code} - ${name.trim()}`;
        }
        return null;
      })
      .filter(item => item !== null);
    
    // Combine employee code-names with default suggestions and remove duplicates
    const allSuggestions = [...new Set([...employeeCodeNames, ...DEFAULT_SUGGESTIONS])];
    return allSuggestions;
  }, [employees]);

  const filteredSuggestions = useMemo(() => {
    if (!value) return suggestions;
    
    const searchLower = value.toLowerCase();
    return suggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(searchLower)
    );
  }, [value, suggestions]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="input"
          disabled={disabled}
          className="h-11 w-full justify-between"
        >
          {value || placeholder}
          <ChevronsUpDown className="size-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>No task name found.</CommandEmpty>

            <CommandGroup>
              {filteredSuggestions.map((suggestion) => {
                const isSelected = suggestion === value;

                return (
                  <CommandItem
                    key={suggestion}
                    value={suggestion}
                    onSelect={() => {
                      onChange(suggestion);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn('mr-2 size-4', isSelected ? 'opacity-100' : 'opacity-0')}
                    />
                    <span className="truncate">{suggestion}</span>
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
