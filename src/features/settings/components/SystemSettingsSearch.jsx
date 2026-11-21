import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function SystemSettingsSearch({ value, onChange }) {
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-xs shrink-0">
      <div className="relative">
        <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-gray">
          <Search className="h-4 w-4" />
        </span>
        <Input
          placeholder={t('settings.placeholders.searchSettings')}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="ps-9 text-start"
        />
      </div>
    </div>
  );
}
