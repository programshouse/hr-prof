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

export default function ApplicantCombobox({
  value, // string applicant_id
  onChange, // (newValue: string) => void
  applicants = [],
  loading = false,
  placeholder = 'Select applicant...',
  searchPlaceholder = 'Search applicant...',
  disabled = false,
  excludeIds = [], // array of string ids to exclude
}) {
  const [open, setOpen] = useState(false);

  const selected = useMemo(() => {
    if (!value) return null;
    return applicants.find((a) => String(a.id) === String(value)) || null;
  }, [applicants, value]);

  const filteredApplicants = useMemo(() => {
    const excludeSet = new Set(excludeIds.map(String));
    return applicants.filter((a) => !excludeSet.has(String(a.id)));
  }, [applicants, excludeIds]);

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
            ? selected.label
            : loading
              ? 'Loading...'
              : placeholder}
          <ChevronsUpDown className="size-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command
          // important: allow searching by name
          filter={(itemValue, search) => {
            const s = search.toLowerCase().trim();
            if (!s) return 1;

            // itemValue we pass below as the applicant name
            return itemValue.toLowerCase().includes(s) ? 1 : 0;
          }}
        >
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>No applicant found.</CommandEmpty>

            <CommandGroup>
              {filteredApplicants.map((applicant) => {
                const applicantId = String(applicant.id);
                const isSelected = applicantId === String(value);

                return (
                  <CommandItem
                    key={applicantId}
                    // make it searchable by name
                    value={applicant.label}
                    onSelect={() => {
                      onChange(applicantId);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn('mr-2 size-4', isSelected ? 'opacity-100' : 'opacity-0')}
                    />
                    <span className="truncate">
                      {applicant.label}
                    </span>
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
