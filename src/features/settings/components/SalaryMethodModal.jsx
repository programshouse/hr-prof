// src/features/setting/components/SalaryMethodModal.jsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function SalaryMethodModal({ open, onClose, onSave, initialData }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(() => ({
    name_en: initialData?.name_en || '',
    name_ar: initialData?.name_ar || '',
  }));

  if (!open) return null;

  const updateField = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-5 text-center text-sm font-semibold text-slate-800">
          {initialData
            ? t('settings.modals.paymentMethod.editTitle')
            : t('settings.modals.paymentMethod.addTitle')}
        </h2>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">
              {t('settings.modals.paymentMethod.nameEn')}
            </label>
            <input
              placeholder={t('settings.modals.paymentMethod.nameEnPlaceholder')}
              value={form.name_en}
              onChange={(e) => updateField('name_en', e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">
              {t('settings.modals.paymentMethod.nameAr')}
            </label>
            <input
              placeholder={t('settings.modals.paymentMethod.nameArPlaceholder')}
              value={form.name_ar}
              onChange={(e) => updateField('name_ar', e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 cursor-pointer rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {t('settings.actions.cancel')}
          </button>

          <button
            type="button"
            onClick={() => onSave(form)}
            className="bg-primary flex-1 cursor-pointer rounded-xl px-4 py-2 text-sm font-medium text-white"
          >
            {t('settings.actions.save')}
          </button>
        </div>
      </div>
    </div>
  );
}