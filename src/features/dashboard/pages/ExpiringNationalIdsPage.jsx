import { useTranslation } from 'react-i18next';
import ExpiringEmployeesTables from '../components/ExpiringEmployeesTables';

export default function ExpiringNationalIdsPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <ExpiringEmployeesTables type="nationalIds" />
    </div>
  );
}
