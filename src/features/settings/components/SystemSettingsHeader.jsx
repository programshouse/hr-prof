import { useTranslation } from 'react-i18next';

export default function SystemSettingsHeader() {
  const { t } = useTranslation();

  return (
    <div className="min-w-0 text-start">
      <h1 className="text-xl font-bold">{t('settings.pageTitle')}</h1>
      <p className="text-gray">{t('settings.pageSubtitle')}</p>
    </div>
  );
}
