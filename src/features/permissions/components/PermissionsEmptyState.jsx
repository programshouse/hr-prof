import { useTranslation } from 'react-i18next';

export default function PermissionsEmptyState() {
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
      <p className="text-sm text-slate-500">
        {t('permissions.emptyState')}
      </p>
    </div>
  );
}