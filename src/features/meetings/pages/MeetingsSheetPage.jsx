import { useTranslation } from 'react-i18next';

const MeetingsSheetPage = () => {
  const { t } = useTranslation();

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">{t('navigation.meetings')}</h1>
      <p className="text-gray-600">
        {t('meetings.sheet.description')}
      </p>
    </div>
  );
};

export default MeetingsSheetPage;
