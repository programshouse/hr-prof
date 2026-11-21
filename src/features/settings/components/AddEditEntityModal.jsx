// src/features/setting/SystemSettingsAddEditEntityModal.jsx
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

export default function SystemSettingsAddEditEntityModal({
  open,
  label,
  value,
  onChange,
  onCancel,
  onSave,
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select?.();
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-xs"
      onClick={onCancel}
    >
      <div
        dir={isRTL ? 'rtl' : 'ltr'}
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-center text-sm font-semibold text-slate-800">
          {t('settings.entityModal.addEditTitle')}
        </h2>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-600">
            {t('settings.entityModal.nameLabel', { entity: label })}
          </label>
          <input
            ref={inputRef}
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-indigo-200"
            placeholder={t('settings.entityModal.namePlaceholder')}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>

        <div className="mt-6 flex gap-3">
          <Button
            variant="outline"
            className="flex-1 rounded-xl border-slate-200"
            onClick={onCancel}
          >
            {t('settings.actions.cancel')}
          </Button>
          <Button className="flex-1 rounded-xl bg-primary text-white" onClick={onSave}>
            {t('settings.actions.save')}
          </Button>
        </div>
      </div>
    </div>
  );
}
