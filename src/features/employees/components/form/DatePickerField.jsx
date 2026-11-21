// DatePickerField.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';

function DatePickerField({ label, required, fieldName, register, watch, setValue, error }) {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const value = watch(fieldName);
  const selectedDate = value ? new Date(value) : null;

  const handleSelect = (date) => {
    const iso = date ? date.toISOString().slice(0, 10) : '';
    setValue(fieldName, iso, { shouldDirty: true, shouldValidate: true });
    if (date) setOpen(false);
  };

  const display = selectedDate
    ? selectedDate.toLocaleDateString('en-GB') // dd/mm/yy
    : '';

  return (
    <div className="space-y-1.5">
      <Label>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      {/* keep field registered in RHF */}
      <input type="hidden" {...register(fieldName)} />

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex h-9 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 text-left text-sm"
          >
            {display ? <span>{display}</span> : <span className="text-slate-400">{t('common.datePlaceholder')}</span>}
            <CalendarIcon className="ml-2 size-4 text-slate-400" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-2">
          <Calendar mode="single" selected={selectedDate ?? undefined} onSelect={handleSelect} />
        </PopoverContent>
      </Popover>

      {error && <p className="text-destructive text-xs">{error.message}</p>}
    </div>
  );
}

export default DatePickerField;
