import { useTranslation } from 'react-i18next';

export default function PermissionsSuperAdminNotice() {
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm font-medium text-amber-800">
      {t('permissions.superAdminNotice')}
    </div>
  );
}