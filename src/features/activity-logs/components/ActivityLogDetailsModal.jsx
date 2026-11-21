import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CalendarDays,
  Clock,
  FileText,
  Monitor,
  User,
  X,
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

function UserAvatar({ name = '—' }) {
  const safeName = String(name || '—');

  const initials = safeName
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');

  return (
    <div className="flex size-10 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-700">
      {initials || 'NA'}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <Icon className="mt-0.5 size-4 shrink-0 text-gray-500" />

      <div className="min-w-0">
        <span className="text-gray-500">{label} : </span>
        <span className="font-semibold text-gray-900">{value || '—'}</span>
      </div>
    </div>
  );
}

function ChangeItem({ label, oldValue, newValue }) {
  const hasOldValue =
    oldValue !== undefined &&
    oldValue !== null &&
    oldValue !== '';

  const hasNewValue =
    newValue !== undefined &&
    newValue !== null &&
    newValue !== '';

  return (
    <div className="rounded-lg border bg-white p-3">
      <p className="mb-2 text-sm font-semibold text-gray-900">{label}</p>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        {hasOldValue ? (
          <span className="rounded-md bg-red-50 px-2 py-1 text-red-700">
            {String(oldValue)}
          </span>
        ) : null}

        {hasOldValue && hasNewValue ? (
          <span className="text-gray-400">→</span>
        ) : null}

        {hasNewValue ? (
          <span className="rounded-md bg-green-50 px-2 py-1 text-green-700">
            {String(newValue)}
          </span>
        ) : null}

        {!hasOldValue && !hasNewValue ? (
          <span className="text-gray-400">—</span>
        ) : null}
      </div>
    </div>
  );
}

const hiddenKeys = [
  'employee',
  'applicant',
  'id',
  'company_id',
  'created_at',
  'updated_at',
  'deleted_at',
];

const formatKey = (key) =>
  String(key || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const normalizeValue = (value) => {
  if (value === true) return 'Yes';
  if (value === false) return 'No';

  if (Array.isArray(value)) {
    if (!value.length) return '—';
    return JSON.stringify(value);
  }

  if (value && typeof value === 'object') {
    return JSON.stringify(value);
  }

  return value;
};

export default function ActivityLogDetailsModal({
  open,
  onOpenChange,
  log = null,
}) {
  const { t, i18n } = useTranslation();

  const isArabic = i18n.language === 'ar';
  const dir = isArabic ? 'rtl' : 'ltr';

  const locale = isArabic ? 'ar-EG' : 'en-US';

  const createdAt = log?.created_at || log?.created_at_formatted;

  const formatDate = (dateString) => {
    if (!dateString) return '—';

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return log?.created_at_formatted || '—';
    }

    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const formatTime = (dateString) => {
    if (!dateString) return '—';

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return '—';
    }

    return new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  const actionLabel = useMemo(() => {
    const rawAction = String(log?.action || '');

    const actionKey = rawAction
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/-/g, '_');

    return t(`activityLogs.actions.${actionKey}`, {
      defaultValue: rawAction || '—',
    });
  }, [log?.action, t]);

  const adminName = log?.hr?.name || '—';
  const adminRole = log?.hr?.email || t('activityLogs.modal.admin');

  const targetEmployee =
    log?.new_values?.employee?.full_name ||
    log?.old_values?.employee?.full_name ||
    log?.new_values?.applicant?.full_name ||
    log?.old_values?.applicant?.full_name ||
    '—';

  const changes = useMemo(() => {
    const oldValues = log?.old_values || {};
    const newValues = log?.new_values || {};

    const oldObj =
      oldValues && !Array.isArray(oldValues) && typeof oldValues === 'object'
        ? oldValues
        : {};

    const newObj =
      newValues && !Array.isArray(newValues) && typeof newValues === 'object'
        ? newValues
        : {};

    const keys = Array.from(
      new Set([...Object.keys(oldObj), ...Object.keys(newObj)])
    ).filter((key) => !hiddenKeys.includes(key));

    return keys.map((key) => ({
      key,
      label: t(`activityLogs.fields.${key}`, {
        defaultValue: formatKey(key),
      }),
      oldValue: normalizeValue(oldObj[key]),
      newValue: normalizeValue(newObj[key]),
    }));
  }, [log, t]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir={dir}
        className={`
          max-w-xl p-0
          ${isArabic ? 'text-right [&>button]:hidden' : 'text-left [&>button]:hidden'}
        `}
      >
        <DialogHeader className="border-b px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <UserAvatar name={adminName} />

              <div className="min-w-0">
                <DialogTitle className="truncate text-base font-semibold">
                  {adminName}
                </DialogTitle>

                <p className="truncate text-xs text-primary">
                  {adminRole}
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="size-8 shrink-0 cursor-pointer rounded-full"
            >
              <X className="size-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-5 px-5 py-4">
          <div className="grid gap-3">
            <InfoRow
              icon={CalendarDays}
              label={t('activityLogs.modal.date')}
              value={formatDate(createdAt)}
            />

            <InfoRow
              icon={Clock}
              label={t('activityLogs.modal.time')}
              value={formatTime(createdAt)}
            />

            <InfoRow
              icon={User}
              label={t('activityLogs.modal.targetEmployee')}
              value={targetEmployee}
            />

            <InfoRow
              icon={Monitor}
              label={t('activityLogs.modal.module')}
              value={log?.module}
            />

            <InfoRow
              icon={FileText}
              label={t('activityLogs.modal.action')}
              value={actionLabel}
            />
          </div>

          <div className="border-t pt-4">
            <h4 className="mb-3 text-sm font-semibold text-gray-900">
              {t('activityLogs.modal.description')}
            </h4>

            <p className="rounded-lg bg-gray-50 p-3 text-sm leading-6 text-gray-700">
              {log?.description || '—'}
            </p>
          </div>

          <div className="border-t pt-4">
            <h4 className="mb-3 text-sm font-semibold text-gray-900">
              {t('activityLogs.modal.changes')}
            </h4>

            {changes.length ? (
              <div className="space-y-2">
                {changes.map((change) => (
                  <ChangeItem
                    key={change.key}
                    label={change.label}
                    oldValue={change.oldValue}
                    newValue={change.newValue}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-lg bg-gray-50 p-4 text-center text-sm text-gray-500">
                {t('activityLogs.modal.noChanges')}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}