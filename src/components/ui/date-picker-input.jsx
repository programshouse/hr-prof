// src/components/ui/date-picker-input.jsx
'use client';

import * as React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useTranslation } from 'react-i18next';

const pad2 = (n) => String(n).padStart(2, '0');

const isoToDisplay = (iso) => {
  if (!iso) return '';
  const [y, m, d] = String(iso).split('-').map(Number);
  if (!y || !m || !d) return '';
  return `${d}/${m}/${y}`;
};

const displayToIso = (display) => {
  const raw = String(display || '').trim();
  if (!raw) return '';

  const match = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;

  const dd = Number(match[1]);
  const mm = Number(match[2]);
  const yyyy = Number(match[3]);

  if (dd < 1 || dd > 31) return null;
  if (mm < 1 || mm > 12) return null;
  if (yyyy < 1000) return null;

  return `${yyyy}-${pad2(mm)}-${pad2(dd)}`;
};

export default function DatePickerInput({
  value, // ISO: YYYY-MM-DD
  onChange, // (isoString) => void
  placeholder,
  className,
  inputClassName,
  buttonClassName,
  disabled,
}) {
  const { t } = useTranslation();
  const resolvedPlaceholder = placeholder ?? t('common.datePlaceholder');

  const [open, setOpen] = React.useState(false);
  const [text, setText] = React.useState(() => isoToDisplay(value));

  React.useEffect(() => {
    setText(isoToDisplay(value));
  }, [value]);

  const selectedDate = React.useMemo(() => {
    if (!value) return undefined;
    const [y, m, d] = String(value).split('-').map(Number);
    if (!y || !m || !d) return undefined;
    return new Date(y, m - 1, d);
  }, [value]);

  const handleChange = (e) => {
    const val = e.target.value;

    // Allow only digits and '/' with the correct partial date format
    const partialDateRegex = /^\d{0,2}(\/\d{0,2}(\/\d{0,4})?)?$/;

    if (!partialDateRegex.test(val)) return;

    setText(val);

    const iso = displayToIso(val);
    if (iso === '') onChange?.('');
    else if (iso) onChange?.(iso);
  };

  const handleBlur = () => {
    const iso = displayToIso(text);
    if (iso === null) {
      setText(isoToDisplay(value));
      return;
    }
    if (iso) setText(isoToDisplay(iso));
  };

  return (
    <div className={cn('flex gap-2', className)}>
      <Input
        value={text}
        disabled={disabled}
        placeholder={resolvedPlaceholder || '31/6/2026'}
        className={cn('h-9 text-sm', inputClassName)}
        inputMode="numeric"
        maxLength={10}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          const allowedKeys = [
            'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight',
            'ArrowUp', 'ArrowDown', 'Tab', 'Home', 'End'
          ];
          if (allowedKeys.includes(e.key)) return;

          if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) return;

          // only digits and '/'
          if (!/^\d$/.test(e.key) && e.key !== '/') e.preventDefault();
        }}
        onPaste={(e) => {
          const pastedText = e.clipboardData.getData('text');
          const nextValue =
            text.slice(0, e.currentTarget.selectionStart) +
            pastedText +
            text.slice(e.currentTarget.selectionEnd);

          const partialDateRegex = /^\d{0,2}(\/\d{0,2}(\/\d{0,4})?)?$/;
          if (!partialDateRegex.test(nextValue)) e.preventDefault();
        }}
      />

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="input"
            disabled={disabled}
            className={cn('h-9 px-3', buttonClassName)}
          >
            <CalendarIcon className="size-4" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-2" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (!date) {
                onChange?.('');
                setText('');
                return;
              }
              const iso = `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
              onChange?.(iso);
              setText(isoToDisplay(iso));
              setOpen(false);
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}