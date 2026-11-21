import { useTranslation } from 'react-i18next';
import ExpiringEmployeesTables from '../components/ExpiringEmployeesTables';

export default function ExpiringContractsPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <ExpiringEmployeesTables type="contracts" />
    </div>
  );
}
