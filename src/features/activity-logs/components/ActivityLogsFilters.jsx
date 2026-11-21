import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/DatePicker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminsQuery } from '@/features/permissions/hooks/useAdminsQuery';

function formatDateForApi(date) {
  if (!date) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function parseDateValue(value) {
  if (!value) return undefined;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export default function ActivityLogsFilters({ filters, onFiltersChange }) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith('ar');

  const [adminSearch, setAdminSearch] = useState('');
  const { data: admins = [] } = useAdminsQuery();

  const filteredAdmins = useMemo(() => {
    const q = adminSearch.trim().toLowerCase();
    if (!q) return admins;

    return admins.filter((admin) => {
      const name = String(admin?.name || '').toLowerCase();
      const email = String(admin?.email || '').toLowerCase();

      return (
        name.includes(q) ||
        email.includes(q) ||
        String(admin?.id || '').includes(q)
      );
    });
  }, [admins, adminSearch]);

  const selectedAdmin = useMemo(() => {
    if (!filters.admin_id) return null;

    return (
      admins.find((admin) => String(admin.id) === String(filters.admin_id)) ||
      null
    );
  }, [admins, filters.admin_id]);

  const setFilter = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value === 'all' ? '' : value,
    });
  };

  const handleReset = () => {
    setAdminSearch('');
    onFiltersChange({
      admin_id: '',
      date: '',
    });
  };

  const hasAnyFilter = Boolean(filters.admin_id || filters.date);

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="flex flex-wrap items-center gap-3"
    >
      <div className="min-w-[220px] flex-1">
        <Select
          dir={isArabic ? 'rtl' : 'ltr'}
          value={filters.admin_id ? String(filters.admin_id) : 'all'}
          onValueChange={(value) => setFilter('admin_id', value)}
        >
          <SelectTrigger
            className={`
              h-10 w-full border-gray-200 bg-white text-sm text-gray-500 shadow-sm
              ${isArabic ? 'text-right [&>span]:text-right' : 'text-left [&>span]:text-left'}
            `}
          >
            <SelectValue placeholder={t('activityLogs.searchAdmin')}>
              {selectedAdmin?.name || t('activityLogs.searchAdmin')}
            </SelectValue>
          </SelectTrigger>

          <SelectContent
            dir={isArabic ? 'rtl' : 'ltr'}
            className="max-h-72"
          >
            <div className="sticky top-0 z-10 border-b bg-white p-2">
              <div className="relative">
                <Search className="absolute start-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                <Input
                  placeholder={t('activityLogs.searchAdminPlaceholder')}
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  className={`
                    h-8 ps-7 text-sm
                    ${isArabic ? 'text-right placeholder:text-right' : 'text-left placeholder:text-left'}
                  `}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            <SelectItem
              value="all"
              className={isArabic ? 'text-right [&>span]:text-right' : 'text-left'}
            >
              {t('activityLogs.allAdmins')}
            </SelectItem>

            {filteredAdmins.map((admin) => (
              <SelectItem
                key={admin.id}
                value={String(admin.id)}
                className={isArabic ? 'text-right [&>span]:text-right' : 'text-left'}
              >
                {admin.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div
        className={`
          min-w-[180px]
          ${isArabic ? '[&_input]:text-right [&_input::placeholder]:text-right' : '[&_input]:text-left'}
        `}
      >
        <DatePicker
          placeholder={t('activityLogs.date')}
          value={parseDateValue(filters.date)}
          onChange={(date) =>
            onFiltersChange({
              ...filters,
              date: formatDateForApi(date),
            })
          }
          className="h-10"
        />
      </div>

      {hasAnyFilter && (
        <Button
          variant="ghost"
          onClick={handleReset}
          className="h-10 shrink-0 gap-1 text-slate-400 hover:text-red-500"
        >
          <X className="size-4" />
          <span>{t('activityLogs.clear')}</span>
        </Button>
      )}
    </div>
  );
}