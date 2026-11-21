import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function PageSizeSelect({
  value,
  onChange,
  options = [10, 20, 50, 100,500],
  className = '',
}) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <div className={cn('flex w-full', isRTL ? 'justify-start' : 'justify-end', className)}>
      <Select value={String(value)} onValueChange={(val) => onChange(Number(val))}>
        <SelectTrigger
          dir="ltr"
          className="h-10 w-[82px] justify-between rounded-xl border-slate-200 bg-white px-3 text-sm font-semibold shadow-sm"
        >
          <SelectValue />
        </SelectTrigger>

        <SelectContent align={isRTL ? 'start' : 'end'} className="min-w-[82px]">
          {options.map((option) => (
            <SelectItem key={option} value={String(option)}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
