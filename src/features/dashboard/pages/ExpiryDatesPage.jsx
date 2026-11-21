import { useTranslation } from 'react-i18next';
import ExpiringEmployeesTables from '../components/ExpiringEmployeesTables';

export default function ExpiryDatesPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {t('navigation.expiryDates', 'Expiry Dates')}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {t('expiryDates.description', 'Employees with expiring contracts and National IDs')}
        </p>
      </div>
      <ExpiringEmployeesTables />
    </div>
  );
}
